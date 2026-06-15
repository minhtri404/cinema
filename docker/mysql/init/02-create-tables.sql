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
    status VARCHAR(255),
    created_at DATETIME
);

INSERT INTO movies 
(title, description, genre, duration, director, release_date, poster_url, status, created_at)
VALUES
(
    'Avengers: Endgame',
    'Biet doi sieu anh hung chien dau de cuu vu tru.',
    'Action',
    181,
    'Anthony Russo, Joe Russo',
    '2026-06-01',
    'https://m.media-amazon.com/images/I/81ExhpBEbHL._AC_UF894,1000_QL80_.jpg',
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
    'https://m.media-amazon.com/images/I/71X5p0hKXBL._AC_UF894,1000_QL80_.jpg',
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
    'https://via.placeholder.com/300x450?text=Lat+Mat+8',
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
