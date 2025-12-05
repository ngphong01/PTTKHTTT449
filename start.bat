@echo off
echo ========================================
echo   HE THONG QUAN LY NHA HANG
echo ========================================
echo.

echo Dang kiem tra dependencies...
if not exist "backend\node_modules" (
    echo Cai dat backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Cai dat frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Dang khoi dong Backend va Frontend...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Nhan Ctrl+C de dung server
echo.

call npm run dev

