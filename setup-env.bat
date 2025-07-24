@echo off
echo ========================================
echo SmartFactory Studio 环境变量设置工具
echo ========================================
echo.

echo 正在创建后端环境变量文件...
(
echo # SmartFactory Studio 后端环境变量
echo.
echo # ========================================
echo # Supabase配置
echo # ========================================
echo SUPABASE_URL=https://ukuvlbiywoywlyhxdbtv.supabase.co
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdXZsYml5d295d2x5aHhkYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjU0NzksImV4cCI6MjA2Nzk0MTQ3OX0.wtUGD5uhnxZtdY0lVqDXkINIYMaBtRbL8iJUGlUIIk8
echo SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdXZsYml5d295d2x5aHhkYnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM2NTQ3OSwiZXhwIjoyMDY3OTQxNDc5fQ.xGMsY50CPyXU_zB4H3WZnxfZHHq4tbgLPGy69FwKmWs
echo.
echo # ========================================
echo # 服务器配置
echo # ========================================
echo PORT=3001
echo NODE_ENV=development
echo WS_PORT=3002
echo.
echo # ========================================
echo # 日志配置
echo # ========================================
echo LOG_LEVEL=debug
echo LOG_FILE=logs/app.log
echo.
echo # ========================================
echo # 安全配置
echo # ========================================
echo JWT_SECRET=smartfactory_jwt_secret_2024_dev
echo CORS_ORIGIN=http://localhost:3000
echo SESSION_SECRET=smartfactory_session_secret_2024_dev
) > backend\.env

echo 正在创建前端环境变量文件...
(
echo # SmartFactory Studio 前端环境变量
echo.
echo # ========================================
echo # Supabase配置
echo # ========================================
echo VITE_SUPABASE_URL=https://ukuvlbiywoywlyhxdbtv.supabase.co
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdXZsYml5d295d2x5aHhkYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjU0NzksImV4cCI6MjA2Nzk0MTQ3OX0.wtUGD5uhnxZtdY0lVqDXkINIYMaBtRbL8iJUGlUIIk8
echo.
echo # ========================================
echo # API配置
echo # ========================================
echo VITE_API_URL=http://localhost:3001
echo VITE_WS_URL=ws://localhost:3002
echo.
echo # ========================================
echo # 应用配置
echo # ========================================
echo VITE_APP_NAME=SmartFactory Studio
echo VITE_APP_VERSION=1.0.0
) > frontend\.env

echo.
echo ✅ 环境变量文件创建完成！
echo.
echo 📁 已创建的文件：
echo    - backend\.env
echo    - frontend\.env
echo.
echo 🔧 下一步操作：
echo    1. 安装Node.js (如果尚未安装)
echo    2. 在Supabase中执行supabase-setup.sql脚本
echo    3. 运行: npm install (在backend和frontend目录)
echo    4. 运行: node test-supabase.js (测试连接)
echo.
echo 📖 详细说明请参考: QUICK-START.md
echo.
pause 