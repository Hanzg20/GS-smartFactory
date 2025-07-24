@echo off
chcp 65001 >nul
REM SmartFactory Studio 一键无人值守启动脚本
cd /d %~dp0

REM 进入项目根目录
cd ..

REM 检查环境变量文件
if not exist .env (
    if exist env.example (
        echo 未找到.env文件，正在从env.example创建...
        copy env.example .env
        echo .env文件已创建，请检查并配置相关参数！
        pause
    ) else (
        echo 错误：未找到env.example文件！
        pause
        exit /b 1
    )
)

REM 1. 检查并结束占用端口的进程
echo 检查端口占用情况...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 正在结束占用3000端口的进程: %%a
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo 正在结束占用3001端口的进程: %%a
    taskkill /F /PID %%a >nul 2>nul
)

REM 2. 启动后端
cd backend
if not exist node_modules (
    echo 正在安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo 错误：后端依赖安装失败！
        pause
        exit /b 1
    )
)
echo 启动后端服务...
start "backend" cmd /c "npm start"

REM 3. 启动前端
cd ..\frontend
if not exist node_modules (
    echo 正在安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo 错误：前端依赖安装失败！
        pause
        exit /b 1
    )
)
echo 启动前端服务...
start "frontend" cmd /c "npm run dev"

REM 4. 等待服务启动并检查状态
echo 等待服务启动...
timeout /t 5 /nobreak >nul

REM 检查服务是否成功启动
set /a retries=0
:check_services
curl -s http://localhost:3001/health >nul 2>nul
if errorlevel 1 (
    set /a retries+=1
    if %retries% leq 6 (
        echo 等待后端服务启动...
        timeout /t 5 /nobreak >nul
        goto check_services
    ) else (
        echo 错误：后端服务启动失败！
        pause
        exit /b 1
    )
)

REM 5. 自动打开前端页面
echo 自动打开前端页面...
start http://localhost:3000

echo =============================
echo 所有服务已自动启动！
echo 前端: http://localhost:3000
echo 后端: http://localhost:3001
echo =============================
echo 提示：按Ctrl+C可以结束所有服务
echo =============================
cmd /k 