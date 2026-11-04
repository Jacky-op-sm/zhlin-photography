@echo off
setlocal
cd /d "%~dp0..\.."

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js 24 is required. Install it from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\.bin\next.cmd" (
    echo Installing locked dependencies...
    call npm ci
    if errorlevel 1 (
        echo Dependency installation failed.
        pause
        exit /b 1
    )
)

echo Starting Zhlin Photography at http://localhost:3000
call npm run dev
if errorlevel 1 (
    echo Development server stopped with an error.
    pause
    exit /b 1
)
endlocal
