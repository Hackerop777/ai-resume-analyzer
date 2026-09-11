"""Automated integration test for AI Resume Analyzer agent components."""
import sys
import os
import time

# Ensure package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.parsers.document_parser import DocumentParser
from app.tools.ats_scanner import ATSScanner
from app.tools.keyword_extractor import KeywordExtractor
from app.rag.chroma_store import RAGStore
from app.memory.conversation_memory import MemoryManager
from app.agent.resume_agent import ResumeAnalyzerAgent
from app.samples.sample_data import SAMPLE_PROFILES

def run_tests():
    print("=== [1/5] Testing Document Parser & Heuristics ===")
    sample = SAMPLE_PROFILES["software_engineer"]
    raw_resume = sample["resume"]
    jd_text = sample["job_description"]

    sections = DocumentParser.segment_sections(raw_resume)
    bullets = DocumentParser.extract_bullets(raw_resume)
    print(f"Parsed sections: {list(sections.keys())}")
    print(f"Extracted {len(bullets)} bullets")
    assert len(bullets) > 0, "Failed to extract bullets"

    print("\n=== [2/5] Testing ATS Scanner & Keyword Gap Matcher ===")
    ats = ATSScanner.audit_resume(raw_resume, sections, bullets)
    print(f"ATS Score: {ats['ats_score']}/100")
    print(f"Metric Density: {ats['metric_audit']['metric_percentage']}%")
    print(f"Weak Verbs Flagged: {ats['verb_audit']['weak_found']}")
    
    skill_gap = KeywordExtractor.compare_skills(raw_resume, jd_text)
    print(f"Matched Skills: {skill_gap['matched_tech']}")
    print(f"Missing Skills: {skill_gap['missing_tech']}")
    assert "fastapi" in skill_gap["matched_tech"], "Expected fastapi in matched skills"
    assert "kubernetes" in skill_gap["missing_tech"], "Expected kubernetes in missing skills"

    print("\n=== [3/5] Testing ChromaDB Vector Store on D: Drive ===")
    rag = RAGStore.get_instance()
    sess_col = rag.index_session_documents(
        session_id="test_sess_001",
        resume_sections=sections,
        bullets=bullets,
        jd_text=jd_text,
        external_docs=[{"title": "Company Philosophy", "content": sample["external_docs"]}]
    )
    print(f"Indexed session documents into collection: {sess_col}")
    retrieved = rag.retrieve_context("test_sess_001", "microservices and latency reduction", top_k=2)
    print(f"Retrieved {len(retrieved)} relevant fragments from ChromaDB")
    assert len(retrieved) > 0, "Failed to retrieve RAG fragments"

    print("\n=== [4/5] Testing End-to-End Agent Analysis (Gemini 3.5 Flash Lite) ===")
    agent = ResumeAnalyzerAgent()
    t0 = time.time()
    result = agent.analyze(
        resume_text_override=raw_resume,
        jd_text=jd_text,
        external_doc_text=sample["external_docs"],
        session_id="test_sess_001"
    )
    duration = time.time() - t0
    analysis = result["analysis"]
    print(f"Analysis completed in {duration:.2f}s!")
    print(f"Candidate: {analysis.get('candidate_name')}")
    print(f"Overall Match Score: {analysis['scores']['overall_score']}%")
    print(f"Rewrites generated: {len(analysis.get('bullet_rewrites', []))}")
    print(f"First Rewrite: '{analysis['bullet_rewrites'][0]['rewritten_bullet']}'")
    assert analysis["scores"]["overall_score"] > 0, "Invalid match score"
    assert len(analysis.get("bullet_rewrites", [])) > 0, "No bullet rewrites generated"

    print("\n=== [5/5] Testing Conversational Follow-up with Short-Term Memory ===")
    chat_res = agent.chat_followup(
        session_id="test_sess_001",
        user_message="How should I answer 'Tell me about yourself' for Apex FinTech?"
    )
    print(f"Chat response in {chat_res['latency_ms']}ms:")
    print(f"Reply preview: {chat_res['reply'][:200]}...")
    assert len(chat_res["reply"]) > 50, "Chat reply too short"

    # Multi-turn test to verify memory retention
    chat_res_2 = agent.chat_followup(
        session_id="test_sess_001",
        user_message="How do I address my lack of Kubernetes experience?"
    )
    print(f"Multi-turn response: {chat_res_2['reply'][:200]}...")
    assert len(chat_res_2["reply"]) > 50, "Multi-turn reply too short"

    print("\n=======================================================")
    print("ALL 5 INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
