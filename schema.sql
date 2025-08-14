-- WristBud Database Schema
CREATE DATABASE IF NOT EXISTS wristbud;
USE wristbud;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health data table with location tracking
CREATE TABLE health_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    heart_rate INT NOT NULL,
    systolic INT NOT NULL,
    diastolic INT NOT NULL,
    spo2 INT NOT NULL,
    temperature DECIMAL(4,1) NOT NULL,
    status ENUM('normal', 'abnormal', 'critical') DEFAULT 'normal',
    activity VARCHAR(50),
    context_tag VARCHAR(50),
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    location_address TEXT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_recorded (user_id, recorded_at),
    INDEX idx_status (status),
    INDEX idx_location (location_latitude, location_longitude)
);

-- Alerts table
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    alert_type ENUM('health_critical', 'emergency', 'system') NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    location_address TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_severity (severity),
    INDEX idx_alert_location (location_latitude, location_longitude)
);

-- Emergency events table with enhanced location tracking
CREATE TABLE emergency_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    heart_rate INT,
    blood_pressure VARCHAR(20),
    spo2 INT,
    temperature DECIMAL(4,1),
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    location_address TEXT NULL,
    location_accuracy FLOAT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_emergency_location (location_latitude, location_longitude),
    INDEX idx_emergency_time (created_at)
);

-- SMS log table for tracking sent emergency messages
CREATE TABLE sms_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    alert_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_user_alert (user_id, alert_id),
    INDEX idx_sent_at (sent_at)
);

-- Insert sample data for testing
-- Test user: email=test@test.com, password=test123
-- Admin users: admin@admin.com, password=admin
INSERT INTO users (name, email, password, emergency_contact, emergency_phone) VALUES 
('Test User', 'test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emergency Contact', '+1234567890'),
('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Doe', '+1234567890'),
('Admin User', 'admin@admin.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Emergency', '+1234567890');

-- Insert sample critical alert for testing SMS sender with location
INSERT INTO alerts (user_id, alert_type, message, severity, location_address) VALUES 
(1, 'emergency', 'Critical health values detected: HR=185, BP=190/120, SpO2=85%, Temp=104.2°F', 'critical', 'Demo Location - Emergency Test');

INSERT INTO health_data (user_id, heart_rate, systolic, diastolic, spo2, temperature, status, location_address) VALUES 
(1, 185, 190, 120, 85, 104.2, 'critical', 'Demo Location - Health Data Test');