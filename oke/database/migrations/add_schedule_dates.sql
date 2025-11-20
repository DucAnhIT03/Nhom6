-- Migration: Add start_date and end_date to schedules table
-- Date: 2025-01-XX

-- First, add columns as nullable
ALTER TABLE schedules 
ADD COLUMN start_date DATE NULL,
ADD COLUMN end_date DATE NULL;

-- Update existing records to use departure_time date as default
UPDATE schedules 
SET start_date = DATE(departure_time),
    end_date = DATE(departure_time)
WHERE start_date IS NULL OR end_date IS NULL;

-- Now make them NOT NULL
ALTER TABLE schedules 
MODIFY COLUMN start_date DATE NOT NULL,
MODIFY COLUMN end_date DATE NOT NULL;

-- Add check constraint to ensure end_date >= start_date
ALTER TABLE schedules
ADD CONSTRAINT chk_schedule_dates CHECK (end_date >= start_date);

