@echo off
chcp 65001 >nul
REM SmartFactory Studio Startup Script
cd /d %~dp0
cd ..

REM Check and kill existing processes
echo Checking ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process on port 3000: %%a
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process on port 3001: %%a
    taskkill /F /PID %%a >nul 2>nul
)

REM Start backend
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Backend dependency installation failed!
        pause
        exit /b 1
    )
)
echo Starting backend service...
start "backend" cmd /c "npm run dev"

REM Start frontend
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Frontend dependency installation failed!
        pause
        exit /b 1
    )
)
echo Starting frontend service...
start "frontend" cmd /c "npm run dev"

REM Wait for services
echo Waiting for services...
timeout /t 5 /nobreak >nul

REM Check services
set /a retries=0
:check_services
curl -s http://localhost:3001/health >nul 2>nul
if errorlevel 1 (
    set /a retries+=1
    if %retries% leq 6 (
        echo Waiting for backend service...
        timeout /t 5 /nobreak >nul
        goto check_services
    ) else (
        echo Error: Backend service failed to start!
        pause
        exit /b 1
    )
)

REM Open frontend
echo Opening frontend...
start http://localhost:3000

echo =============================
echo All services started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo =============================
echo Tip: Press Ctrl+C to stop all services
echo =============================
cmd /k 