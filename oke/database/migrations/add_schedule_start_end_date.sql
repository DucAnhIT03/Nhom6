-- ============================================
-- Migration: Add start_date and end_date to schedules table
-- Description: Thêm cột start_date và end_date vào bảng schedules
-- Date: 2025-01-XX
-- ============================================

-- Kiểm tra và thêm cột start_date nếu chưa tồn tại
SET @dbname = DATABASE();
SET @tablename = 'schedules';
SET @columnname = 'start_date';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Kiểm tra và thêm cột end_date nếu chưa tồn tại
SET @columnname = 'end_date';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Cập nhật dữ liệu cho các bản ghi hiện có (nếu có)
-- Sử dụng departure_time để set start_date và end_date
UPDATE schedules 
SET 
  start_date = DATE(departure_time),
  end_date = DATE(departure_time)
WHERE start_date IS NULL OR end_date IS NULL;

-- Đặt NOT NULL cho start_date
ALTER TABLE schedules 
MODIFY COLUMN start_date DATE NOT NULL;

-- Đặt NOT NULL cho end_date
ALTER TABLE schedules 
MODIFY COLUMN end_date DATE NOT NULL;

-- Thêm constraint để đảm bảo end_date >= start_date
-- Xóa constraint cũ nếu đã tồn tại
SET @constraint_name = 'chk_schedule_dates';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (CONSTRAINT_NAME = @constraint_name)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraint_name, ' CHECK (end_date >= start_date)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thông báo hoàn thành
SELECT 'Migration completed: start_date and end_date columns added to schedules table' AS result;


