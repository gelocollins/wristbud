-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 14, 2025 at 03:02 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wristbud`
--

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `alert_type` enum('health_critical','emergency','system') NOT NULL,
  `message` text NOT NULL,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `location_latitude` decimal(10,8) DEFAULT NULL,
  `location_longitude` decimal(11,8) DEFAULT NULL,
  `location_address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`id`, `user_id`, `alert_type`, `message`, `severity`, `location_latitude`, `location_longitude`, `location_address`, `created_at`) VALUES
(1, 1, 'emergency', 'Critical health values detected: HR=185, BP=190/120, SpO2=85%, Temp=104.2°F', 'critical', NULL, NULL, 'Demo Location - Emergency Test', '2025-08-13 17:00:46');

-- --------------------------------------------------------

--
-- Table structure for table `emergency_events`
--

CREATE TABLE `emergency_events` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `heart_rate` int(11) DEFAULT NULL,
  `blood_pressure` varchar(20) DEFAULT NULL,
  `spo2` int(11) DEFAULT NULL,
  `temperature` decimal(4,1) DEFAULT NULL,
  `location_latitude` decimal(10,8) DEFAULT NULL,
  `location_longitude` decimal(11,8) DEFAULT NULL,
  `location_address` text DEFAULT NULL,
  `location_accuracy` float DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `health_data`
--

CREATE TABLE `health_data` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `heart_rate` int(11) NOT NULL,
  `systolic` int(11) NOT NULL,
  `diastolic` int(11) NOT NULL,
  `spo2` int(11) NOT NULL,
  `temperature` decimal(4,1) NOT NULL,
  `status` enum('normal','abnormal','critical') DEFAULT 'normal',
  `activity` varchar(50) DEFAULT NULL,
  `context_tag` varchar(50) DEFAULT NULL,
  `location_latitude` decimal(10,8) DEFAULT NULL,
  `location_longitude` decimal(11,8) DEFAULT NULL,
  `location_address` text DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `health_data`
--

INSERT INTO `health_data` (`id`, `user_id`, `heart_rate`, `systolic`, `diastolic`, `spo2`, `temperature`, `status`, `activity`, `context_tag`, `location_latitude`, `location_longitude`, `location_address`, `recorded_at`) VALUES
(1, 1, 185, 190, 120, 85, 104.2, 'critical', NULL, NULL, NULL, NULL, 'Demo Location - Health Data Test', '2025-08-13 17:00:46'),
(2, 3, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:24:55'),
(3, 3, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:25:00'),
(4, 3, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:25:05'),
(5, 3, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:25:10'),
(6, 3, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:25:15'),
(7, 4, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:26:23'),
(8, 4, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:26:28'),
(9, 4, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:26:33'),
(10, 4, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:26:38'),
(11, 4, 113, 140, 85, 99, 70.0, 'normal', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:26:43'),
(12, 4, 113, 140, 85, 99, 70.0, 'critical', 'Moderate Activity', 'Monitoring', 37.42199833, -122.08400000, 'Lat: 37.4220, Lng: -122.0840', '2025-08-14 07:26:48');

-- --------------------------------------------------------

--
-- Table structure for table `sms_log`
--

CREATE TABLE `sms_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `alert_id` int(11) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `status` enum('sent','failed','pending') DEFAULT 'sent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `emergency_contact`, `emergency_phone`, `created_at`) VALUES
(1, 'Test User', 'test@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emergency Contact', '+1234567890', '2025-08-13 17:00:46'),
(2, 'Divine', 'divine@wrist.bud', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Gelo', '+1234567890', '2025-08-13 17:00:46'),
(3, 'Admin User', 'admin@admin.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Emergency', '+1234567890', '2025-08-13 17:00:46'),
(4, 'Oscar Angelo Collins Rivera', 'angeloqq03@gmail.com', '$2y$10$bGn/WztDQxpOTGaqeWbDdeFMsZmmk60sgvh1zDrlkYApEjlspNCKq', 'Oscar Angelo Collins Rivera', '09312123340', '2025-08-13 18:24:45');

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `user_id` int(11) NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`settings`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_settings`
--

INSERT INTO `user_settings` (`user_id`, `settings`) VALUES
(4, '{\"notifications\":{\"email\":true,\"push\":true,\"healthAlerts\":true},\"units\":\"metric\",\"theme\":\"dark\"}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_alert_location` (`location_latitude`,`location_longitude`);

--
-- Indexes for table `emergency_events`
--
ALTER TABLE `emergency_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_emergency_location` (`location_latitude`,`location_longitude`),
  ADD KEY `idx_emergency_time` (`created_at`);

--
-- Indexes for table `health_data`
--
ALTER TABLE `health_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_recorded` (`user_id`,`recorded_at`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_location` (`location_latitude`,`location_longitude`);

--
-- Indexes for table `sms_log`
--
ALTER TABLE `sms_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alert_id` (`alert_id`),
  ADD KEY `idx_user_alert` (`user_id`,`alert_id`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `emergency_events`
--
ALTER TABLE `emergency_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `health_data`
--
ALTER TABLE `health_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sms_log`
--
ALTER TABLE `sms_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `emergency_events`
--
ALTER TABLE `emergency_events`
  ADD CONSTRAINT `emergency_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `health_data`
--
ALTER TABLE `health_data`
  ADD CONSTRAINT `health_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sms_log`
--
ALTER TABLE `sms_log`
  ADD CONSTRAINT `sms_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sms_log_ibfk_2` FOREIGN KEY (`alert_id`) REFERENCES `alerts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
