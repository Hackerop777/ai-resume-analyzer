import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for the AI Resume Analyzer project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from the project directory
ENV_FILE = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE)

# API Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")

# Server Configurations
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Storage paths on D: drive strictly
CHROMA_PERSIST_DIR = str(BASE_DIR / "chroma_db")
UPLOAD_TEMP_DIR = str(BASE_DIR / "temp_uploads")

os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(UPLOAD_TEMP_DIR, exist_ok=True)
