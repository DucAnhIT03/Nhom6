-- Migration: Thêm role ROLE_STAFF cho nhân viên xe
-- Chạy file này trong XAMPP để thêm role mới vào database

USE bus_booking_system;

-- Cập nhật enum của cột role_name để thêm ROLE_STAFF
ALTER TABLE roles MODIFY COLUMN role_name ENUM('ROLE_ADMIN', 'ROLE_USER', 'ROLE_STAFF') NOT NULL UNIQUE;

-- Thêm role ROLE_STAFF vào bảng roles (nếu chưa có)
INSERT IGNORE INTO roles (role_name) VALUES ('ROLE_STAFF');

-- Kiểm tra kết quả
SELECT * FROM roles;












