# AI Resume Analyzer Agent - Hackathon Launcher (PowerShell)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       Starting AI Resume Analyzer (Powered by Gemini 3.5 Flash Lite)  " -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

$PythonExe = "d:\Nihal folder\.venv\Scripts\python.exe"

if (-not (Test-Path $PythonExe)) {
    Write-Error "Python executable not found at $PythonExe!"
    Exit 1
}

Write-Host "`nLaunching browser at http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process "http://127.0.0.1:8000"

Write-Host "Starting FastAPI Application with Uvicorn on D: drive...`n" -ForegroundColor Yellow
& $PythonExe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
