# Set environment variables
$env:PORT = "3001"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:3000"
$env:JWT_SECRET = "smartfactory_jwt_secret_2024_dev"

# Change to project root
Set-Location $PSScriptRoot
Set-Location ..

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SmartFactory Studio Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Current directory: $PWD" -ForegroundColor Gray

# Check Node.js installation
try {
    node --version | Out-Null
} catch {
    Write-Host "Error: Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Kill existing processes
Write-Host "`n[1/5] Cleaning up ports..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Killing process: $($_.OwningProcess)" -ForegroundColor Gray
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# Start backend
Write-Host "`n[2/5] Starting backend service..." -ForegroundColor Yellow
if (-not (Test-Path "backend")) {
    Write-Host "Error: backend directory not found" -ForegroundColor Red
    exit 1
}

Set-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Backend dependency installation failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  Starting backend service..." -ForegroundColor Gray
Start-Process -WindowStyle Hidden powershell -ArgumentList "npm run dev"
Set-Location ..

# Start frontend
Write-Host "`n[3/5] Starting frontend service..." -ForegroundColor Yellow
if (-not (Test-Path "frontend")) {
    Write-Host "Error: frontend directory not found" -ForegroundColor Red
    exit 1
}

Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Frontend dependency installation failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  Starting frontend service..." -ForegroundColor Gray
Start-Process -WindowStyle Hidden powershell -ArgumentList "npm run dev"
Set-Location ..

# Wait for services
Write-Host "`n[4/5] Waiting for services..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "  Checking service status..." -ForegroundColor Gray
$backendReady = $false
$frontendReady = $false
$retries = 0

while ($retries -lt 10 -and (-not $backendReady -or -not $frontendReady)) {
    $backendConn = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
    $frontendConn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    
    if ($backendConn) { $backendReady = $true }
    if ($frontendConn) { $frontendReady = $true }
    
    if (-not $backendReady -or -not $frontendReady) {
        Write-Host "  Waiting... ($($retries + 1)/10)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
        $retries++
    }
}

Write-Host "`n[5/5] Service status:" -ForegroundColor Yellow
if ($backendReady) {
    Write-Host "  ✓ Backend service is running (port: 3001)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend service failed to start" -ForegroundColor Red
}

if ($frontendReady) {
    Write-Host "  ✓ Frontend service is running (port: 3000)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Frontend service failed to start" -ForegroundColor Red
}

# Open browser
if ($frontendReady) {
    Write-Host "`nOpening frontend page..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Startup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "Backend: http://localhost:3001" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Keep the script running
while ($true) { Start-Sleep -Seconds 1 } 