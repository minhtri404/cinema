SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE movie_db;

CREATE TABLE IF NOT EXISTS news (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(500),
    content LONGTEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    staff_name VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO news
(title, image_url, content, status, staff_name, created_at, updated_at)
VALUES
('Hộp bắp sinh nhật dành cho thành viên',
 'https://placehold.co/640x420/fff7ed/e11d48?text=HAPPY+BIRTHDAY+COMBO',
 '<h3>Quà sinh nhật dành cho thành viên</h3><p>Khách hàng thành viên được nhận ưu đãi đặc biệt trong tháng sinh nhật.</p><ul><li>01 combo bắp và nước ưu đãi</li><li>Áp dụng theo điều kiện chương trình</li></ul>',
 'ONLINE', 'Admin Cinema', NOW(), NOW()),
('Doraemon hóa phi công trong chuyến phiêu lưu mới',
 'https://placehold.co/640x360/38bdf8/ffffff?text=DORAEMON+NEWS',
 '<h3>Doraemon trở lại màn ảnh rộng</h3><p>Cùng Nobita và những người bạn khám phá chuyến phiêu lưu hoàn toàn mới.</p>',
 'ONLINE', 'Admin Cinema', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    image_url = VALUES(image_url),
    content = VALUES(content),
    status = VALUES(status),
    staff_name = VALUES(staff_name);
