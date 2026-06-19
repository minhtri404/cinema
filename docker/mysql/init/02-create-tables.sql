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
    type VARCHAR(30),
    status VARCHAR(30),
    UNIQUE KEY uk_rooms_theater_name (theater_id, name)
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
    UNIQUE KEY uk_seats_room_code (room_id, seat_code)
);
