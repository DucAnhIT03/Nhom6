-- Migration: Add seat_layout_config column to buses table
-- This column stores the seat layout configuration as JSON
-- Format: { floors: number, floorConfigs: [{ floor, prefix, rows, columns, label }] }
USE bus_booking_system;
ALTER TABLE `buses` 
ADD COLUMN `seat_layout_config` JSON NULL 
COMMENT 'Cấu hình layout ghế: { floors, floorConfigs: [{ floor, prefix, rows, columns, label }] }' 
AFTER `floors`;

