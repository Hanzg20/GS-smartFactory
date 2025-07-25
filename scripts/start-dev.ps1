# 设置环境变量
$env:PORT = "3000"
$env:VITE_API_URL = "http://localhost:3001"
$env:VITE_WS_URL = "http://localhost:3001"
$env:VITE_SUPABASE_URL = "https://ukuvlbiywoywlyhxdbtv.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdXZsYml5d295d2x5aHhkYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4ODQzNzAsImV4cCI6MjAyMzQ2MDM3MH0.GJ6UvwuPYYqHXEyV-dqZgRaL-bKhDvbhsrQzV6Aw0Hs"

# 切换到项目根目录
Set-Location $PSScriptRoot/..

# 停止已存在的进程
$ports = @(3000, 3001)
foreach ($port in $ports) {
    $processId = netstat -ano | Select-String ":$port\s" | ForEach-Object { $_.ToString().Split(" ")[-1] }
    if ($processId) {
        Write-Host "Killing process on port $port (PID: $processId)"
        taskkill /PID $processId /F 2>$null
    }
}

# 安装依赖
Write-Host "Installing dependencies..."
Set-Location frontend
npm install
Set-Location ../backend
npm install
Set-Location ..

# 启动后端服务
Write-Host "Starting backend service..."
$backendWindow = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\backend'; npm run dev" -WindowStyle Hidden -PassThru

# 启动前端服务
Write-Host "Starting frontend service..."
$frontendWindow = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\frontend'; npm run dev" -WindowStyle Hidden -PassThru

# 等待服务启动
Start-Sleep -Seconds 5

# 检查服务状态
$frontendRunning = $false
$backendRunning = $false

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        $frontendRunning = $true
        Write-Host "Frontend service is running on http://localhost:3000"
    }
} catch {
    Write-Host "Frontend service failed to start"
}

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/healthcheck" -UseBasicParsing -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "Backend service is running on http://localhost:3001"
    }
} catch {
    Write-Host "Backend service failed to start"
}

if (-not ($frontendRunning -and $backendRunning)) {
    Write-Host "Some services failed to start. Check the logs for more details."
    if ($backendWindow) { Stop-Process -Id $backendWindow.Id }
    if ($frontendWindow) { Stop-Process -Id $frontendWindow.Id }
    exit 1
}

Write-Host "All services are running. Press Ctrl+C to stop all services."

# 等待用户中断
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # 清理进程
    if ($backendWindow) { Stop-Process -Id $backendWindow.Id }
    if ($frontendWindow) { Stop-Process -Id $frontendWindow.Id }
    Write-Host "All services stopped."
} 