#!/bin/bash

echo "========================================"
echo "  HE THONG QUAN LY NHA HANG"
echo "========================================"
echo ""

# Kiểm tra và cài đặt dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Cai dat backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Cai dat frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "Dang khoi dong Backend va Frontend..."
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Nhan Ctrl+C de dung server"
echo ""

npm run dev

