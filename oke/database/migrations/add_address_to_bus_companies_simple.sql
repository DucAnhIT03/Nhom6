-- ============================================
-- Migration đơn giản: Thêm cột address vào bảng bus_companies
-- Ngày tạo: 2024
-- Mô tả: Thêm cột address (Địa chỉ trụ sở) vào bảng bus_companies
--        để tách biệt với descriptions (Mô tả nhà xe)
-- 
-- Hướng dẫn sử dụng:
-- 1. Mở phpMyAdmin trong XAMPP
-- 2. Chọn database "bus_booking_system"
-- 3. Vào tab "SQL"
-- 4. Copy và paste toàn bộ nội dung file này
-- 5. Click "Go" để thực thi
-- ============================================

USE bus_booking_system;

-- Thêm cột address vào bảng bus_companies
-- Nếu cột đã tồn tại, sẽ báo lỗi nhưng không ảnh hưởng đến dữ liệu
ALTER TABLE bus_companies 
ADD COLUMN address VARCHAR(500) NULL COMMENT 'Địa chỉ trụ sở của nhà xe' 
AFTER image;

-- Kiểm tra kết quả (tùy chọn - có thể xóa dòng này sau khi chạy thành công)
SELECT 
    COLUMN_NAME AS 'Tên cột',
    DATA_TYPE AS 'Kiểu dữ liệu',
    CHARACTER_MAXIMUM_LENGTH AS 'Độ dài tối đa',
    IS_NULLABLE AS 'Cho phép NULL',
    COLUMN_COMMENT AS 'Ghi chú'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'bus_booking_system'
  AND TABLE_NAME = 'bus_companies'
  AND COLUMN_NAME = 'address';

