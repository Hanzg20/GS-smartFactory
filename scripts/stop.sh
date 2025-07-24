#!/bin/bash

# 工业控制系统停止脚本
# GoldSky Technologies

echo "🛑 停止工业控制系统..."

# 停止所有服务
docker-compose down

echo "✅ 系统已停止"

# 可选：清理未使用的镜像和容器
read -p "是否清理未使用的Docker资源？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理Docker资源..."
    docker system prune -f
    echo "✅ 清理完成"
fi 