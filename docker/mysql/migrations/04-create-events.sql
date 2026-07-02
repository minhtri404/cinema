SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE movie_db;

CREATE TABLE IF NOT EXISTS events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(500),
    content TEXT,
    apply_condition TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    staff_name VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO events
(title, image_url, content, apply_condition, start_date, end_date, status, staff_name)
VALUES
('Happy Day - Thứ Ba vui vẻ',
 '/uploads/events/c9365f24-8add-4d70-b69a-2a645261f68c.png',
 'Vào thứ Ba hàng tuần, khách hàng được mua vé với mức giá ưu đãi.',
 'Áp dụng mỗi thứ Ba tại tất cả cụm rạp.',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'ONLINE', 'Admin Cinema'),
('Ưu đãi thành viên Cinema',
 '/uploads/events/3a8e32db-b71f-450a-a7ef-52e514f8a3f4.png',
 'Tặng ưu đãi đặc biệt dành cho khách hàng thành viên.',
 'Áp dụng cho tài khoản thành viên hợp lệ.',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'ONLINE', 'Admin Cinema'),
('Giảm 10% khi thanh toán online',
 '/uploads/events/cc5f0a52-39f5-48c2-bf46-2fd3c2a4995a.png',
 'Khách hàng được giảm 10% khi thanh toán bằng ngân hàng liên kết.',
 'Áp dụng cho giao dịch online đủ điều kiện.',
 CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'ONLINE', 'Admin Cinema')
ON DUPLICATE KEY UPDATE
    image_url = VALUES(image_url),
    content = VALUES(content),
    apply_condition = VALUES(apply_condition),
    start_date = VALUES(start_date),
    end_date = VALUES(end_date),
    status = VALUES(status),
    staff_name = VALUES(staff_name);
