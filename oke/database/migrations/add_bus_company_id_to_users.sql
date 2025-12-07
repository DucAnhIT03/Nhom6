USE bus_booking_system;

-- Thêm cột bus_company_id vào bảng users
ALTER TABLE users 
ADD COLUMN bus_company_id INT NULL 
COMMENT 'Nhà xe được gán cho nhân viên' 
AFTER status;

-- Thêm foreign key constraint (tùy chọn, nếu muốn đảm bảo tính toàn vẹn dữ liệu)
-- ALTER TABLE users
-- ADD CONSTRAINT fk_user_bus_company
-- FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id)
-- ON DELETE SET NULL;












