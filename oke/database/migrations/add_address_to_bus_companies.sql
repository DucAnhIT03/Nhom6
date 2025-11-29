-- ============================================
-- Migration: Thêm cột address vào bảng bus_companies
-- Ngày tạo: 2024
-- Mô tả: Thêm cột address (Địa chỉ trụ sở) vào bảng bus_companies
--        để tách biệt với descriptions (Mô tả nhà xe)
-- ============================================

USE bus_booking_system;

-- Kiểm tra xem cột address đã tồn tại chưa, nếu chưa thì thêm vào
SET @dbname = DATABASE();
SET @tablename = 'bus_companies';
SET @columnname = 'address';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT "Column address already exists in bus_companies table" AS message;',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(500) NULL COMMENT "Địa chỉ trụ sở của nhà xe" AFTER image;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Hoặc nếu muốn chạy trực tiếp (bỏ qua phần kiểm tra):
-- ALTER TABLE bus_companies 
-- ADD COLUMN address VARCHAR(500) NULL COMMENT 'Địa chỉ trụ sở của nhà xe' 
-- AFTER image;

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'bus_booking_system'
  AND TABLE_NAME = 'bus_companies'
  AND COLUMN_NAME = 'address';

