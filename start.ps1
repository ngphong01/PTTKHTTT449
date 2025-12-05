Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HE THONG QUAN LY NHA HANG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra và cài đặt dependencies
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Cai dat backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Cai dat frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "Dang khoi dong Backend va Frontend..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nhan Ctrl+C de dung server" -ForegroundColor Yellow
Write-Host ""

npm run dev

