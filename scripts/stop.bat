@echo off
chcp 65001 >nul
REM SmartFactory Studio 停止脚本
echo ========================================
echo 正在停止 SmartFactory Studio 服务...
echo ========================================

REM 停止占用端口的进程
echo 停止后端服务 (端口 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo   结束进程: %%a
    taskkill /F /PID %%a >nul 2>nul
)

echo 停止前端服务 (端口 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo   结束进程: %%a
    taskkill /F /PID %%a >nul 2>nul
)

echo.
echo 所有服务已停止！
pause 