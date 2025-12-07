-- ============================================
-- TỐI ƯU HÓA DATABASE CHO REAL-TIME MONITORING
-- ============================================
-- File này chứa các index và constraint bổ sung để tối ưu
-- hiệu suất query cho chức năng quản lý trạng thái ghế real-time
-- ============================================

USE bus_booking_system;

-- ============================================
-- 1. INDEX COMPOSITE CHO TICKETS
-- ============================================
-- Index này giúp query tickets theo schedule_id và status nhanh hơn
-- (đặc biệt hữu ích khi lọc các vé đã đặt cho một lịch trình cụ thể)
CREATE INDEX idx_tickets_schedule_status ON tickets(schedule_id, status);

-- Index này giúp query tickets theo schedule_id và seat_id nhanh hơn
-- (để kiểm tra xem một ghế đã được đặt cho lịch trình này chưa)
CREATE INDEX idx_tickets_schedule_seat ON tickets(schedule_id, seat_id);

-- ============================================
-- 2. INDEX COMPOSITE CHO SEATS
-- ============================================
-- Index này giúp query seats theo bus_id và status nhanh hơn
-- (để lấy danh sách ghế còn trống/đã đặt của một xe)
CREATE INDEX idx_seats_bus_status ON seats(bus_id, status);

-- ============================================
-- 3. CONSTRAINT BỔ SUNG CHO TICKETS
-- ============================================
-- Đảm bảo một ghế không thể được đặt 2 lần cho cùng một lịch trình
-- (chỉ áp dụng cho vé có status = 'BOOKED')
-- Lưu ý: MySQL không hỗ trợ partial unique index trực tiếp,
-- nên chúng ta sẽ xử lý logic này ở application level
-- Hoặc có thể tạo trigger để kiểm tra

-- ============================================
-- 4. INDEX CHO SCHEDULES (nếu cần)
-- ============================================
-- Index composite cho schedules để query nhanh hơn theo route và status
CREATE INDEX idx_schedules_route_status ON schedules(route_id, status);

-- Index composite cho schedules để query nhanh hơn theo bus và departure_time
CREATE INDEX idx_schedules_bus_departure ON schedules(bus_id, departure_time);

-- ============================================
-- 5. GHI CHÚ VỀ PERFORMANCE
-- ============================================
-- Các index trên sẽ giúp:
-- 1. Query tickets theo schedule_id và status nhanh hơn (cho real-time monitoring)
-- 2. Query seats theo bus_id và status nhanh hơn
-- 3. Query schedules theo route và status nhanh hơn
-- 
-- Lưu ý: Các index này sẽ chiếm thêm dung lượng database,
-- nhưng sẽ cải thiện đáng kể hiệu suất query, đặc biệt khi:
-- - Có nhiều tickets trong hệ thống
-- - Có nhiều seats trong một xe
-- - Real-time monitoring cần query thường xuyên (mỗi 3 giây)












