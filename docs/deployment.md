# 部署指南

## 系统要求

### 最低要求
- **操作系统**: Linux (Ubuntu 20.04+), Windows 10+, macOS 10.15+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 4GB RAM
- **存储**: 10GB 可用空间
- **网络**: 100Mbps 连接

### 推荐配置
- **操作系统**: Ubuntu 22.04 LTS
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **网络**: 1Gbps 连接

## 快速部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd industrial-control-demo
```

### 2. 配置环境变量
```bash
cp backend/env.example .env
```

编辑 `.env` 文件，配置您的环境：
```bash
# ADS配置 (TwinCAT)
ADS_TARGET_IP=192.168.1.10
ADS_TARGET_PORT=851

# OPC UA配置
OPCUA_ENDPOINT_URL=opc.tcp://localhost:4840
```

### 3. 启动系统
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

### 4. 验证部署
访问以下地址验证系统：
- **HMI界面**: http://localhost:3000
- **后端API**: http://localhost:3001/api/health
- **系统状态**: http://localhost:3001/api/health

## 生产环境部署

### 1. 安全配置

#### 防火墙设置
```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp  # HMI界面
sudo ufw allow 3001/tcp  # 后端API
sudo ufw allow 4840/tcp  # OPC UA (可选)
sudo ufw enable
```

#### SSL/TLS配置
```bash
# 生成SSL证书
sudo mkdir -p /etc/ssl/industrial
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/industrial/private.key \
  -out /etc/ssl/industrial/certificate.crt
```

#### 环境变量安全
```bash
# 生产环境变量
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
ADS_TARGET_IP=192.168.1.10
OPCUA_ENDPOINT_URL=opc.tcp://192.168.1.10:4840
```

### 2. 高可用部署

#### 使用Docker Swarm
```bash
# 初始化Swarm
docker swarm init

# 部署服务
docker stack deploy -c docker-compose.yml industrial
```

#### 使用Kubernetes
```bash
# 创建命名空间
kubectl create namespace industrial

# 部署应用
kubectl apply -f k8s/
```

### 3. 监控和日志

#### 启用监控系统
```bash
# 启动监控服务
docker-compose --profile monitoring up -d

# 访问Grafana
# http://localhost:3002 (admin/admin)
```

#### 日志管理
```bash
# 配置日志轮转
sudo logrotate -f /etc/logrotate.d/industrial

# 查看实时日志
docker-compose logs -f
```

## 网络配置

### 工业网络集成

#### TwinCAT ADS配置
```bash
# 在TwinCAT System Manager中配置
# 1. 添加路由到目标系统
# 2. 配置ADS通信参数
# 3. 测试连接
```

#### OPC UA配置
```bash
# 配置OPC UA服务器
# 1. 设置端点URL
# 2. 配置安全策略
# 3. 添加用户认证
```

### 网络拓扑
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HMI Client    │    │   Backend API   │    │   TwinCAT PLC   │
│   (Port 3000)   │◄──►│   (Port 3001)   │◄──►│   (Port 851)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   OPC UA Server │◄─────────────┘
                        │   (Port 4840)   │
                        └─────────────────┘
```

## 备份和恢复

### 数据备份
```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/industrial-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# 备份配置文件
cp -r .env $BACKUP_DIR/
cp -r backend/env.example $BACKUP_DIR/

# 备份日志
cp -r logs/ $BACKUP_DIR/

# 备份Docker卷
docker run --rm -v industrial-control-demo_logs:/data -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/logs.tar.gz -C /data .

echo "备份完成: $BACKUP_DIR"
EOF

chmod +x backup.sh
```

### 系统恢复
```bash
# 恢复脚本
cat > restore.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=$1

if [ -z "$BACKUP_DIR" ]; then
    echo "用法: $0 <备份目录>"
    exit 1
fi

# 停止服务
docker-compose down

# 恢复配置文件
cp $BACKUP_DIR/.env ./

# 恢复日志
tar xzf $BACKUP_DIR/logs.tar.gz -C logs/

# 重启服务
docker-compose up -d

echo "恢复完成"
EOF

chmod +x restore.sh
```

## 性能优化

### 系统调优
```bash
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化内核参数
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65535" >> /etc/sysctl.conf
sysctl -p
```

### Docker优化
```bash
# 配置Docker守护进程
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

systemctl restart docker
```

## 故障排除

### 常见部署问题

#### 1. 端口冲突
```bash
# 检查端口占用
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# 修改端口
# 编辑 docker-compose.yml 中的端口映射
```

#### 2. 权限问题
```bash
# 修复文件权限
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

#### 3. 网络连接问题
```bash
# 测试网络连接
ping 192.168.1.10
telnet 192.168.1.10 851

# 检查防火墙
sudo ufw status
```

### 性能监控
```bash
# 系统资源监控
docker stats

# 网络监控
iftop -i eth0

# 磁盘监控
iotop
```

## 更新和维护

### 系统更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build --no-cache

# 重启服务
docker-compose down
docker-compose up -d
```

### 定期维护
```bash
# 清理未使用的Docker资源
docker system prune -f

# 更新系统包
sudo apt update && sudo apt upgrade -y

# 检查磁盘空间
df -h
```

## 支持

如需技术支持，请联系：
- **邮箱**: support@goldskytech.com
- **文档**: https://docs.goldskytech.com
- **GitHub**: https://github.com/goldskytech/industrial-control-demo 