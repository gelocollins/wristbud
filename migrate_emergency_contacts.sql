-- Migration: Add multiple emergency contacts to users table
ALTER TABLE users
  DROP COLUMN emergency_contact,
  DROP COLUMN emergency_phone,
  ADD COLUMN emergency_contact1 VARCHAR(100) NOT NULL,
  ADD COLUMN emergency_phone1 VARCHAR(20) NOT NULL,
  ADD COLUMN emergency_contact2 VARCHAR(100) NOT NULL,
  ADD COLUMN emergency_phone2 VARCHAR(20) NOT NULL,
  ADD COLUMN emergency_contact3 VARCHAR(100) DEFAULT NULL,
  ADD COLUMN emergency_phone3 VARCHAR(20) DEFAULT NULL;
