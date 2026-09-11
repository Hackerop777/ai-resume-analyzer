@echo off
title AI Resume Analyzer Agent - Hackathon Demo
echo ======================================================================
echo           Starting AI Resume Analyzer (Gemini 3.5 Flash Lite)
echo ======================================================================
echo.
cd /d "%~dp0"
echo [1/2] Activating Python Virtual Environment...
set PYTHON_EXE="d:\Nihal folder\.venv\Scripts\python.exe"

if not exist %PYTHON_EXE% (
    echo Python executable not found at %PYTHON_EXE%!
    pause
    exit /b 1
)

echo [2/2] Launching FastAPI Web Application...
start "" http://127.0.0.1:8000
%PYTHON_EXE% -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
