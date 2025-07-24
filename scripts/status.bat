@echo off
chcp 65001 >nul
REM SmartFactory Studio 状态检查脚本
echo ========================================
echo SmartFactory Studio 服务状态
echo ========================================

echo.
echo 端口检查:
echo ---------

netstat -ano | findstr :3001 >nul
if errorlevel 1 (
    echo ✗ 后端服务未运行 (端口: 3001)
) else (
    echo ✓ 后端服务运行中 (端口: 3001)
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        echo   进程ID: %%a
    )
)

netstat -ano | findstr :5173 >nul
if errorlevel 1 (
    echo ✗ 前端服务未运行 (端口: 5173)
) else (
    echo ✓ 前端服务运行中 (端口: 5173)
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        echo   进程ID: %%a
    )
)

echo.
echo 访问地址:
echo ---------
echo 前端: http://localhost:5173
echo 后端: http://localhost:3001
echo.
pause 