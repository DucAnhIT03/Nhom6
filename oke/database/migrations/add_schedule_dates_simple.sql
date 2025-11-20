-- ============================================
-- Migration đơn giản: Thêm start_date và end_date vào bảng schedules
-- Lưu ý: Chỉ chạy file này nếu bảng schedules chưa có 2 cột này
-- ============================================

-- Thêm cột start_date (nullable trước)
ALTER TABLE schedules 
ADD COLUMN start_date DATE NULL;

-- Thêm cột end_date (nullable trước)
ALTER TABLE schedules 
ADD COLUMN end_date DATE NULL;

-- Cập nhật dữ liệu cho các bản ghi hiện có
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
ALTER TABLE schedules
ADD CONSTRAINT chk_schedule_dates CHECK (end_date >= start_date);

-- Hoàn thành
SELECT 'Đã thêm thành công cột start_date và end_date vào bảng schedules' AS ket_qua;


