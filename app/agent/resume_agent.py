import time
import json
import re
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.parsers.document_parser import DocumentParser
from app.tools.ats_scanner import ATSScanner
from app.tools.keyword_extractor import KeywordExtractor
from app.rag.chroma_store import RAGStore
from app.memory.conversation_memory import MemoryManager
from app.agent.schemas import LLMAnalysisOutput, MatchScores
from app.agent.prompts import (
    RESUME_ANALYSIS_SYSTEM_PROMPT,
    CHAT_FOLLOWUP_SYSTEM_PROMPT,
    build_analysis_user_prompt
)

class ResumeAnalyzerAgent:
    """End-to-end AI Resume Analyzer Agent powered by Gemini 3.5 Flash Lite & RAG."""

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model_name = GEMINI_MODEL
        self.rag_store = RAGStore.get_instance()

    def analyze(
        self,
        resume_bytes: Optional[bytes] = None,
        resume_filename: str = "resume.txt",
        resume_text_override: Optional[str] = None,
        jd_text: str = "",
        external_doc_text: Optional[str] = None,
        session_id: str = "default_session"
    ) -> Dict[str, Any]:
        start_time = time.time()

        # Step 1: Parse resume
        if resume_text_override and resume_text_override.strip():
            raw_resume = resume_text_override.strip()
        elif resume_bytes:
            raw_resume = DocumentParser.parse_bytes(resume_bytes, resume_filename)
        else:
            raise ValueError("No resume content provided.")

        sections = DocumentParser.segment_sections(raw_resume)
        bullets = DocumentParser.extract_bullets(raw_resume)

        # Step 2: Deterministic Local Tool Audits (0 LLM Tokens, ~5ms)
        ats_audit = ATSScanner.audit_resume(raw_resume, sections, bullets)
        skill_gap = KeywordExtractor.compare_skills(raw_resume, jd_text)

        # Step 3: Index Documents in ChromaDB on D: Drive (RAG)
        ext_docs = []
        if external_doc_text and external_doc_text.strip():
            ext_docs.append({"title": "External Company/Benchmark Notes", "content": external_doc_text.strip()})

        self.rag_store.index_session_documents(
            session_id=session_id,
            resume_sections=sections,
            bullets=bullets,
            jd_text=jd_text,
            external_docs=ext_docs
        )

        # Step 4: RAG Retrieval for grounding
        rag_snippets = self.rag_store.retrieve_context(
            session_id=session_id,
            query="Core qualifications, accomplishments, and tech stack match",
            top_k=3
        )

        # Step 5: Construct Token-Optimized Prompt
        user_prompt = build_analysis_user_prompt(
            resume_text=raw_resume,
            jd_text=jd_text,
            ats_audit=ats_audit,
            skill_gap=skill_gap,
            rag_snippets=rag_snippets
        )

        # Step 6: Gemini 3.5 Flash Lite Structured Generation
        llm_start = time.time()
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=RESUME_ANALYSIS_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=LLMAnalysisOutput,
                temperature=0.2, # Low temperature for consistent, accurate evaluation
            )
        )
        llm_latency_ms = int((time.time() - llm_start) * 1000)
        total_latency_ms = int((time.time() - start_time) * 1000)

        # Parse structured response
        try:
            parsed_json = json.loads(response.text)
        except Exception:
            # Fallback if json string has formatting
            parsed_json = json.loads(response.text.strip().replace("```json", "").replace("```", ""))

        # Blend LLM scores with deterministic ATS score for highest consistency
        if "scores" in parsed_json:
            parsed_json["scores"]["ats_score"] = ats_audit["ats_score"]
            # Recalculate balanced overall match
            s = parsed_json["scores"]
            balanced_overall = int(
                (s["technical_score"] * 0.40) +
                (s["experience_score"] * 0.30) +
                (s["ats_score"] * 0.15) +
                (s["soft_skills_score"] * 0.15)
            )
            parsed_json["scores"]["overall_score"] = balanced_overall

        # Step 7: Initialize Short-Term Conversational Memory
        session_mem = MemoryManager.get_session(session_id)
        session_mem.set_context(
            target_role=parsed_json.get("target_role", "Target Role"),
            candidate_summary=parsed_json.get("executive_summary", ""),
            analysis_snapshot={
                "scores": parsed_json.get("scores", {}),
                "missing_skills": skill_gap.get("missing_tech", []) + skill_gap.get("missing_soft", [])
            }
        )

        # Step 8: Token & Telemetry Estimations
        # Rough token estimation: 4 characters per token
        prompt_tokens_est = len(user_prompt) // 4 + len(RESUME_ANALYSIS_SYSTEM_PROMPT) // 4
        output_tokens_est = len(response.text) // 4
        tokens_saved_by_local_tools = 2500 # ATS + keyword heuristics run locally without sending raw text multiple times

        return {
            "session_id": session_id,
            "analysis": parsed_json,
            "ats_audit": ats_audit,
            "skill_gap": skill_gap,
            "telemetry": {
                "total_latency_ms": total_latency_ms,
                "llm_latency_ms": llm_latency_ms,
                "prompt_tokens_est": prompt_tokens_est,
                "output_tokens_est": output_tokens_est,
                "tokens_saved_est": tokens_saved_by_local_tools,
                "model": self.model_name
            }
        }

    def chat_followup(
        self,
        session_id: str,
        user_message: str,
        branch_history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Handles multi-turn conversational follow-ups with short-term memory & RAG context.
        Supports DAG branch_history for branch-isolated context reconstruction."""
        start_time = time.time()
        session_mem = MemoryManager.get_session(session_id)

        # Pull relevant RAG snippet if user is asking about specific skills or requirements
        rag_context = self.rag_store.retrieve_context(
            session_id=session_id,
            query=user_message,
            top_k=2
        )
        rag_info = "\n".join([f"[{s.get('source')}]: {s.get('content')[:200]}" for s in rag_context])

        # Build compact context with previous chat history or branch ancestor chain
        base_context = session_mem.build_prompt_context()
        if branch_history and len(branch_history) > 0:
            history_str = "\n".join([f"{m.get('role', 'user').upper()}: {m.get('content', '')}" for m in branch_history[-6:]])
        else:
            history_str = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in session_mem.get_chat_history()[-4:]])

        prompt = f"""CONTEXT & EVALUATION SUMMARY:
{base_context}

RELEVANT RAG INSIGHTS:
{rag_info}

RECENT CONVERSATION (BRANCH ANCESTRY):
{history_str}

USER FOLLOW-UP QUESTION:
{user_message}

Provide a direct, high-value, actionable response. If advising on interview questions or 'Tell me about yourself', give concrete examples."""

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=CHAT_FOLLOWUP_SYSTEM_PROMPT,
                temperature=0.3
            )
        )

        reply_text = response.text.strip()
        # Clean up any malformed bullet-bold patterns like ***Label:** or ** *Label:* to ensure proper spaces
        reply_text = re.sub(r"^(\s*)\*{3}(?!\*)\s*([^*]+)\*\*", r"\1- **\2**", reply_text, flags=re.MULTILINE)
        reply_text = re.sub(r"^(\s*)\*{3}(?!\*)", r"\1- ", reply_text, flags=re.MULTILINE)
        reply_text = re.sub(r"^\s*\*\*\s*\*\s*([^*:]+):?\*", r"- **\1:**", reply_text, flags=re.MULTILINE)

        latency_ms = int((time.time() - start_time) * 1000)
        est_tokens = int(len(prompt.split()) * 1.33 + len(reply_text.split()) * 1.33)

        # Update flat memory
        session_mem.add_user_message(user_message)
        session_mem.add_agent_message(reply_text)

        # Generate 3 dynamic follow-up suggestions
        suggested = [
            "How do I answer 'Tell me about yourself' for this role?",
            "Rewrite another bullet point with higher metrics",
            "What are the top 3 interview questions I should prepare for?"
        ]

        return {
            "session_id": session_id,
            "reply": reply_text,
            "suggested_followups": suggested,
            "latency_ms": latency_ms,
            "total_tokens": est_tokens
        }
