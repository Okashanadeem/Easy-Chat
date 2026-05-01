@echo off
TITLE Easy Chat - Multi-Runner
echo ========================================
echo   EASY CHAT - STARTUP ORCHESTRATOR
echo ========================================

:: 1. Start Backend in a new window
echo Starting FastAPI Backend...
start cmd /k "cd backend && venv\Scripts\activate && python main.py"

:: 2. Start Frontend in a new window
echo Starting Next.js Frontend...
start cmd /k "cd frontend && npm run dev"

:: 3. Wait a few seconds for servers to initialize
echo Waiting for servers to warm up...
timeout /t 5 /nobreak > nul

:: 4. Open in Opera GX
:: We check common installation paths for Opera GX
set OPERA_PATH="%LOCALAPPDATA%\Programs\Opera GX\launcher.exe"
if not exist %OPERA_PATH% set OPERA_PATH="%PROGRAMFILES%\Opera GX\launcher.exe"

echo Launching Opera GX...
if exist %OPERA_PATH% (
    start "" %OPERA_PATH% "http://localhost:3000"
) else (
    echo Opera GX not found in standard path. Falling back to default browser...
    start http://localhost:3000
)

echo ========================================
echo   SYSTEMS DEPLOYED SUCCESSFULLY
echo ========================================
pause
