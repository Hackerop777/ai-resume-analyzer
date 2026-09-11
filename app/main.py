import os
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import BASE_DIR, HOST, PORT, GEMINI_MODEL
from app.agent.resume_agent import ResumeAnalyzerAgent
from app.agent.schemas import ChatRequest, ChatResponse
from app.samples.sample_data import SAMPLE_PROFILES

app = FastAPI(
    title="AI Resume Analyzer Agent",
    description="Low-token, high-speed AI Resume Analyzer powered by Gemini 3.5 Flash Lite & ChromaDB RAG",
    version="1.0.0"
)

# Enable CORS for local testing flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agent instance
agent = ResumeAnalyzerAgent()

# Mount static folder
static_dir = os.path.join(BASE_DIR, "app", "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "AI Resume Analyzer API is running. UI file loading..."}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "agent": "AI Resume Analyzer",
        "model": GEMINI_MODEL,
        "features": ["RAG (ChromaDB)", "Gemini 3.5 Flash Lite", "ATS Scanner", "XYZ Rewrites", "Short-term Memory"]
    }

@app.get("/api/samples")
async def get_samples():
    """Returns pre-loaded sample profiles for 1-click judging tests."""
    return SAMPLE_PROFILES

@app.post("/api/analyze")
async def analyze_resume(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    jd_text: str = Form(...),
    external_doc_text: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None)
):
    """Analyzes a resume against a target job description."""
    if not session_id or not session_id.strip():
        session_id = f"sess_{uuid.uuid4().hex[:8]}"

    resume_bytes = None
    filename = "resume.txt"

    if resume_file:
        resume_bytes = await resume_file.read()
        filename = resume_file.filename or "resume.pdf"

    if not resume_bytes and (not resume_text or not resume_text.strip()):
        raise HTTPException(status_code=400, detail="Please upload a resume file (PDF/DOCX/TXT) or paste resume text.")

    if not jd_text or not jd_text.strip():
        raise HTTPException(status_code=400, detail="Target Job Description is required.")

    try:
        result = agent.analyze(
            resume_bytes=resume_bytes,
            resume_filename=filename,
            resume_text_override=resume_text,
            jd_text=jd_text,
            external_doc_text=external_doc_text,
            session_id=session_id
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.post("/api/chat")
async def follow_up_chat(payload: ChatRequest):
    """Handles follow-up questions with short-term memory and DAG branch ancestor context."""
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        res = agent.chat_followup(
            session_id=payload.session_id,
            user_message=payload.message,
            branch_history=payload.branch_history
        )
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/canvas")
async def canvas_direct_view():
    """Serves index.html with direct canvas view routing."""
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "GraphMind Canvas Chat view loading..."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
