SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS notification_db;
CREATE DATABASE IF NOT EXISTS media_db;

USE payment_db;

CREATE TABLE IF NOT EXISTS payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    recipient VARCHAR(255),
    transaction_reference VARCHAR(80) NOT NULL UNIQUE,
    provider_transaction_id VARCHAR(120) UNIQUE,
    provider VARCHAR(30) NOT NULL,
    payment_method VARCHAR(50),
    amount DECIMAL(12, 2) NOT NULL,
    refunded_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    description VARCHAR(500),
    callback_payload LONGTEXT,
    paid_at DATETIME,
    refunded_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_booking (booking_id),
    INDEX idx_payment_user (user_id),
    INDEX idx_payment_status (status)
);

USE notification_db;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content LONGTEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    related_type VARCHAR(50),
    related_id BIGINT,
    event_key VARCHAR(160) UNIQUE,
    event_type VARCHAR(60),
    attempt_count INT NOT NULL DEFAULT 0,
    failure_reason VARCHAR(500),
    sent_at DATETIME,
    email_recipient VARCHAR(255),
    email_status VARCHAR(20),
    email_attempt_count INT NOT NULL DEFAULT 0,
    email_failure_reason VARCHAR(500),
    email_sent_at DATETIME,
    read_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_status (status),
    INDEX idx_notification_related (related_type, related_id)
);

USE media_db;

CREATE TABLE IF NOT EXISTS media_assets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    storage_type VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    storage_path VARCHAR(700) NOT NULL,
    public_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_media_owner (owner_id),
    INDEX idx_media_category (category),
    INDEX idx_media_status (status)
);
