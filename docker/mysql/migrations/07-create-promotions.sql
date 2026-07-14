SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE booking_db;

CREATE TABLE IF NOT EXISTS promotions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(12, 2) NOT NULL,
    min_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    max_discount_amount DECIMAL(12, 2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INT,
    used_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO promotions
(code, name, description, image_url, discount_type, discount_value,
 min_order_amount, max_discount_amount, start_date, end_date,
 usage_limit, used_count, status, created_at, updated_at)
VALUES
('WELCOME10', 'Chào thành viên mới', 'Giảm 10% cho lần đặt vé đầu tiên.',
 'https://placehold.co/640x320/2563eb/ffffff?text=WELCOME+10%25',
 'PERCENT', 10, 100000, 50000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 1000, 0, 'ONLINE', NOW(), NOW()),
('HAPPY50K', 'Happy Day giảm 50.000đ', 'Giảm trực tiếp 50.000đ cho đơn đủ điều kiện.',
 'https://placehold.co/640x320/0891b2/ffffff?text=HAPPY+DAY+50K',
 'FIXED', 50000, 200000, NULL, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 500, 0, 'ONLINE', NOW(), NOW()),
('MEMBER20', 'Ưu đãi thành viên 20%', 'Giảm 20% dành cho thành viên thân thiết.',
 'https://placehold.co/640x320/7c3aed/ffffff?text=MEMBER+20%25',
 'PERCENT', 20, 150000, 80000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 300, 0, 'ONLINE', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    image_url = VALUES(image_url),
    discount_type = VALUES(discount_type),
    discount_value = VALUES(discount_value),
    min_order_amount = VALUES(min_order_amount),
    max_discount_amount = VALUES(max_discount_amount),
    start_date = VALUES(start_date),
    end_date = VALUES(end_date),
    usage_limit = VALUES(usage_limit),
    status = VALUES(status);
