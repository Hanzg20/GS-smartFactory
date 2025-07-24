#!/bin/bash

# 工业控制系统启动脚本
# GoldSky Technologies

set -e

echo "🏭 启动工业控制系统..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p logs
mkdir -p backend/logs

# 设置环境变量
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp backend/env.example .env
    echo "✅ 环境变量文件已创建，请根据需要修改 .env 文件"
fi

# 构建并启动服务
echo "🚀 构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 系统启动完成！"
echo ""
echo "📱 访问地址："
echo "   HMI界面: http://localhost:3000"
echo "   后端API: http://localhost:3001"
echo "   健康检查: http://localhost:3001/api/health"
echo ""
echo "🔧 管理命令："
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""
echo "📊 可选服务："
echo "   启动OPC UA服务器: docker-compose --profile opcua up -d"
echo "   启动Node-RED: docker-compose --profile nodered up -d"
echo "   启动监控系统: docker-compose --profile monitoring up -d" 