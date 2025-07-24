@echo off
REM ========================================
REM SmartFactory Studio - Clean Restart
REM ========================================

echo.
echo Stopping existing node and npm processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo Waiting for services to stop...
timeout /t 3 /nobreak >nul

echo Starting backend server...
cd backend
start "Backend Server" cmd /k "node src/simple-server.js"
cd ..

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul 