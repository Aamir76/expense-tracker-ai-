@echo off
echo Cleaning up port 3000...

REM Kill any process using port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Optional: Kill all node processes (uncomment if needed)
REM taskkill /F /IM node.exe 2>nul

echo Starting development server...
npm run dev
