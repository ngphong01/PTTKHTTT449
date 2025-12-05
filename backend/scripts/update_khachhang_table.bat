@echo off
echo ============================================
echo Cap nhat bang KHACHHANG
echo ============================================
echo.

mysql -u root -p123456 restaurant_db < update_khachhang_table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo Cap nhat thanh cong!
    echo ============================================
) else (
    echo.
    echo ============================================
    echo Co loi xay ra!
    echo ============================================
)

pause

