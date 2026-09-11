# 🚀 AI Resume Analyzer Agent & GraphMind Canvas Chat
> **Next-Generation, Low-Token AI Career & Resume Engineering Agent powered by Google Gemini 3.5 Flash Lite, ChromaDB RAG, and GraphMind DAG Whiteboard Architecture**

[![Gemini](https://img.shields.io/badge/Gemini_3.5_Flash_Lite-Sub--3s_Latency-F59E0B?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG_Vector_Store-8D5B4C?style=for-the-badge&logo=database&logoColor=white)](https://www.trychroma.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🏆 Problem Statement & Overview
Job seekers and candidates struggle to understand why their resumes fail applicant tracking systems (ATS) or get rejected by recruiters. Most AI resume evaluators are slow (15+ seconds), burn thousands of unnecessary tokens, generate generic non-actionable advice, and force users into 1-dimensional, linear chat threads where exploration paths are easily lost.

**Our Solution**: An intelligent, production-grade AI Agent that couples deterministic pre-processing with Google Gemini 3.5 Flash Lite, persistent ChromaDB RAG, and an innovative **GraphMind 2D Whiteboard Canvas Chat** where dialogue branches organically like a mind map.

---

## 🌟 Core Feature Suite

### 1. 📄 Multi-Format Resume Ingestion & Universal Normalization
- Supports **PDF**, **DOCX**, and **TXT** files, alongside direct plaintext pasting.
- Universal symbol and bracket header normalization ([SUMMARY], [EXPERIENCE], [EDUCATION], [PROJECTS]) to eliminate false-negative "missing heading" ATS errors.

### 2. ⚡ 5ms Zero-Token Deterministic ATS Audit
- **Metric Density %**: Instantly computes the ratio of bullets containing hard numbers, percentages, and scale metrics vs total bullets.
- **Weak Action Verb Flagging**: Detects passive phrases (
esponsible for, ssisted, helped, participated in) before touching the LLM.
- **Contact Completeness**: Universally verifies email, phone, LinkedIn, and GitHub links.

### 3. 🎯 Grounded Match Scoring (0–100%)
- **Multi-Category Radar**: Overall Job Match, Technical Skills Alignment, Experience Relevance, ATS Readability, and Soft Skills.
- Real-time animated circular gauge with color thresholds (Green $\ge$ 75%, Amber $\ge$ 50%, Red $<$ 50%).

### 4. ✍️ Google X-Y-Z Bullet Point Rewrite Lab
- Rewrites weak resume bullets into high-impact accomplishments using Google's formula:
  \text{Accomplished } [X] \text{ as measured by } [Y] \text{ by doing } [Z]
- 1-click **Copy to Clipboard** with instant visual confirmation feedback.

### 5. 🧠 GraphMind Interactive Node-Tree Canvas Chat (DAG Architecture)
- **Dialogue as a DAG**: Dialogue is modeled as a Directed Acyclic Graph (Node with parentId, childrenIds, coordinates (x, y)).
- **The "Ancestor Chaining" Secret**:
  - Clicking + Branch Follow-up on an agent node traverses Node -> Parent -> ... -> Root.
  - Reconstructs Branch_history and sends it to Gemini 3.5 Flash Lite.
  - **Zero crosstalk or pollution** from sibling branches, saving **60%–80% of tokens**!
- **Infinite 2D Viewport**: Pan and zoom across a 10,000px × 10,000px plane with coordinate transformation math.
- **SVG Cubic Bézier Connector Engine**: Smooth vertical curves with directional arrowhead markers re-rendered in real-time during node drag.
- **Auto-Organize Layout**: Breadth-First-Search (BFS) tree spreading algorithm that levels branches and eliminates card overlaps.

### 6. 🎨 Editorial Cream-White & Light-Brown Design
- **Editorial Aesthetic**: Silk Cream (#FAF7F2), Sand borders (#E2D7C5), Warm Terracotta (#8D5B4C), and Deep Espresso (#291E1A).
- **Floating Dynamic Island (Dock)**: Persistent pill dock anchored at the bottom of the viewport.
- **Scroll-Linked 3D Capability Deck**: Interactive cards that fan out in 3D perspective as you scroll.
- **Live Micro-Widgets**: Interactive ATS strictness toggle, keyword match previewer, and impact formula switcher.
- **Freeform Draggable Sticky Note**: Desktop canvas note with inertial drag physics and dynamic elevation drop shadow.

### 7. 🌓 Day / Night Mode (Dark Mode)
- **Day Mode**: Silk Cream & Warm Terracotta.
- **Night Mode**: Roasted Espresso (#14100E), Dark Cocoa surfaces (#1E1714), and Luminous Amber accents (#E09A67).
- High-contrast custom feedback containers ensuring 100% legibility across all themes.

---

## 🏗️ System Architecture

`
                                [User / Browser]
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
[Landing Page Overview]                                    [GraphMind 2D Whiteboard]
• 3D Capability Deck                                       • Infinite Canvas (10k x 10k)
• Live Micro-Widgets                                       • DAG Dialogue Nodes
• Dynamic Island Dock                                      • SVG Cubic Bézier Engine
        │                                                  • Ancestor Chaining
        ▼                                                             │
[Agent Workspace View]                                                │
• Multi-format Parser (PDF/DOCX/TXT)                                  │
• 5ms ATS Heuristic Scanner (0 Tokens)                                │
• Traditional Linear Chat Window                                      │
        │                                                             │
        ├──────────────────────────────┬──────────────────────────────┘
        ▼                              ▼
[ChromaDB Vector Store]     [Google Gemini 3.5 Flash Lite]
• gemini-embedding-001      • Strict Structured Pydantic JSON
• Target JD Chunks          • Sub-3s Generation Latency
• Industry Benchmarks       • Short-Term Session Memory
`

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11, FastAPI, Google GenAI SDK (gemini-3.5-flash-lite, gemini-embedding-001), ChromaDB, Pydantic v2, pypdf, python-docx, Uvicorn.
- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+), GSAP & ScrollTrigger, Lenis Smooth Scroll, Lucide Icons, Marked.js.

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
`ash
git clone https://github.com/Hackerop777/ai-resume-analyzer.git
cd ai-resume-analyzer
`

### 2. Set Up Virtual Environment & Dependencies
`ash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
`

### 3. Configure Environment Variables
Create a .env file based on .env.example:
`ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
EMBEDDING_MODEL=gemini-embedding-001
HOST=127.0.0.1
PORT=8000
`
> Get your free Gemini API key at [Google AI Studio](https://aistudio.google.com/).

### 4. Run the Application
`ash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
`
Open your browser to: **http://127.0.0.1:8000**

Or on Windows, simply double-click **
un_demo.bat**!

---

## 🧪 Running Integration Tests
To verify all 5 core modules (parser, ATS scanner, ChromaDB, Gemini 3.5 Flash Lite, and short-term memory):
`ash
python test_agent.py
`

---

## 📄 License
MIT License. Free to use, adapt, and build upon for hackathons and production deployments!
