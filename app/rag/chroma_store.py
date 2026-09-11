import os
import uuid
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from google import genai
from app.config import GEMINI_API_KEY, EMBEDDING_MODEL, CHROMA_PERSIST_DIR
from app.rag.knowledge_base import KNOWLEDGE_BASE_DOCS

class GeminiEmbeddingFunction(EmbeddingFunction):
    """Embeds texts using Google Gemini embedding model with batching."""
    def __init__(self, api_key: str, model_name: str = EMBEDDING_MODEL):
        self.api_key = api_key
        self.model_name = model_name
        self.client = genai.Client(api_key=self.api_key)

    def __call__(self, input: Documents) -> Embeddings:
        if not input:
            return []
        
        cleaned_docs = [(doc.strip() if doc and doc.strip() else "empty")[:2000] for doc in input]
        embeddings: List[List[float]] = []

        # Batch in chunks of 20 for speed and rate-limit compliance
        batch_size = 20
        for i in range(0, len(cleaned_docs), batch_size):
            chunk = cleaned_docs[i:i + batch_size]
            try:
                res = self.client.models.embed_content(
                    model=self.model_name,
                    contents=chunk
                )
                for item in res.embeddings:
                    embeddings.append(item.values)
            except Exception as e:
                # Fallback: embed one by one if batch fails
                for doc in chunk:
                    r = self.client.models.embed_content(model=self.model_name, contents=doc)
                    embeddings.append(r.embeddings[0].values)

        return embeddings

class RAGStore:
    """Manages ChromaDB collections on D: drive for RAG over resumes, JDs, and external docs."""
    _instance = None

    def __init__(self):
        self.persist_dir = CHROMA_PERSIST_DIR
        self.client = chromadb.PersistentClient(path=self.persist_dir)
        self.embedding_fn = GeminiEmbeddingFunction(api_key=GEMINI_API_KEY)
        self._init_collections()

    @classmethod
    def get_instance(cls) -> "RAGStore":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _init_collections(self):
        # Knowledge base collection for industry guidelines & ATS rules
        self.kb_col = self.client.get_or_create_collection(
            name="knowledge_base",
            embedding_function=self.embedding_fn
        )
        # Populate KB if empty
        if self.kb_col.count() == 0:
            docs = [doc["content"] for doc in KNOWLEDGE_BASE_DOCS]
            metadatas = [{"title": doc["title"]} for doc in KNOWLEDGE_BASE_DOCS]
            ids = [doc["id"] for doc in KNOWLEDGE_BASE_DOCS]
            self.kb_col.add(documents=docs, metadatas=metadatas, ids=ids)

    def index_session_documents(self, session_id: str, resume_sections: Dict[str, str], bullets: List[str], jd_text: str, external_docs: Optional[List[Dict[str, str]]] = None):
        """Indexes user's resume, target JD, and optional external docs into a dedicated session collection."""
        collection_name = f"session_{session_id.replace('-', '_')[:40]}"
        
        # Reset collection if exists for clean session state
        try:
            self.client.delete_collection(name=collection_name)
        except Exception:
            pass

        col = self.client.create_collection(
            name=collection_name,
            embedding_function=self.embedding_fn
        )

        docs = []
        metadatas = []
        ids = []

        # 1. Index Core Resume Sections (Experience, Skills, Projects, Summary)
        priority_sections = ["experience", "skills", "projects", "summary"]
        for sec_name in priority_sections:
            sec_text = resume_sections.get(sec_name, "")
            if sec_text and len(sec_text.strip()) > 15:
                docs.append(sec_text[:1500])
                metadatas.append({"type": "resume_section", "section": sec_name})
                ids.append(f"resume_sec_{sec_name}")

        # 2. Index Top Resume Bullets (up to 8 high-signal bullets)
        for idx, bullet in enumerate(bullets[:8]):
            if len(bullet.strip()) > 20:
                docs.append(bullet[:400])
                metadatas.append({"type": "resume_bullet", "index": idx})
                ids.append(f"resume_bullet_{idx}")

        # 3. Index Job Description Key Chunks (top 6 requirement lines)
        jd_lines = [l.strip() for l in jd_text.splitlines() if len(l.strip()) > 25]
        for idx, line in enumerate(jd_lines[:8]):
            docs.append(line[:400])
            metadatas.append({"type": "job_description", "chunk": idx})
            ids.append(f"jd_chunk_{idx}")

        # 4. Index External Documents (e.g. user-provided guidelines, company values)
        if external_docs:
            for d_idx, ext_doc in enumerate(external_docs[:3]):
                content = ext_doc.get("content", "")
                title = ext_doc.get("title", f"external_doc_{d_idx}")
                if len(content.strip()) > 20:
                    docs.append(content[:1200])
                    metadatas.append({"type": "external_source", "title": title})
                    ids.append(f"ext_doc_{d_idx}")

        if docs:
            col.add(documents=docs, metadatas=metadatas, ids=ids)

        return collection_name

    def retrieve_context(self, session_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieves top-k relevant fragments from the user's session collection and knowledge base."""
        collection_name = f"session_{session_id.replace('-', '_')[:40]}"
        results = []

        # Query session documents
        try:
            col = self.client.get_collection(
                name=collection_name,
                embedding_function=self.embedding_fn
            )
            count = col.count()
            if count > 0:
                session_res = col.query(query_texts=[query], n_results=min(top_k, count))
                if session_res and session_res.get("documents") and session_res["documents"][0]:
                    for doc, meta in zip(session_res["documents"][0], session_res["metadatas"][0]):
                        results.append({"content": doc, "metadata": meta, "source": "session_docs"})
        except Exception:
            pass

        # Also pull top guideline from knowledge base for grounding
        try:
            kb_res = self.kb_col.query(query_texts=[query], n_results=1)
            if kb_res and kb_res.get("documents") and kb_res["documents"][0]:
                results.append({
                    "content": kb_res["documents"][0][0],
                    "metadata": kb_res["metadatas"][0][0],
                    "source": "industry_benchmark"
                })
        except Exception:
            pass

        return results
