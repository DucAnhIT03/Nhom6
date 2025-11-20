-- ============================================
-- Migration: Make bus_company_id nullable in routes table
-- Description: Cho phép tuyến đường không cần gắn với nhà xe cụ thể
-- Date: 2025-01-XX
-- ============================================

-- Kiểm tra và cập nhật cột bus_company_id thành nullable
ALTER TABLE routes 
MODIFY COLUMN bus_company_id INT NULL;

-- Thông báo hoàn thành
SELECT 'Migration completed: bus_company_id is now nullable in routes table' AS result;


