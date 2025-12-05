#!/bin/bash
echo "========================================"
echo "Cap nhat cot HinhAnh sang TEXT"
echo "========================================"
echo ""
mysql -u root -p123456 restaurant_db < scripts/update_hinhanh_column.sql
echo ""
echo "Hoan thanh!"

