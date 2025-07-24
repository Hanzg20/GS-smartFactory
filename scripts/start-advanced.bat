@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
REM SmartFactory Studio 高级一键无人值守启动脚本
cd /d %~dp0

echo ========================================
echo SmartFactory Studio 启动脚本
echo ========================================
echo 当前目录: %CD%

REM 检查Node.js是否安装
node --version >nul 2>nul
if errorlevel 1 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 1. 结束占用端口的进程
echo.
echo [1/5] 清理端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo   结束进程: %%a
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo   结束进程: %%a
    taskkill /F /PID %%a >nul 2>nul
)

REM 2. 启动后端
echo.
echo [2/5] 启动后端服务...
if not exist "backend" (
    echo 错误: 未找到backend目录
    pause
    exit /b 1
)

cd backend
if not exist node_modules (
    echo   安装后端依赖...
    npm install
    if errorlevel 1 (
        echo 错误: 后端依赖安装失败
        pause
        exit /b 1
    )
)

echo   启动后端服务...
start "SmartFactory Backend" cmd /c "npm start"
cd ..

REM 3. 启动前端
echo.
echo [3/5] 启动前端服务...
if not exist "frontend" (
    echo 错误: 未找到frontend目录
    pause
    exit /b 1
)

cd frontend
if not exist node_modules (
    echo   安装前端依赖...
    npm install
    if errorlevel 1 (
        echo 错误: 前端依赖安装失败
        pause
        exit /b 1
    )
)

echo   启动前端服务...
start "SmartFactory Frontend" cmd /c "npm run dev"
cd ..

REM 4. 等待服务启动并检查状态
echo.
echo [4/5] 等待服务启动...
timeout /t 3 /nobreak >nul

echo   检查服务状态...
set /a backend_ready=0
set /a frontend_ready=0

for /l %%i in (1,1,10) do (
    netstat -ano | findstr :3001 >nul
    if not errorlevel 1 set /a backend_ready=1
    
    netstat -ano | findstr :5173 >nul
    if not errorlevel 1 set /a frontend_ready=1
    
    if !backend_ready!==1 if !frontend_ready!==1 goto :services_ready
    
    echo   等待中... (%%i/10)
    timeout /t 2 /nobreak >nul
)

:services_ready
echo.
echo [5/5] 服务状态检查:
if %backend_ready%==1 (
    echo   ✓ 后端服务已启动 (端口: 3001)
) else (
    echo   ✗ 后端服务启动失败
)

if %frontend_ready%==1 (
    echo   ✓ 前端服务已启动 (端口: 5173)
) else (
    echo   ✗ 前端服务启动失败
)

REM 5. 自动打开浏览器
if %frontend_ready%==1 (
    echo.
    echo 自动打开前端页面...
    start http://localhost:5173
)

echo.
echo ========================================
echo 启动完成！
echo ========================================
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3001
echo.
echo 按任意键退出...
pause >nul 