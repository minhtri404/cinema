SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS movie_db;
CREATE DATABASE IF NOT EXISTS showtime_db;
CREATE DATABASE IF NOT EXISTS booking_db;
CREATE DATABASE IF NOT EXISTS user_db;

USE movie_db;

CREATE TABLE IF NOT EXISTS movies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    genre VARCHAR(255),
    duration INT,
    director VARCHAR(255),
    release_date DATE,
    poster_url VARCHAR(500),
    trailer_url VARCHAR(500),
    status VARCHAR(255),
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS genres (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
);

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
(title, image_url, content, status, staff_name)
VALUES
('Hộp bắp sinh nhật dành cho thành viên',
 'https://placehold.co/640x420/fff7ed/e11d48?text=HAPPY+BIRTHDAY+COMBO',
 '<h3>Quà sinh nhật dành cho thành viên</h3><p>Khách hàng thành viên được nhận ưu đãi đặc biệt trong tháng sinh nhật.</p><ul><li>01 combo bắp và nước ưu đãi</li><li>Áp dụng theo điều kiện chương trình</li></ul>',
 'ONLINE', 'Admin Cinema'),
('Doraemon hóa phi công trong chuyến phiêu lưu mới',
 'https://placehold.co/640x360/38bdf8/ffffff?text=DORAEMON+NEWS',
 '<h3>Doraemon trở lại màn ảnh rộng</h3><p>Cùng Nobita và những người bạn khám phá chuyến phiêu lưu hoàn toàn mới.</p>',
 'ONLINE', 'Admin Cinema')
ON DUPLICATE KEY UPDATE
    image_url = VALUES(image_url),
    content = VALUES(content),
    status = VALUES(status),
    staff_name = VALUES(staff_name);

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

INSERT INTO genres (name, description, active)
VALUES
('Action', 'Phim hanh dong, chien dau, rượt duoi va canh gay can.', true),
('Animation', 'Phim hoat hinh danh cho thieu nhi va gia dinh.', true),
('Drama', 'Phim tam ly, tinh cam, tap trung vao cau chuyen nhan vat.', true),
('Comedy', 'Phim hai huoc, giai tri, tao tieng cuoi.', true),
('Horror', 'Phim kinh di, gay hoi hop va cam giac so hai.', true),
('Romance', 'Phim tinh cam, lang man, cau chuyen tinh yeu.', true),
('Science Fiction', 'Phim khoa hoc vien tuong, cong nghe va tuong lai.', true),
('Fantasy', 'Phim gia tuong, phep thuat va the gioi hu cau.', true),
('Thriller', 'Phim giat gan, dieu tra, cang thang va bat ngo.', true),
('Adventure', 'Phim phieu luu, hanh trinh, kham pha va thu thach.', true)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    active = VALUES(active);

INSERT INTO movies 
(title, description, genre, duration, director, release_date, poster_url, trailer_url, status, created_at)
VALUES
(
    'Avengers: Endgame',
    'Biet doi sieu anh hung chien dau de cuu vu tru.',
    'Action',
    181,
    'Anthony Russo, Joe Russo',
    '2026-06-01',
    'https://m.media-amazon.com/images/I/81ExhpBEbHL._AC_UF894,1000_QL80_.jpg',
    'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    'NOW_SHOWING',
    NOW()
),
(
    'Doraemon Movie',
    'Phim hoat hinh phieu luu danh cho gia dinh.',
    'Animation',
    110,
    'Fujiko F. Fujio',
    '2026-06-10',
    'http://localhost:8081/uploads/movies/e96e5bac-c849-4de5-ad37-96f50ad69c25.jfif',
    'https://www.youtube.com/watch?v=ksjC9cDCmWs',
    'NOW_SHOWING',
    NOW()
),
(
    'Lat Mat 8',
    'Phim dien anh Viet Nam thuoc the loai hanh dong va tam ly.',
    'Drama',
    120,
    'Ly Hai',
    '2026-05-01',
    'http://localhost:8081/uploads/movies/637e3fea-f1ad-4819-ae78-6f1b7840a04a.jfif',
    '',
    'NOW_SHOWING',
    NOW()
);

USE user_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(255),
    role VARCHAR(255),
    created_at DATETIME
);

INSERT INTO users
(full_name, email, password, phone, role, created_at)
SELECT
    'Admin Cinema',
    'admin@gmail.com',
    '123456',
    '0900000000',
    'ADMIN',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@gmail.com'
);

USE showtime_db;

CREATE TABLE IF NOT EXISTS theaters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    location VARCHAR(255),
    room_count INT,
    status VARCHAR(30)
);

INSERT INTO theaters (name, address, city, location, room_count, status)
VALUES
('Rap CGV Cao Lo', '123 Cao Lo, Quan 8', 'Ho Chi Minh', 'Tang 3 trung tam thuong mai', 4, 'ONLINE'),
('Rap Galaxy Nguyen Trai', '456 Nguyen Trai, Quan 5', 'Ho Chi Minh', 'Khu B tang 2', 6, 'ONLINE'),
('Rap Lotte Thu Duc', '789 Vo Van Ngan, Thu Duc', 'Ho Chi Minh', 'Tang 5 khu giai tri', 5, 'ONLINE'),
('Rap BHD Pham Hung', '12 Pham Hung, Binh Chanh', 'Ho Chi Minh', 'Tang 4 trung tam thuong mai', 7, 'ONLINE'),
('Rap Cinestar Hai Ba Trung', '135 Hai Ba Trung, Quan 1', 'Ho Chi Minh', 'Khu rap tang 2', 5, 'ONLINE'),
('Rap Mega GS Cao Thang', '19 Cao Thang, Quan 3', 'Ho Chi Minh', 'Tang 6 khu vui choi', 4, 'ONLINE'),
('Rap Beta Tan Binh', '221 Cong Hoa, Tan Binh', 'Ho Chi Minh', 'Tang 3 khu dich vu', 6, 'ONLINE')
ON DUPLICATE KEY UPDATE
    address = VALUES(address),
    city = VALUES(city),
    location = VALUES(location),
    room_count = VALUES(room_count),
    status = VALUES(status);

CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    theater_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    seat_count INT,
    row_count INT,
    column_count INT,
    type VARCHAR(30),
    status VARCHAR(30),
    UNIQUE KEY uk_rooms_theater_name (theater_id, name),
    CONSTRAINT fk_rooms_theater
        FOREIGN KEY (theater_id) REFERENCES theaters(id)
        ON DELETE CASCADE
);

INSERT INTO rooms (theater_id, name, seat_count, type, status)
VALUES
(1, 'Phong 1', 80, '2D', 'ACTIVE'),
(1, 'Phong 2', 100, '3D', 'ACTIVE'),
(1, 'Phong VIP', 50, 'IMAX', 'ACTIVE'),
(2, 'Phong 1', 90, '2D', 'ACTIVE'),
(2, 'Phong 2', 120, '3D', 'ACTIVE'),
(3, 'Phong 1', 70, '2D', 'ACTIVE'),
(4, 'Phong 1', 100, '2D', 'ACTIVE')
ON DUPLICATE KEY UPDATE
    seat_count = VALUES(seat_count),
    type = VALUES(type),
    status = VALUES(status);

CREATE TABLE IF NOT EXISTS seats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id BIGINT NOT NULL,
    seat_code VARCHAR(20) NOT NULL,
    seat_row VARCHAR(10),
    seat_number INT,
    seat_type VARCHAR(30),
    extra_price DOUBLE,
    status VARCHAR(30),
    UNIQUE KEY uk_seats_room_code (room_id, seat_code),
    CONSTRAINT fk_seats_room
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS showtimes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    theater_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,

    -- ID phim thuộc movie-service
    movie_id BIGINT NOT NULL,

    movie_name VARCHAR(255) NOT NULL,
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    audio_language VARCHAR(50) DEFAULT 'Việt',
    subtitle_language VARCHAR(50),
    format_type VARCHAR(30) DEFAULT '2D',

    status VARCHAR(20) DEFAULT 'ONLINE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_showtimes_theater_date (theater_id, show_date),
    INDEX idx_showtimes_room_date_time (room_id, show_date, start_time, end_time),

    CONSTRAINT fk_showtime_theater
        FOREIGN KEY (theater_id) REFERENCES theaters(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_showtime_room
        FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE RESTRICT
);

USE booking_db;

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    showtime_id BIGINT,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(30),
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS booking_seats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    seat_id BIGINT,
    seat_code VARCHAR(20),
    price DECIMAL(12, 2) DEFAULT 0,
    CONSTRAINT fk_booking_seats_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ticket_pricing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    day_group VARCHAR(50) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    student_price DOUBLE DEFAULT 0,
    adult_price DOUBLE DEFAULT 0,
    child_senior_price DOUBLE DEFAULT 0,
    member_online_price DOUBLE DEFAULT 0,
    UNIQUE KEY uk_ticket_pricing_day_time (day_group, time_slot)
);

CREATE TABLE IF NOT EXISTS ticket_surcharges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    surcharge_key VARCHAR(50) NOT NULL UNIQUE,
    surcharge_name VARCHAR(100) NOT NULL,
    amount DOUBLE DEFAULT 0
);

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
 usage_limit, used_count, status)
VALUES
('WELCOME10', 'Chào thành viên mới', 'Giảm 10% cho lần đặt vé đầu tiên.',
 'https://placehold.co/640x320/2563eb/ffffff?text=WELCOME+10%25',
 'PERCENT', 10, 100000, 50000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 1000, 0, 'ONLINE'),
('HAPPY50K', 'Happy Day giảm 50.000đ', 'Giảm trực tiếp 50.000đ cho đơn đủ điều kiện.',
 'https://placehold.co/640x320/0891b2/ffffff?text=HAPPY+DAY+50K',
 'FIXED', 50000, 200000, NULL, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 500, 0, 'ONLINE'),
('MEMBER20', 'Ưu đãi thành viên 20%', 'Giảm 20% dành cho thành viên thân thiết.',
 'https://placehold.co/640x320/7c3aed/ffffff?text=MEMBER+20%25',
 'PERCENT', 20, 150000, 80000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 300, 0, 'ONLINE')
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

INSERT INTO ticket_pricing
(day_group, time_slot, student_price, adult_price, child_senior_price, member_online_price)
VALUES
('MON_THU', 'BEFORE_17H', 55000, 75000, 50000, 70000),
('MON_THU', 'AFTER_17H', 65000, 90000, 60000, 85000),
('FRI_SUN', 'BEFORE_17H', 70000, 95000, 65000, 90000),
('FRI_SUN', 'AFTER_17H', 80000, 115000, 75000, 105000),
('HOLIDAY', 'ALL_DAY', 90000, 130000, 85000, 120000)
ON DUPLICATE KEY UPDATE
    student_price = VALUES(student_price),
    adult_price = VALUES(adult_price),
    child_senior_price = VALUES(child_senior_price),
    member_online_price = VALUES(member_online_price);

INSERT INTO ticket_surcharges (surcharge_key, surcharge_name, amount)
VALUES
('ROOM_3D', 'Phụ thu phòng chiếu 3D', 15000),
('ROOM_IMAX', 'Phụ thu phòng chiếu IMAX', 30000),
('ROOM_4DX', 'Phụ thu phòng chiếu 4DX', 45000),
('SEAT_VIP', 'Phụ thu ghế VIP', 20000),
('SEAT_COUPLE', 'Phụ thu ghế đôi', 30000),
('WEEKEND', 'Phụ thu cuối tuần', 10000),
('HOLIDAY', 'Phụ thu ngày lễ', 20000),
('LATE_NIGHT', 'Phụ thu suất khuya', 5000)
ON DUPLICATE KEY UPDATE
    surcharge_name = VALUES(surcharge_name),
    amount = VALUES(amount);
