
DROP DATABASE IF EXISTS bus_booking_system;
CREATE DATABASE bus_booking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bus_booking_system;

-- ============================================
-- 1. BẢNG USERS (Người dùng)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(11),
    status ENUM('ACTIVE', 'BLOCKED') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. BẢNG ROLES (Quyền)
-- ============================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name ENUM('ROLE_ADMIN', 'ROLE_USER') NOT NULL UNIQUE,
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. BẢNG USER_ROLE (Quyền của người dùng)
-- ============================================
CREATE TABLE user_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. BẢNG OTP_CODES (Mã OTP xác thực)
-- ============================================
CREATE TABLE otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NULL COMMENT 'REGISTER, RESET_PASSWORD, etc.',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_code (code),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. BẢNG STATIONS (Bến xe)
-- ============================================
CREATE TABLE stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    wallpaper VARCHAR(255),
    descriptions LONGTEXT,
    location VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. BẢNG BUS_COMPANIES (Nhà xe)
-- ============================================
CREATE TABLE bus_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    descriptions LONGTEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX idx_company_name (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. BẢNG BUSES (Xe)
-- ============================================
CREATE TABLE buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    descriptions TEXT,
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    company_id INT NOT NULL,
    floors INT NOT NULL DEFAULT 2 COMMENT 'Số tầng: 1 hoặc 2',
    seat_layout_config JSON NULL COMMENT 'Cấu hình layout ghế: { floors, floorConfigs: [{ floor, prefix, rows, columns, label }] }',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_license_plate (license_plate),
    INDEX idx_floors (floors)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. BẢNG BUS_STATION (Xe ở bến xe)
-- ============================================
CREATE TABLE bus_station (
    station_id INT NOT NULL,
    bus_id INT NOT NULL,
    PRIMARY KEY (station_id, bus_id),
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_station_id (station_id),
    INDEX idx_bus_id (bus_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. BẢNG BUS_IMAGE (Ảnh của xe)
-- ============================================
CREATE TABLE bus_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    bus_id INT NOT NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. BẢNG ROUTES (Tuyến đường đi)
-- ============================================
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departure_station_id INT NOT NULL,
    arrival_station_id INT NOT NULL,
    bus_company_id INT NULL,
    price DOUBLE NOT NULL,
    duration INT NOT NULL COMMENT 'Thời gian tính bằng phút',
    distance INT NOT NULL COMMENT 'Khoảng cách tính bằng km',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (departure_station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (arrival_station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_company_id) REFERENCES bus_companies(id) ON DELETE CASCADE,
    INDEX idx_departure_station (departure_station_id),
    INDEX idx_arrival_station (arrival_station_id),
    INDEX idx_price (price),
    INDEX idx_bus_company (bus_company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. BẢNG SCHEDULES (Lịch trình đi)
-- ============================================
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    available_seat INT NOT NULL DEFAULT 0,
    total_seats INT NOT NULL,
    status ENUM('AVAILABLE', 'FULL', 'CANCELLED') DEFAULT 'AVAILABLE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id),
    INDEX idx_bus_id (bus_id),
    INDEX idx_departure_time (departure_time),
    INDEX idx_status (status),
    CONSTRAINT chk_schedule_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. BẢNG SEATS (Ghế ngồi)
-- ============================================
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    seat_number VARCHAR(20) NOT NULL,
    seat_type ENUM('LUXURY', 'VIP', 'STANDARD', 'DOUBLE') NOT NULL DEFAULT 'STANDARD',
    status ENUM('AVAILABLE', 'BOOKED') DEFAULT 'AVAILABLE',
    price_for_seat_type DOUBLE DEFAULT 0 COMMENT 'Giá cộng thêm cho loại ghế',
    is_hidden BOOLEAN DEFAULT FALSE COMMENT 'Ghế bị ẩn (hiển thị dấu X)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bus_seat (bus_id, seat_number),
    INDEX idx_bus_id (bus_id),
    INDEX idx_seat_type (seat_type),
    INDEX idx_status (status),
    INDEX idx_is_hidden (is_hidden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12.1 BẢNG SEAT_TYPE_PRICES (Giá vé theo loại ghế cho từng tuyến)
-- ============================================
CREATE TABLE seat_type_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    seat_type ENUM('STANDARD','VIP','DOUBLE','LUXURY') NOT NULL,
    price DOUBLE NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_route_seat_type (route_id, seat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12.2 BẢNG POSTS (Bài viết tin tức)
-- ============================================
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    thumbnail_url VARCHAR(500),
    content LONGTEXT NOT NULL,
    status ENUM('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. BẢNG BUS_REVIEWS (Đánh giá xe)
-- ============================================
CREATE TABLE bus_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bus_id INT NOT NULL,
    rating INT NOT NULL COMMENT 'Đánh giá từ 1 đến 5 sao',
    review VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_bus_id (bus_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. BẢNG TICKETS (Vé xe)
-- ============================================
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    seat_id INT NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    seat_type ENUM('LUXURY', 'VIP', 'STANDARD', 'DOUBLE') NOT NULL,
    price DOUBLE NOT NULL,
    status ENUM('BOOKED', 'CANCELLED') DEFAULT 'BOOKED',
    ticket_code VARCHAR(50) UNIQUE NULL COMMENT 'Mã vé để tra cứu',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_seat_id (seat_id),
    INDEX idx_status (status),
    INDEX idx_ticket_code (ticket_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. BẢNG PAYMENT_PROVIDERS (Nhà cung cấp thanh toán)
-- ============================================
CREATE TABLE payment_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_name VARCHAR(255) NOT NULL,
    provider_type ENUM('CARD', 'E-WALLET', 'BANK_TRANSFER', 'QR_CODE') NOT NULL,
    api_endpoint VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider_type (provider_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 16. BẢNG PAYMENTS (Thanh toán)
-- ============================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_provider_id INT,
    user_id INT NOT NULL,
    ticket_id INT NOT NULL,
    payment_method ENUM('CASH', 'ONLINE') NOT NULL,
    amount DOUBLE NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_provider_id) REFERENCES payment_providers(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 17. BẢNG BANNERS (Phông quảng cáo)
-- ============================================
CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banner_url VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 18. BẢNG CANCELLATION_POLICIES (Thông tin hủy vé)
-- ============================================
CREATE TABLE cancellation_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descriptions TEXT,
    route_id INT NOT NULL,
    cancellation_time_limit INT NOT NULL COMMENT 'Số phút trước giờ khởi hành',
    refund_percentage INT NOT NULL COMMENT 'Phần trăm hoàn tiền (0-100)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DỮ LIỆU MẪU
-- ============================================

-- 1. INSERT ROLES
INSERT INTO roles (role_name) VALUES
('ROLE_ADMIN'),
('ROLE_USER');

-- 2. INSERT USERS (password đã được hash - mật khẩu mặc định: 123456)
-- Hash password cho "123456": $2b$10$o.Mka831QvmV8ftGrW0jw.wjxyHM99TkoYtrTM62VipFjPdMd1cyq
INSERT INTO users (first_name, last_name, email, password, phone, status) VALUES
('Admin', 'System', 'admin@example.com', '$2b$10$o.Mka831QvmV8ftGrW0jw.wjxyHM99TkoYtrTM62VipFjPdMd1cyq', '0912345678', 'ACTIVE'),
('Trần', 'Thị B', 'user1@example.com', '$2b$10$rQZ8K5J8X9YzZ9YzZ9YzZeZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9Y', '0923456789', 'ACTIVE'),
('Lê', 'Văn C', 'user2@example.com', '$2b$10$rQZ8K5J8X9YzZ9YzZ9YzZeZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9Y', '0934567890', 'ACTIVE'),
('Phạm', 'Thị D', 'user3@example.com', '$2b$10$rQZ8K5J8X9YzZ9YzZ9YzZeZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9Y', '0945678901', 'ACTIVE'),
('Hoàng', 'Văn E', 'user4@example.com', '$2b$10$rQZ8K5J8X9YzZ9YzZ9YzZeZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9YzZ9Y', '0956789012', 'ACTIVE');

-- 3. INSERT USER_ROLE
INSERT INTO user_role (user_id, role_id) VALUES
(1, 1), -- Admin có quyền ADMIN
(2, 2), -- User 1 có quyền USER
(3, 2), -- User 2 có quyền USER
(4, 2), -- User 3 có quyền USER
(5, 2); -- User 4 có quyền USER


