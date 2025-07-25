@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
REM SmartFactory Studio Advanced Startup Script
cd /d %~dp0
cd ..

echo ========================================
echo SmartFactory Studio Startup Script
echo ========================================
echo Current directory: %CD%

REM Check Node.js installation
node --version >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM 1. Kill existing processes
echo.
echo [1/5] Cleaning up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo   Killing process: %%a
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo   Killing process: %%a
    taskkill /F /PID %%a >nul 2>nul
)

REM 2. Start backend
echo.
echo [2/5] Starting backend service...
if not exist "backend" (
    echo Error: backend directory not found
    pause
    exit /b 1
)

cd backend
if not exist node_modules (
    echo   Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Backend dependency installation failed
        pause
        exit /b 1
    )
)

echo   Starting backend service...
start "SmartFactory Backend" cmd /c "npm run dev"
cd ..

REM 3. Start frontend
echo.
echo [3/5] Starting frontend service...
if not exist "frontend" (
    echo Error: frontend directory not found
    pause
    exit /b 1
)

cd frontend
if not exist node_modules (
    echo   Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Frontend dependency installation failed
        pause
        exit /b 1
    )
)

echo   Starting frontend service...
start "SmartFactory Frontend" cmd /c "npm run dev"
cd ..

REM 4. Wait for services
echo.
echo [4/5] Waiting for services...
timeout /t 3 /nobreak >nul

echo   Checking service status...
set /a backend_ready=0
set /a frontend_ready=0

for /l %%i in (1,1,10) do (
    netstat -ano | findstr :3001 >nul
    if not errorlevel 1 set /a backend_ready=1
    
    netstat -ano | findstr :3000 >nul
    if not errorlevel 1 set /a frontend_ready=1
    
    if !backend_ready!==1 if !frontend_ready!==1 goto :services_ready
    
    echo   Waiting... (%%i/10)
    timeout /t 2 /nobreak >nul
)

:services_ready
echo.
echo [5/5] Service status:
if %backend_ready%==1 (
    echo   ✓ Backend service is running (port: 3001)
) else (
    echo   ✗ Backend service failed to start
)

if %frontend_ready%==1 (
    echo   ✓ Frontend service is running (port: 3000)
) else (
    echo   ✗ Frontend service failed to start
)

REM 5. Open browser
if %frontend_ready%==1 (
    echo.
    echo Opening frontend page...
    start http://localhost:3000
)

echo.
echo ========================================
echo Startup complete!
echo ========================================
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
echo Press any key to exit...
pause >nul 