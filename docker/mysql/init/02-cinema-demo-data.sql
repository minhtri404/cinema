-- Bộ dữ liệu mẫu nhất quán cho hệ thống HMCinema.
-- Tệp chạy sau 01-full-database.sql và có thể chạy lại an toàn trên MySQL 8.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

-- Dọn dữ liệu phát sinh gắn với bộ phim/lịch chiếu cũ.
DELETE FROM notification_db.notifications;
DELETE FROM payment_db.payment_transactions;
DELETE FROM booking_db.booking_foods;
DELETE FROM booking_db.booking_seats;
DELETE FROM booking_db.tickets;
DELETE FROM booking_db.payments;
DELETE FROM booking_db.bookings;
DELETE FROM booking_db.ticket_surcharges;
DELETE FROM booking_db.ticket_pricing;
DELETE FROM booking_db.promotions;
DELETE FROM booking_db.foods;
DELETE FROM showtime_db.showtimes;
DELETE FROM showtime_db.seats;
DELETE FROM showtime_db.rooms;
DELETE FROM showtime_db.theaters;
DELETE FROM movie_db.advertisements;
DELETE FROM movie_db.events;
DELETE FROM movie_db.news;
DELETE FROM movie_db.movies;
DELETE FROM movie_db.genres;
DELETE FROM media_db.media_assets;

ALTER TABLE notification_db.notifications AUTO_INCREMENT = 1;
ALTER TABLE payment_db.payment_transactions AUTO_INCREMENT = 1;
ALTER TABLE booking_db.booking_foods AUTO_INCREMENT = 1;
ALTER TABLE booking_db.booking_seats AUTO_INCREMENT = 1;
ALTER TABLE booking_db.tickets AUTO_INCREMENT = 1;
ALTER TABLE booking_db.payments AUTO_INCREMENT = 1;
ALTER TABLE booking_db.bookings AUTO_INCREMENT = 1;
ALTER TABLE booking_db.ticket_surcharges AUTO_INCREMENT = 1;
ALTER TABLE booking_db.ticket_pricing AUTO_INCREMENT = 1;
ALTER TABLE booking_db.promotions AUTO_INCREMENT = 1;
ALTER TABLE booking_db.foods AUTO_INCREMENT = 1;
ALTER TABLE showtime_db.showtimes AUTO_INCREMENT = 1;
ALTER TABLE showtime_db.seats AUTO_INCREMENT = 1;
ALTER TABLE showtime_db.rooms AUTO_INCREMENT = 1;
ALTER TABLE showtime_db.theaters AUTO_INCREMENT = 1;
ALTER TABLE movie_db.advertisements AUTO_INCREMENT = 1;
ALTER TABLE movie_db.events AUTO_INCREMENT = 1;
ALTER TABLE movie_db.news AUTO_INCREMENT = 1;
ALTER TABLE movie_db.movies AUTO_INCREMENT = 1;
ALTER TABLE movie_db.genres AUTO_INCREMENT = 1;
ALTER TABLE media_db.media_assets AUTO_INCREMENT = 1;

-- Giữ nguyên email/mật khẩu để các tài khoản hiện tại vẫn đăng nhập được.
UPDATE user_db.users SET full_name = 'Quản trị hệ thống', phone = '0901000001', email_verified = b'1' WHERE id = 1;
UPDATE user_db.users SET full_name = 'Nguyễn Quốc Bảo', phone = '0902000002', role = 'STAFF', email_verified = b'1' WHERE id = 2;
UPDATE user_db.users SET full_name = 'Trần Minh Khang', phone = '0902000003', role = 'STAFF', email_verified = b'1' WHERE id = 3;
UPDATE user_db.users SET full_name = 'Phạm Gia Huy', phone = '0902000004', role = 'STAFF', email_verified = b'1' WHERE id = 4;
UPDATE user_db.users SET full_name = 'Quản lý vận hành', phone = '0901000005', role = 'ADMIN', email_verified = b'1' WHERE id = 5;
UPDATE user_db.users SET full_name = 'Nguyễn Thảo Vy', phone = '0911000006', role = 'CUSTOMER', email_verified = b'1' WHERE id = 6;
UPDATE user_db.users SET full_name = 'Lê Hoàng Nam', phone = '0911000007', role = 'CUSTOMER', email_verified = b'1' WHERE id = 7;
UPDATE user_db.users SET full_name = 'Đỗ Minh Anh', phone = '0911000008', role = 'CUSTOMER', email_verified = b'1' WHERE id = 8;
UPDATE user_db.users SET full_name = 'Võ Khánh Ngân', phone = '0911000009', role = 'CUSTOMER', email_verified = b'1' WHERE id = 9;
UPDATE user_db.users SET full_name = 'Bùi Đức Anh', phone = '0911000010', role = 'CUSTOMER', email_verified = b'1' WHERE id = 10;
UPDATE user_db.users SET email_verified = b'1' WHERE id BETWEEN 11 AND 14;

-- Bổ sung tài khoản khách hàng mẫu, dùng lại mật khẩu đã mã hóa của tài khoản thành viên hiện có.
INSERT INTO user_db.users
  (id, full_name, email, password, phone, role, created_at, email_verification_token,
   email_verification_token_expires_at, email_verified)
SELECT 15, 'Mai Ngọc Anh', 'mai.ngoc.anh@example.com', password, '0911000015', 'CUSTOMER', NOW(), NULL, NULL, b'1'
FROM user_db.users WHERE id = 12
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), role = VALUES(role), email_verified = b'1';
INSERT INTO user_db.users
  (id, full_name, email, password, phone, role, created_at, email_verification_token,
   email_verification_token_expires_at, email_verified)
SELECT 16, 'Phan Tuấn Kiệt', 'phan.tuan.kiet@example.com', password, '0911000016', 'CUSTOMER', NOW(), NULL, NULL, b'1'
FROM user_db.users WHERE id = 12
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), role = VALUES(role), email_verified = b'1';
INSERT INTO user_db.users
  (id, full_name, email, password, phone, role, created_at, email_verification_token,
   email_verification_token_expires_at, email_verified)
SELECT 17, 'Huỳnh Bảo Trâm', 'huynh.bao.tram@example.com', password, '0911000017', 'CUSTOMER', NOW(), NULL, NULL, b'1'
FROM user_db.users WHERE id = 12
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), role = VALUES(role), email_verified = b'1';
INSERT INTO user_db.users
  (id, full_name, email, password, phone, role, created_at, email_verification_token,
   email_verification_token_expires_at, email_verified)
SELECT 18, 'Trương Hải Đăng', 'truong.hai.dang@example.com', password, '0911000018', 'CUSTOMER', NOW(), NULL, NULL, b'1'
FROM user_db.users WHERE id = 12
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), role = VALUES(role), email_verified = b'1';
INSERT INTO user_db.users
  (id, full_name, email, password, phone, role, created_at, email_verification_token,
   email_verification_token_expires_at, email_verified)
SELECT 19, 'Đặng Quỳnh Như', 'dang.quynh.nhu@example.com', password, '0911000019', 'CUSTOMER', NOW(), NULL, NULL, b'1'
FROM user_db.users WHERE id = 12
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), role = VALUES(role), email_verified = b'1';
INSERT INTO user_db.users
  (id, full_name, email, password, phone, role, created_at, email_verification_token,
   email_verification_token_expires_at, email_verified)
SELECT 20, 'Ngô Minh Châu', 'ngo.minh.chau@example.com', password, '0911000020', 'CUSTOMER', NOW(), NULL, NULL, b'1'
FROM user_db.users WHERE id = 12
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), role = VALUES(role), email_verified = b'1';
INSERT INTO user_db.users
  (id, full_name, email, password, phone, role, created_at, email_verification_token,
   email_verification_token_expires_at, email_verified)
SELECT seed.id, seed.full_name, seed.email, base.password, seed.phone, 'CUSTOMER', NOW(), NULL, NULL, b'1'
FROM (
  SELECT 21 AS id, 'Đinh Gia Hân' AS full_name, 'dinh.gia.han@example.com' AS email, '0911000021' AS phone
  UNION ALL SELECT 22, 'Nguyễn Thanh Tùng', 'nguyen.thanh.tung@example.com', '0911000022'
  UNION ALL SELECT 23, 'Lâm Mỹ Duyên', 'lam.my.duyen@example.com', '0911000023'
  UNION ALL SELECT 24, 'Trần Nhật Minh', 'tran.nhat.minh@example.com', '0911000024'
  UNION ALL SELECT 25, 'Phạm Khánh Linh', 'pham.khanh.linh@example.com', '0911000025'
  UNION ALL SELECT 26, 'Vũ Hoàng Phúc', 'vu.hoang.phuc@example.com', '0911000026'
  UNION ALL SELECT 27, 'Lý Bảo Ngọc', 'ly.bao.ngoc@example.com', '0911000027'
) seed
JOIN user_db.users base ON base.id = 12
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), role = VALUES(role), email_verified = b'1';

-- Ảnh có sẵn trong backend/media-service/uploads/seed.
INSERT INTO media_db.media_assets
  (id, owner_id, category, original_name, stored_name, content_type, size_bytes,
   checksum_sha256, storage_type, storage_path, public_url, alt_text, status, created_at, updated_at)
VALUES
  (1, 1, 'ADVERTISEMENTS', 'hero-cinema.png', 'seed-hero-cinema.png', 'image/png', 1620366,
   'f0b20f2ffbef8a51bdd5c1c2deec32141c74b833b5cb6453dbf988bbc3e81c12', 'LOCAL',
   'seed/advertisements/hero-cinema.png', '/media/files/1', 'Không gian phòng chiếu HMCinema', 'ACTIVE', NOW(), NOW()),
  (2, 1, 'ADVERTISEMENTS', 'combo-banner.png', 'seed-combo-banner.png', 'image/png', 1866883,
   '5767fdf2456936a56c98ae17be1ad57020df6707aca93c6378c90ab1bf8122d6', 'LOCAL',
   'seed/advertisements/combo-banner.png', '/media/files/2', 'Combo bắp nước tại HMCinema', 'ACTIVE', NOW(), NOW()),
  (3, 1, 'EVENTS', 'member-benefits.png', 'seed-member-benefits.png', 'image/png', 1737464,
   'b334ee97df3789394889c0b2ff63de3fd4ff564584c97c1b292076ccd6fd0972', 'LOCAL',
   'seed/events/member-benefits.png', '/media/files/3', 'Quyền lợi thành viên HMCinema', 'ACTIVE', NOW(), NOW()),
  (4, 1, 'FOODS', 'nachos.png', 'seed-nachos.png', 'image/png', 2160097,
   '581bbb359fee09151c238377c551e4029f93a2665524d47e2bb57ce443effb71', 'LOCAL',
   'seed/foods/nachos.png', '/media/files/4', 'Nachos và xốt phô mai', 'ACTIVE', NOW(), NOW()),
  (5, 1, 'FOODS', 'popcorn.png', 'seed-popcorn.png', 'image/png', 2027811,
   'ba08fd861a24c3894f01e6ce39ce9b477205842cb95fda8fd37424adb321f4a1', 'LOCAL',
   'seed/foods/popcorn.png', '/media/files/5', 'Bắp rang bơ HMCinema', 'ACTIVE', NOW(), NOW()),
  (6, 1, 'FOODS', 'soft-drinks.png', 'seed-soft-drinks.png', 'image/png', 2081125,
   '588a941e7424d041d9c7cd02078412082354764a971f99cc082d61df454514a3', 'LOCAL',
   'seed/foods/soft-drinks.png', '/media/files/6', 'Nước ngọt dùng tại rạp', 'ACTIVE', NOW(), NOW()),
  (7, 1, 'ADVERTISEMENTS', 'advertisement-3.jpg', 'advertisement-3.jpg', 'image/jpeg', 946274,
   'abb06ed43c36b812c7ad39667ca4fb0d92faf83d966c019e89c398c4b2bc13d2', 'LOCAL',
   'seed/advertisements/commons/advertisement-3.jpg', '/media/files/7', 'Không gian rạp chiếu phim hiện đại', 'ACTIVE', NOW(), NOW()),
  (8, 1, 'ADVERTISEMENTS', 'advertisement-4.jpg', 'advertisement-4.jpg', 'image/jpeg', 1554940,
   '2feee4155198c3465fae3e1b704e82bc56abf8a0962dddcba46579ef514edc16', 'LOCAL',
   'seed/advertisements/commons/advertisement-4.jpg', '/media/files/8', 'Hàng ghế trong phòng chiếu', 'ACTIVE', NOW(), NOW()),
  (9, 1, 'ADVERTISEMENTS', 'advertisement-5.jpg', 'advertisement-5.jpg', 'image/jpeg', 923672,
   '4b7c7fcd4b7f8cef6234047b22d73062659eb0f2490791beb5f2b63e835c696a', 'LOCAL',
   'seed/advertisements/commons/advertisement-5.jpg', '/media/files/9', 'Màn hình phòng chiếu phim', 'ACTIVE', NOW(), NOW()),
  (10, 1, 'ADVERTISEMENTS', 'advertisement-6.jpg', 'advertisement-6.jpg', 'image/jpeg', 1625500,
   '84909e1bf316527f09e74039872783367352ff856d0d33191323fd305b5301d9', 'LOCAL',
   'seed/advertisements/commons/advertisement-6.jpg', '/media/files/10', 'Sảnh phòng chiếu phim', 'ACTIVE', NOW(), NOW()),
  (11, 1, 'ADVERTISEMENTS', 'advertisement-7.jpg', 'advertisement-7.jpg', 'image/jpeg', 376660,
   'f46ae87d9f3654224e1724cf7cbc0b91e3b5eaa1f2a5f730ce95ba28e5f9b2fe', 'LOCAL',
   'seed/advertisements/commons/advertisement-7.jpg', '/media/files/11', 'Màn chiếu và ghế ngồi', 'ACTIVE', NOW(), NOW()),
  (12, 1, 'ADVERTISEMENTS', 'advertisement-8.jpg', 'advertisement-8.jpg', 'image/jpeg', 119726,
   '3e42d80e9f218058101c14042328a2545c972c9847ce7a19e7bdea531a114a7a', 'LOCAL',
   'seed/advertisements/commons/advertisement-8.jpg', '/media/files/12', 'Nội thất rạp chiếu phim cổ điển', 'ACTIVE', NOW(), NOW()),
  (13, 1, 'ADVERTISEMENTS', 'advertisement-9.jpg', 'advertisement-9.jpg', 'image/jpeg', 199929,
   'd1c9c64660977f38d869a8404f70b327626a50ea69d184a5b0dbe9f761153cea', 'LOCAL',
   'seed/advertisements/commons/advertisement-9.jpg', '/media/files/13', 'Phòng chiếu với nhiều hàng ghế', 'ACTIVE', NOW(), NOW()),
  (14, 1, 'ADVERTISEMENTS', 'advertisement-10.jpg', 'advertisement-10.jpg', 'image/jpeg', 797516,
   '7227042e75002d51ec5e11e453e73adf8578de22d375ffb07d92f5dd9d47eeee', 'LOCAL',
   'seed/advertisements/commons/advertisement-10.jpg', '/media/files/14', 'Khán phòng điện ảnh', 'ACTIVE', NOW(), NOW()),
  (15, 1, 'MOVIES', 'movie-01.jpg', 'movie-01.jpg', 'image/jpeg', 123716,
   '375cab22ca632a385d2289d8aa6c19763f432ca332c689f48d1247a8ea6cc05e', 'LOCAL', 'seed/movies/movie-01.jpg', '/media/files/15', 'Poster Avengers: Endgame', 'ACTIVE', NOW(), NOW()),
  (16, 1, 'MOVIES', 'movie-02.jpg', 'movie-02.jpg', 'image/jpeg', 105117,
   'b0711f176ef9669303a613b4a082fe16c6be24c5c7514856a7f25bf41623eaf0', 'LOCAL', 'seed/movies/movie-02.jpg', '/media/files/16', 'Poster Inside Out 2', 'ACTIVE', NOW(), NOW()),
  (17, 1, 'MOVIES', 'movie-03.jpg', 'movie-03.jpg', 'image/jpeg', 71669,
   '8c50a0147bb5e37e4ee45783a59f16fc79b61658b102b81007aa5cb52044acf4', 'LOCAL', 'seed/movies/movie-03.jpg', '/media/files/17', 'Poster Dune: Hành Tinh Cát - Phần Hai', 'ACTIVE', NOW(), NOW()),
  (18, 1, 'MOVIES', 'movie-04.jpg', 'movie-04.jpg', 'image/jpeg', 1235574,
   '740ca5b4039d19bc97e22253995fb0b0ed68a0157be9c42a887d707af7c06c6f', 'LOCAL', 'seed/movies/movie-04.jpg', '/media/files/18', 'Poster Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', 'ACTIVE', NOW(), NOW()),
  (19, 1, 'MOVIES', 'movie-05.jpg', 'movie-05.jpg', 'image/jpeg', 81366,
   '2e181c6b0d0975b67cee9563acba2e8f86df3ad7c3cf8773ca00d79d277189fe', 'LOCAL', 'seed/movies/movie-05.jpg', '/media/files/19', 'Poster Thám Tử Lừng Danh Conan', 'ACTIVE', NOW(), NOW()),
  (20, 1, 'MOVIES', 'movie-06.jpg', 'movie-06.jpg', 'image/jpeg', 101812,
   '4b2b5a1a41d322c73e8f88aa9607c2c269b7d1b245f9ecdcf55ad05e4a3f511f', 'LOCAL', 'seed/movies/movie-06.jpg', '/media/files/20', 'Poster Lật Mặt 8: Vòng Tay Nắng', 'ACTIVE', NOW(), NOW()),
  (21, 1, 'MOVIES', 'movie-07.jpg', 'movie-07.jpg', 'image/jpeg', 81436,
   '63f3d390966e7fcc9a0cd86ff1f34dc7d0ce85df189ef42b6833a315ed6e0767', 'LOCAL', 'seed/movies/movie-07.jpg', '/media/files/21', 'Poster Oppenheimer', 'ACTIVE', NOW(), NOW()),
  (22, 1, 'MOVIES', 'movie-08.jpg', 'movie-08.jpg', 'image/jpeg', 50327,
   'c37dd3aca7c947c83f7e920c7709e8aaccf8d506bfaaddb47fabcfbe11f570a8', 'LOCAL', 'seed/movies/movie-08.jpg', '/media/files/22', 'Poster Barbie', 'ACTIVE', NOW(), NOW()),
  (23, 1, 'MOVIES', 'movie-09.jpg', 'movie-09.jpg', 'image/jpeg', 83690,
   '058067fc74f3fa2505692534bf97dcde00bf1f1d89ae995fcc50724a4d93fd79', 'LOCAL', 'seed/movies/movie-09.jpg', '/media/files/23', 'Poster Spider-Man: Across the Spider-Verse', 'ACTIVE', NOW(), NOW()),
  (24, 1, 'MOVIES', 'movie-10.jpg', 'movie-10.jpg', 'image/jpeg', 97549,
   '8278cd88f445b3a1b1f69d368030191c1763d0aa26d0eb1d0a0e0d23d53cb5cf', 'LOCAL', 'seed/movies/movie-10.jpg', '/media/files/24', 'Poster The Super Mario Bros. Movie', 'ACTIVE', NOW(), NOW()),
  (25, 1, 'MOVIES', 'movie-11.jpg', 'movie-11.jpg', 'image/jpeg', 53823,
   '8e3706c938452be101e5b78cd7ae2100919a6785b54788f1077540a630bac2a8', 'LOCAL', 'seed/movies/movie-11.jpg', '/media/files/25', 'Poster John Wick: Chapter 4', 'ACTIVE', NOW(), NOW()),
  (26, 1, 'MOVIES', 'movie-12.jpg', 'movie-12.jpg', 'image/jpeg', 121167,
   'a66701f2c2897a704635c431d541c9d4a45e70a56e73a9a98316a86b145d2709', 'LOCAL', 'seed/movies/movie-12.jpg', '/media/files/26', 'Poster Guardians of the Galaxy Vol. 3', 'ACTIVE', NOW(), NOW()),
  (27, 1, 'MOVIES', 'movie-13.jpg', 'movie-13.jpg', 'image/jpeg', 81511,
   '9da9f772a79372194ff5b6bf1c6f68c032e24b7316b015fb25acb09273ad88b6', 'LOCAL', 'seed/movies/movie-13.jpg', '/media/files/27', 'Poster Mission: Impossible - Dead Reckoning', 'ACTIVE', NOW(), NOW()),
  (28, 1, 'MOVIES', 'movie-14.jpg', 'movie-14.jpg', 'image/jpeg', 113871,
   '8d93ea2b83d08da5241dd548b763c99c1e20f7e6715a379c0d7584efceb851f2', 'LOCAL', 'seed/movies/movie-14.jpg', '/media/files/28', 'Poster Wonka', 'ACTIVE', NOW(), NOW()),
  (29, 1, 'MOVIES', 'movie-15.jpg', 'movie-15.jpg', 'image/jpeg', 115135,
   'eb18b484e6aeecd30b729ed333187c8fea018e0c97779c5ef1ca6afab6ad07a2', 'LOCAL', 'seed/movies/movie-15.jpg', '/media/files/29', 'Poster Kung Fu Panda 4', 'ACTIVE', NOW(), NOW()),
  (30, 1, 'MOVIES', 'movie-16.jpg', 'movie-16.jpg', 'image/jpeg', 57557,
   'ac0142e29cc49295cb0e16ed2d57de0c4e05c5fb6e33b374b171b372e9cf9975', 'LOCAL', 'seed/movies/movie-16.jpg', '/media/files/30', 'Poster Godzilla x Kong: The New Empire', 'ACTIVE', NOW(), NOW()),
  (31, 1, 'MOVIES', 'movie-17.jpg', 'movie-17.jpg', 'image/jpeg', 117859,
   'd2cbc1b6d0f23bdb6822157093863793d53898e3fd10e43400bdcf632ed650e6', 'LOCAL', 'seed/movies/movie-17.jpg', '/media/files/31', 'Poster Furiosa: A Mad Max Saga', 'ACTIVE', NOW(), NOW()),
  (32, 1, 'MOVIES', 'movie-18.jpg', 'movie-18.jpg', 'image/jpeg', 48246,
   '5a6fcbb1c1326a578541edd46981d413c52cec47842f36a6252134039a89cc9e', 'LOCAL', 'seed/movies/movie-18.jpg', '/media/files/32', 'Poster A Quiet Place: Day One', 'ACTIVE', NOW(), NOW()),
  (33, 1, 'MOVIES', 'movie-19.jpg', 'movie-19.jpg', 'image/jpeg', 112439,
   'e79df8763196efc7d20f2365c8e3366964eb872f241494eddc6b008e89503d1d', 'LOCAL', 'seed/movies/movie-19.jpg', '/media/files/33', 'Poster Deadpool & Wolverine', 'ACTIVE', NOW(), NOW()),
  (34, 1, 'MOVIES', 'movie-20.jpg', 'movie-20.jpg', 'image/jpeg', 92254,
   '2a723bcd0bb30498ed90d5e1114a1fb1e23c3c905b7f053be1093fef9215fa14', 'LOCAL', 'seed/movies/movie-20.jpg', '/media/files/34', 'Poster Moana 2', 'ACTIVE', NOW(), NOW());

INSERT INTO movie_db.genres (id, name, description, active) VALUES
  (1, 'Hành động', 'Phim có nhịp độ nhanh và nhiều cảnh hành động.', b'1'),
  (2, 'Phiêu lưu', 'Những hành trình khám phá và thử thách.', b'1'),
  (3, 'Khoa học viễn tưởng', 'Câu chuyện về khoa học, công nghệ và tương lai.', b'1'),
  (4, 'Tình cảm', 'Phim tập trung vào tình yêu và các mối quan hệ.', b'1'),
  (5, 'Tâm lý', 'Câu chuyện giàu cảm xúc và chiều sâu nhân vật.', b'1'),
  (6, 'Hoạt hình', 'Phim hoạt hình dành cho nhiều độ tuổi.', b'1'),
  (7, 'Kinh dị', 'Phim có yếu tố hồi hộp và kinh dị.', b'1'),
  (8, 'Bí ẩn', 'Phim điều tra với các nút thắt bất ngờ.', b'1'),
  (9, 'Hài', 'Phim mang lại tiếng cười và không khí giải trí.', b'1'),
  (10, 'Gia đình', 'Nội dung gần gũi dành cho nhiều thế hệ.', b'1'),
  (11, 'Chính kịch', 'Câu chuyện chú trọng diễn biến và số phận nhân vật.', b'1'),
  (12, 'Tội phạm', 'Phim xoay quanh thế giới tội phạm và điều tra.', b'1'),
  (13, 'Âm nhạc', 'Câu chuyện gắn với âm nhạc và nghệ thuật biểu diễn.', b'1'),
  (14, 'Thể thao', 'Phim về thi đấu, nỗ lực và tinh thần đồng đội.', b'1'),
  (15, 'Chiến tranh', 'Câu chuyện đặt trong bối cảnh chiến tranh.', b'1'),
  (16, 'Lịch sử', 'Phim tái hiện con người và sự kiện lịch sử.', b'1'),
  (17, 'Giả tưởng', 'Thế giới kỳ ảo với những quy luật khác thường.', b'1'),
  (18, 'Siêu anh hùng', 'Phim về các nhân vật sở hữu năng lực đặc biệt.', b'1'),
  (19, 'Võ thuật', 'Phim nổi bật với các màn đối kháng và võ thuật.', b'1'),
  (20, 'Tài liệu', 'Phim ghi lại con người, sự kiện và đời sống thực tế.', b'1');

-- Poster được lưu bởi media-service; trailer dùng URL YouTube chính thức.
INSERT INTO movie_db.movies
  (id, title, description, director, duration, genre, poster_url, release_date, status, trailer_url, age_rating, created_at)
VALUES
  (1, 'Avengers: Endgame', 'Các siêu anh hùng còn lại tập hợp cho nhiệm vụ cuối cùng nhằm khôi phục những gì đã mất sau cuộc chiến với Thanos.', 'Anthony Russo, Joe Russo', 181, 'Hành động, Khoa học viễn tưởng', NULL, CURDATE() - INTERVAL 14 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=TcMBFSGVi1c', 'C13', NOW()),
  (2, 'Inside Out 2', 'Riley bước vào tuổi mới lớn, nơi những cảm xúc quen thuộc phải học cách chung sống với các cảm xúc hoàn toàn mới.', 'Kelsey Mann', 96, 'Hoạt hình, Tâm lý', NULL, CURDATE() - INTERVAL 10 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=LEjhY15eCx0', 'P', NOW()),
  (3, 'Dune: Hành Tinh Cát - Phần Hai', 'Paul Atreides tiếp tục hành trình trên Arrakis trong cuộc chiến về quyền lực, định mệnh và lòng trung thành.', 'Denis Villeneuve', 166, 'Khoa học viễn tưởng, Phiêu lưu', NULL, CURDATE() - INTERVAL 7 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=Way9Dexny3w', 'C16', NOW()),
  (4, 'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', 'Doraemon, Nobita và những người bạn bắt đầu chuyến phiêu lưu âm nhạc để bảo vệ Trái Đất.', 'Kazuaki Imai', 115, 'Hoạt hình, Phiêu lưu', NULL, CURDATE() - INTERVAL 5 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=HE5BVvMWOR4', 'P', NOW()),
  (5, 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô', 'Conan đối đầu một vụ án phức tạp xoay quanh thanh kiếm cổ và những bí mật bị che giấu.', 'Chika Nagaoka', 111, 'Bí ẩn, Hành động', NULL, CURDATE() - INTERVAL 3 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=CVzIBHlH7Ec', 'C13', NOW()),
  (6, 'Lật Mặt 8: Vòng Tay Nắng', 'Câu chuyện gia đình về ước mơ, khoảng cách thế hệ và hành trình tìm lại sự thấu hiểu.', 'Lý Hải', 135, 'Tâm lý, Gia đình', NULL, CURDATE() + INTERVAL 21 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=7bixyYF9-nk', 'C13', NOW()),
  (7, 'Oppenheimer', 'Nhà vật lý J. Robert Oppenheimer dẫn dắt dự án thay đổi tiến trình lịch sử nhân loại.', 'Christopher Nolan', 180, 'Chính kịch, Lịch sử', NULL, CURDATE() - INTERVAL 20 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=uYPbbksJxIg', 'C16', NOW()),
  (8, 'Barbie', 'Barbie rời thế giới hoàn hảo để khám phá cuộc sống thật và ý nghĩa của việc được là chính mình.', 'Greta Gerwig', 114, 'Hài, Giả tưởng', NULL, CURDATE() - INTERVAL 18 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=pBk4NYhWNMM', 'C13', NOW()),
  (9, 'Spider-Man: Across the Spider-Verse', 'Miles Morales bước vào chuyến phiêu lưu xuyên đa vũ trụ cùng những Người Nhện khác.', 'Joaquim Dos Santos', 140, 'Hoạt hình, Siêu anh hùng', NULL, CURDATE() - INTERVAL 16 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=cqGjhVJWtEg', 'C13', NOW()),
  (10, 'The Super Mario Bros. Movie', 'Mario và Luigi bước vào Vương quốc Nấm để đối đầu Bowser và cứu những người bạn.', 'Aaron Horvath, Michael Jelenic', 92, 'Hoạt hình, Phiêu lưu', NULL, CURDATE() - INTERVAL 12 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=TnGl01FkMMo', 'P', NOW()),
  (11, 'John Wick: Chapter 4', 'John Wick đối mặt những kẻ thù mới trên hành trình tìm kiếm tự do.', 'Chad Stahelski', 169, 'Hành động, Tội phạm', NULL, CURDATE() - INTERVAL 9 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=qEVUtrk8_B4', 'C18', NOW()),
  (12, 'Guardians of the Galaxy Vol. 3', 'Nhóm Vệ binh thực hiện nhiệm vụ nguy hiểm để bảo vệ một thành viên của gia đình.', 'James Gunn', 150, 'Hành động, Khoa học viễn tưởng', NULL, CURDATE() - INTERVAL 6 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=u3V5KDHRQvk', 'C13', NOW()),
  (13, 'Mission: Impossible - Dead Reckoning Part One', 'Ethan Hunt chạy đua ngăn một vũ khí mới rơi vào tay kẻ xấu.', 'Christopher McQuarrie', 163, 'Hành động, Phiêu lưu', NULL, CURDATE() - INTERVAL 4 DAY, 'NOW_SHOWING', 'https://www.youtube.com/watch?v=avz06PDqDbM', 'C16', NOW()),
  (14, 'Wonka', 'Willy Wonka trẻ tuổi theo đuổi giấc mơ tạo nên cửa hàng sô-cô-la đặc biệt.', 'Paul King', 116, 'Gia đình, Giả tưởng', NULL, CURDATE() + INTERVAL 5 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=otNh9bTjXWg', 'P', NOW()),
  (15, 'Kung Fu Panda 4', 'Po đảm nhận vai trò mới và đối đầu một đối thủ có khả năng biến hóa.', 'Mike Mitchell', 94, 'Hoạt hình, Võ thuật', NULL, CURDATE() + INTERVAL 8 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=_inKs4eeHiI', 'P', NOW()),
  (16, 'Godzilla x Kong: The New Empire', 'Godzilla và Kong hợp sức trước một hiểm họa ẩn sâu trong lòng đất.', 'Adam Wingard', 115, 'Hành động, Khoa học viễn tưởng', NULL, CURDATE() + INTERVAL 11 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=lV1OOlGwExM', 'C13', NOW()),
  (17, 'Furiosa: A Mad Max Saga', 'Furiosa trẻ tuổi tìm đường trở về quê hương trong một thế giới hậu tận thế.', 'George Miller', 148, 'Hành động, Phiêu lưu', NULL, CURDATE() + INTERVAL 14 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=XJMuhwVlca4', 'C18', NOW()),
  (18, 'A Quiet Place: Day One', 'Những người sống sót tìm cách im lặng khi thành phố bị sinh vật săn mồi tấn công.', 'Michael Sarnoski', 99, 'Kinh dị, Khoa học viễn tưởng', NULL, CURDATE() + INTERVAL 17 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=gjx-iHGXk9Q', 'C16', NOW()),
  (19, 'Deadpool & Wolverine', 'Deadpool hợp tác cùng Wolverine trong một nhiệm vụ làm thay đổi dòng thời gian.', 'Shawn Levy', 128, 'Hành động, Siêu anh hùng', NULL, CURDATE() + INTERVAL 20 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=73_1biulkYk', 'C18', NOW()),
  (20, 'Moana 2', 'Moana tiếp tục ra khơi theo lời gọi từ tổ tiên để khám phá những vùng biển xa.', 'David Derrick Jr.', 100, 'Hoạt hình, Phiêu lưu', NULL, CURDATE() + INTERVAL 25 DAY, 'COMING_SOON', 'https://www.youtube.com/watch?v=hDZ7y8RP5HE', 'P', NOW());

UPDATE movie_db.movies
SET poster_url = CONCAT('/media/files/', 14 + id);

INSERT INTO movie_db.advertisements
  (id, created_at, description, display_order, end_date, image_url, placement, start_date, status, target_url, title, updated_at)
VALUES
  (1, NOW(), 'Khám phá không gian phòng chiếu hiện đại và đặt vé trực tuyến thuận tiện.', 1,
   CURDATE() + INTERVAL 90 DAY, '/media/files/1', 'HOME_BANNER', CURDATE() - INTERVAL 1 DAY, 'ONLINE', '/movies',
   'Trải nghiệm điện ảnh trọn vẹn', NOW()),
  (2, NOW(), 'Đặt thêm combo bắp nước để buổi xem phim thêm trọn vẹn.', 2,
   CURDATE() + INTERVAL 60 DAY, '/media/files/2', 'HOME_BANNER', CURDATE() - INTERVAL 1 DAY, 'ONLINE', '/foods',
   'Combo ngon cho mọi suất chiếu', NOW()),
  (3, NOW(), 'Chủ động đặt vé sớm để lựa chọn vị trí ngồi yêu thích.', 3,
   CURDATE() + INTERVAL 75 DAY, '/media/files/7', 'HOME_BANNER', CURDATE(), 'ONLINE', '/movies',
   'Đặt vé sớm, chọn ghế đẹp', NOW()),
  (4, NOW(), 'Đăng nhập tài khoản để theo dõi vé và nhận quyền lợi thành viên.', 4,
   CURDATE() + INTERVAL 100 DAY, '/media/files/8', 'HOME_BANNER', CURDATE(), 'ONLINE', '/profile',
   'Thành viên xem phim nhiều hơn', NOW()),
  (5, NOW(), 'Thưởng thức phim trong không gian được thiết kế cho trải nghiệm điện ảnh.', 5,
   CURDATE() + INTERVAL 90 DAY, '/media/files/9', 'HOME_BANNER', CURDATE(), 'ONLINE', '/theaters',
   'Phòng chiếu hiện đại', NOW()),
  (6, NOW(), 'Lựa chọn suất chiếu cuối tuần và tận hưởng thời gian thư giãn.', 6,
   CURDATE() + INTERVAL 45 DAY, '/media/files/10', 'HOME_BANNER', CURDATE(), 'ONLINE', '/showtimes',
   'Cuối tuần tại HMCinema', NOW()),
  (7, NOW(), 'Các bộ phim phù hợp để cả gia đình cùng thưởng thức.', 7,
   CURDATE() + INTERVAL 60 DAY, '/media/files/11', 'HOME_BANNER', CURDATE(), 'ONLINE', '/movies',
   'Suất chiếu dành cho gia đình', NOW()),
  (8, NOW(), 'Âm thanh và hình ảnh được tối ưu cho từng định dạng phòng chiếu.', 8,
   CURDATE() + INTERVAL 80 DAY, '/media/files/12', 'HOME_BANNER', CURDATE(), 'ONLINE', '/theaters',
   'Trải nghiệm âm thanh sống động', NOW()),
  (9, NOW(), 'Chọn một bộ phim hay cho buổi hẹn cuối tuần.', 9,
   CURDATE() + INTERVAL 55 DAY, '/media/files/13', 'HOME_BANNER', CURDATE(), 'ONLINE', '/movies',
   'Hẹn hò cùng điện ảnh', NOW()),
  (10, NOW(), 'Cập nhật các phim và khung giờ đang mở bán trong tuần.', 10,
   CURDATE() + INTERVAL 70 DAY, '/media/files/14', 'HOME_BANNER', CURDATE(), 'ONLINE', '/showtimes',
   'Khám phá lịch phim tuần này', NOW());

INSERT INTO movie_db.events
  (id, apply_condition, content, created_at, end_date, image_url, staff_name, start_date, status, title)
VALUES
  (1, 'Áp dụng cho tài khoản thành viên đã xác thực email.', 'Tích điểm trên mỗi giao dịch và nhận ưu đãi dành riêng cho thành viên.', NOW(),
   CURDATE() + INTERVAL 120 DAY, '/media/files/3', 'Quản trị hệ thống', CURDATE(), 'ONLINE', 'Quyền lợi thành viên HMCinema'),
  (2, 'Áp dụng khi đặt vé trực tuyến kèm ít nhất một combo.', 'Ưu đãi dành cho khách hàng đặt vé và đồ ăn trong cùng một đơn.', NOW(),
   CURDATE() + INTERVAL 45 DAY, NULL, 'Quản lý vận hành', CURDATE(), 'ONLINE', 'Tháng combo điện ảnh'),
  (3, 'Tổ chức tại sảnh HMCinema Cao Lỗ, số lượng chỗ có hạn.', 'Giao lưu và chụp ảnh tại sảnh trước suất công chiếu đặc biệt.', NOW(),
   CURDATE() + INTERVAL 14 DAY, NULL, 'Nguyễn Quốc Bảo', CURDATE() + INTERVAL 7 DAY, 'OFFLINE', 'Giao lưu trước suất chiếu'),
  (4, 'Áp dụng cho khách hàng đặt vé vào thứ Hai.', 'Khởi động tuần mới bằng những suất chiếu có khung giờ thuận tiện.', NOW(), CURDATE() + INTERVAL 35 DAY, NULL, 'Quản lý vận hành', CURDATE(), 'ONLINE', 'Thứ Hai điện ảnh'),
  (5, 'Tổ chức tại HMCinema Nguyễn Trãi.', 'Không gian trưng bày áp phích và thông tin hậu trường của các bộ phim nổi bật.', NOW(), CURDATE() + INTERVAL 20 DAY, NULL, 'Trần Minh Khang', CURDATE() + INTERVAL 10 DAY, 'OFFLINE', 'Triển lãm áp phích phim'),
  (6, 'Áp dụng cho suất chiếu trước 17 giờ.', 'Chương trình dành cho khán giả yêu thích các suất chiếu ban ngày.', NOW(), CURDATE() + INTERVAL 50 DAY, NULL, 'Phạm Gia Huy', CURDATE(), 'ONLINE', 'Khung giờ ban ngày'),
  (7, 'Tổ chức tại khu vực sảnh, tham gia miễn phí.', 'Cùng trả lời câu hỏi điện ảnh và nhận quà lưu niệm từ HMCinema.', NOW(), CURDATE() + INTERVAL 18 DAY, NULL, 'Nguyễn Quốc Bảo', CURDATE() + INTERVAL 12 DAY, 'OFFLINE', 'Đố vui điện ảnh'),
  (8, 'Áp dụng cho phim hoạt hình được chọn.', 'Chuỗi suất chiếu thân thiện dành cho phụ huynh và trẻ nhỏ.', NOW(), CURDATE() + INTERVAL 75 DAY, NULL, 'Quản lý vận hành', CURDATE() + INTERVAL 3 DAY, 'ONLINE', 'Thế giới hoạt hình'),
  (9, 'Áp dụng cho tài khoản có ngày sinh trong tháng.', 'Thành viên sinh nhật trong tháng nhận quyền lợi khi đặt vé trực tuyến.', NOW(), CURDATE() + INTERVAL 120 DAY, NULL, 'Quản trị hệ thống', CURDATE(), 'ONLINE', 'Sinh nhật thành viên'),
  (10, 'Tổ chức tại HMCinema Thủ Đức.', 'Gặp gỡ cộng đồng yêu phim và chia sẻ cảm nhận sau buổi chiếu.', NOW(), CURDATE() + INTERVAL 28 DAY, NULL, 'Trần Minh Khang', CURDATE() + INTERVAL 21 DAY, 'OFFLINE', 'Câu lạc bộ yêu phim'),
  (11, 'Áp dụng cho đơn đặt từ hai vé trở lên.', 'Cùng bạn bè lựa chọn phim và ghế ngồi trong một đơn đặt vé.', NOW(), CURDATE() + INTERVAL 65 DAY, NULL, 'Quản lý vận hành', CURDATE(), 'ONLINE', 'Đi xem phim cùng bạn'),
  (12, 'Tổ chức trước suất chiếu mở màn.', 'Khán giả có thể chụp ảnh tại khu vực chủ đề của bộ phim.', NOW(), CURDATE() + INTERVAL 16 DAY, NULL, 'Phạm Gia Huy', CURDATE() + INTERVAL 9 DAY, 'OFFLINE', 'Góc chụp ảnh điện ảnh'),
  (13, 'Áp dụng cho một số phim có phụ đề tiếng Việt.', 'Giới thiệu tuyển chọn phim quốc tế đang được khán giả quan tâm.', NOW(), CURDATE() + INTERVAL 40 DAY, NULL, 'Quản trị hệ thống', CURDATE() + INTERVAL 2 DAY, 'ONLINE', 'Tuần phim quốc tế'),
  (14, 'Tổ chức tại sảnh HMCinema Cao Lỗ.', 'Hoạt động đổi sách và trò chuyện về những tác phẩm được chuyển thể thành phim.', NOW(), CURDATE() + INTERVAL 30 DAY, NULL, 'Nguyễn Quốc Bảo', CURDATE() + INTERVAL 23 DAY, 'OFFLINE', 'Sách và điện ảnh'),
  (15, 'Áp dụng cho suất chiếu sau 20 giờ.', 'Chuỗi suất chiếu dành cho khán giả yêu không khí điện ảnh buổi tối.', NOW(), CURDATE() + INTERVAL 55 DAY, NULL, 'Quản lý vận hành', CURDATE(), 'ONLINE', 'Đêm điện ảnh'),
  (16, 'Tổ chức tại HMCinema Nguyễn Trãi.', 'Hướng dẫn cơ bản về quy trình vận hành rạp và phòng chiếu.', NOW(), CURDATE() + INTERVAL 25 DAY, NULL, 'Trần Minh Khang', CURDATE() + INTERVAL 19 DAY, 'OFFLINE', 'Khám phá hậu trường rạp'),
  (17, 'Áp dụng cho thành viên đã có giao dịch trước đó.', 'Chương trình tri ân dành cho khán giả thường xuyên đồng hành cùng rạp.', NOW(), CURDATE() + INTERVAL 90 DAY, NULL, 'Quản trị hệ thống', CURDATE(), 'ONLINE', 'Cảm ơn thành viên'),
  (18, 'Tổ chức tại khu vực chờ trước phòng chiếu.', 'Biểu diễn âm nhạc nhẹ trước các suất chiếu được chọn.', NOW(), CURDATE() + INTERVAL 22 DAY, NULL, 'Phạm Gia Huy', CURDATE() + INTERVAL 15 DAY, 'OFFLINE', 'Âm nhạc trước giờ chiếu'),
  (19, 'Áp dụng cho phim thuộc thể loại hành động.', 'Tổng hợp các phim hành động nổi bật đang mở bán.', NOW(), CURDATE() + INTERVAL 42 DAY, NULL, 'Quản lý vận hành', CURDATE(), 'ONLINE', 'Mùa phim hành động'),
  (20, 'Tổ chức tại HMCinema Thủ Đức, cần đăng ký trước.', 'Buổi chia sẻ cách cảm nhận ngôn ngữ hình ảnh và âm thanh trong phim.', NOW(), CURDATE() + INTERVAL 33 DAY, NULL, 'Nguyễn Quốc Bảo', CURDATE() + INTERVAL 26 DAY, 'OFFLINE', 'Trò chuyện về ngôn ngữ điện ảnh');

-- Mỗi sự kiện có một ảnh mạng cố định; sự kiện đầu tiên giữ ảnh do media-service quản lý.
UPDATE movie_db.events
SET image_url = CASE
  WHEN id = 1 THEN '/media/files/3'
  ELSE CONCAT('https://loremflickr.com/960/540/cinema,event?lock=', 1000 + id)
END;

INSERT INTO movie_db.news
  (id, content, created_at, image_url, staff_name, status, title, updated_at)
VALUES
  (1, 'HMCinema cập nhật hệ thống phòng chiếu, âm thanh và quy trình phục vụ nhằm mang lại trải nghiệm ổn định hơn cho khán giả.', NOW(), NULL, 'Quản trị hệ thống', 'ONLINE', 'HMCinema nâng cấp trải nghiệm phòng chiếu', NOW()),
  (2, 'Khách hàng có thể chọn ghế, thêm combo và thanh toán trực tuyến ngay trên website trước khi đến rạp.', NOW(), NULL, 'Quản lý vận hành', 'ONLINE', 'Hướng dẫn đặt vé và combo trực tuyến', NOW()),
  (3, 'Thành viên đăng nhập có thể theo dõi lịch sử đặt vé và nhận các quyền lợi theo từng chương trình.', NOW(), NULL, 'Nguyễn Quốc Bảo', 'ONLINE', 'Những tiện ích dành cho thành viên', NOW()),
  (4, 'Lịch chiếu được cập nhật theo ngày và theo từng cụm rạp để khách hàng dễ dàng lựa chọn.', NOW(), NULL, 'Quản lý vận hành', 'ONLINE', 'Cách tra cứu lịch chiếu nhanh', NOW()),
  (5, 'Khách hàng nên kiểm tra phim, rạp, phòng, ngày giờ và ghế trước khi chuyển sang thanh toán.', NOW(), NULL, 'Trần Minh Khang', 'ONLINE', 'Lưu ý trước khi thanh toán vé', NOW()),
  (6, 'Mỗi định dạng phòng chiếu mang lại trải nghiệm hình ảnh và âm thanh khác nhau.', NOW(), NULL, 'Phạm Gia Huy', 'ONLINE', 'Tìm hiểu các định dạng phòng chiếu', NOW()),
  (7, 'Sơ đồ ghế thể hiện rõ ghế thường, ghế VIP, ghế đôi và trạng thái ghế đã đặt.', NOW(), NULL, 'Nguyễn Quốc Bảo', 'ONLINE', 'Hướng dẫn chọn ghế phù hợp', NOW()),
  (8, 'Các combo được thiết kế cho nhiều nhu cầu từ cá nhân, cặp đôi đến nhóm gia đình.', NOW(), NULL, 'Quản lý vận hành', 'ONLINE', 'Chọn combo cho buổi xem phim', NOW()),
  (9, 'Mã vé và thông tin đơn được lưu trong tài khoản sau khi thanh toán thành công.', NOW(), NULL, 'Quản trị hệ thống', 'ONLINE', 'Tra cứu vé điện tử sau thanh toán', NOW()),
  (10, 'Khách hàng nên có mặt sớm để kiểm tra vé và ổn định chỗ ngồi trước giờ chiếu.', NOW(), NULL, 'Trần Minh Khang', 'ONLINE', 'Nên đến rạp trước bao lâu', NOW()),
  (11, 'HMCinema công bố các quy định chung nhằm giữ không gian xem phim văn minh.', NOW(), NULL, 'Phạm Gia Huy', 'ONLINE', 'Quy tắc tại phòng chiếu', NOW()),
  (12, 'Thông tin phân loại độ tuổi giúp khán giả lựa chọn nội dung phù hợp.', NOW(), NULL, 'Nguyễn Quốc Bảo', 'ONLINE', 'Hiểu đúng nhãn phân loại phim', NOW()),
  (13, 'Website hỗ trợ lọc phim theo trạng thái đang chiếu và sắp chiếu.', NOW(), NULL, 'Quản lý vận hành', 'ONLINE', 'Khám phá phim đang và sắp chiếu', NOW()),
  (14, 'Thông tin rạp bao gồm địa chỉ, phòng chiếu và trạng thái hoạt động.', NOW(), NULL, 'Quản trị hệ thống', 'ONLINE', 'Danh sách cụm rạp HMCinema', NOW()),
  (15, 'Khách hàng có thể theo dõi trạng thái đơn vé trong khu vực tài khoản.', NOW(), NULL, 'Trần Minh Khang', 'ONLINE', 'Theo dõi trạng thái đơn đặt vé', NOW()),
  (16, 'Email chỉ được gửi khi đơn đã thanh toán hoặc khi vé bị hủy theo quy trình.', NOW(), NULL, 'Phạm Gia Huy', 'ONLINE', 'Thông báo email cho đơn vé', NOW()),
  (17, 'Các ưu đãi có thời hạn, điều kiện áp dụng và số lượt sử dụng riêng.', NOW(), NULL, 'Nguyễn Quốc Bảo', 'ONLINE', 'Cách sử dụng mã khuyến mãi', NOW()),
  (18, 'Ghế đã giữ tạm sẽ được giải phóng khi hết thời gian thanh toán.', NOW(), NULL, 'Quản lý vận hành', 'ONLINE', 'Cơ chế giữ ghế khi đặt vé', NOW()),
  (19, 'Dữ liệu lịch chiếu và giá vé được quản lý thống nhất theo từng rạp.', NOW(), NULL, 'Quản trị hệ thống', 'ONLINE', 'HMCinema chuẩn hóa dữ liệu vận hành', NOW()),
  (20, 'Đội ngũ hỗ trợ tiếp nhận phản hồi liên quan đến tài khoản, thanh toán và vé điện tử.', NOW(), NULL, 'Trần Minh Khang', 'ONLINE', 'Các kênh hỗ trợ khách hàng', NOW());

UPDATE movie_db.news
SET image_url = CONCAT('https://loremflickr.com/960/540/movie,theater?lock=', 2000 + id);

INSERT INTO showtime_db.theaters (id, address, city, location, name, room_count, status) VALUES
  (1, '8 Cao Lỗ, Phường Chánh Hưng', 'TP. Hồ Chí Minh', 'Khu Nam Sài Gòn', 'HMCinema Cao Lỗ', 3, 'ONLINE'),
  (2, '191 Nguyễn Trãi, Phường Bến Thành', 'TP. Hồ Chí Minh', 'Trung tâm thành phố', 'HMCinema Nguyễn Trãi', 2, 'ONLINE'),
  (3, '240 Võ Văn Ngân, Phường Thủ Đức', 'TP. Hồ Chí Minh', 'Khu đô thị Thủ Đức', 'HMCinema Thủ Đức', 2, 'ONLINE'),
  (4, '60A Trường Sơn, Phường Tân Sơn Hòa', 'TP. Hồ Chí Minh', 'Khu vực sân bay', 'HMCinema Trường Sơn', 1, 'ONLINE'),
  (5, '12 Phan Văn Trị, Phường Gò Vấp', 'TP. Hồ Chí Minh', 'Khu Đông Bắc', 'HMCinema Gò Vấp', 1, 'ONLINE'),
  (6, '1058 Nguyễn Văn Linh, Phường Tân Phong', 'TP. Hồ Chí Minh', 'Khu đô thị Phú Mỹ Hưng', 'HMCinema Nguyễn Văn Linh', 1, 'ONLINE'),
  (7, '875 Cách Mạng Tháng Tám, Phường Hòa Hưng', 'TP. Hồ Chí Minh', 'Khu trung tâm', 'HMCinema Hòa Hưng', 1, 'ONLINE'),
  (8, '20 Cộng Hòa, Phường Bảy Hiền', 'TP. Hồ Chí Minh', 'Khu Tây Bắc', 'HMCinema Cộng Hòa', 1, 'ONLINE'),
  (9, '148 Trần Quang Khải, Phường Tân Định', 'TP. Hồ Chí Minh', 'Khu Tân Định', 'HMCinema Tân Định', 1, 'ONLINE'),
  (10, '222 Võ Văn Kiệt, Phường Cầu Ông Lãnh', 'TP. Hồ Chí Minh', 'Đại lộ Võ Văn Kiệt', 'HMCinema Võ Văn Kiệt', 1, 'ONLINE'),
  (11, '99 Lê Văn Việt, Phường Tăng Nhơn Phú', 'TP. Hồ Chí Minh', 'Khu công nghệ cao', 'HMCinema Lê Văn Việt', 1, 'ONLINE'),
  (12, '45 Kinh Dương Vương, Phường An Lạc', 'TP. Hồ Chí Minh', 'Bến xe Miền Tây', 'HMCinema An Lạc', 1, 'ONLINE'),
  (13, '168 Nguyễn Ảnh Thủ, Phường Trung Mỹ Tây', 'TP. Hồ Chí Minh', 'Khu Tây Bắc', 'HMCinema Trung Mỹ Tây', 1, 'ONLINE'),
  (14, '30 Bờ Bao Tân Thắng, Phường Sơn Kỳ', 'TP. Hồ Chí Minh', 'Khu Tây Sài Gòn', 'HMCinema Tân Thắng', 1, 'ONLINE'),
  (15, '150 Điện Biên Phủ, Phường Gia Định', 'TP. Hồ Chí Minh', 'Khu Gia Định', 'HMCinema Gia Định', 1, 'ONLINE'),
  (16, '1 Quang Trung, Phường Hạnh Thông', 'TP. Hồ Chí Minh', 'Khu Bắc thành phố', 'HMCinema Quang Trung', 1, 'ONLINE'),
  (17, '50 Nguyễn Huệ, Phường Sài Gòn', 'TP. Hồ Chí Minh', 'Phố đi bộ Nguyễn Huệ', 'HMCinema Nguyễn Huệ', 0, 'OFFLINE'),
  (18, '200 Xa lộ Hà Nội, Phường An Khánh', 'TP. Hồ Chí Minh', 'Khu Đông thành phố', 'HMCinema An Khánh', 0, 'OFFLINE'),
  (19, '75 Hoàng Văn Thụ, Phường Tân Sơn Nhất', 'TP. Hồ Chí Minh', 'Khu Tân Sơn Nhất', 'HMCinema Hoàng Văn Thụ', 0, 'OFFLINE'),
  (20, '300 Tên Lửa, Phường Bình Trị Đông', 'TP. Hồ Chí Minh', 'Khu Bình Tân', 'HMCinema Tên Lửa', 0, 'OFFLINE');

INSERT INTO showtime_db.rooms
  (id, column_count, name, row_count, seat_count, status, theater_id, type)
VALUES
  (1, 10, 'Phòng 1', 8, 80, 'ACTIVE', 1, '2D'),
  (2, 10, 'Phòng 2', 8, 80, 'ACTIVE', 1, '3D'),
  (3, 8, 'Phòng Premium', 6, 48, 'ACTIVE', 1, '2D'),
  (4, 10, 'Phòng 1', 8, 80, 'ACTIVE', 2, '2D'),
  (5, 12, 'Phòng IMAX', 8, 96, 'ACTIVE', 2, 'IMAX'),
  (6, 10, 'Phòng 1', 8, 80, 'ACTIVE', 3, '2D'),
  (7, 10, 'Phòng 2', 8, 80, 'ACTIVE', 3, '3D'),
  (8, 8, 'Phòng 1', 6, 48, 'ACTIVE', 4, '2D'),
  (9, 8, 'Phòng 1', 6, 48, 'ACTIVE', 5, '3D'),
  (10, 8, 'Phòng 1', 6, 48, 'ACTIVE', 6, '2D'),
  (11, 8, 'Phòng 1', 6, 48, 'ACTIVE', 7, '2D'),
  (12, 8, 'Phòng 1', 6, 48, 'ACTIVE', 8, '3D'),
  (13, 8, 'Phòng 1', 6, 48, 'ACTIVE', 9, '2D'),
  (14, 8, 'Phòng 1', 6, 48, 'ACTIVE', 10, '2D'),
  (15, 8, 'Phòng 1', 6, 48, 'ACTIVE', 11, '3D'),
  (16, 8, 'Phòng 1', 6, 48, 'ACTIVE', 12, '2D'),
  (17, 8, 'Phòng 1', 6, 48, 'ACTIVE', 13, '2D'),
  (18, 8, 'Phòng 1', 6, 48, 'ACTIVE', 14, '3D'),
  (19, 8, 'Phòng 1', 6, 48, 'ACTIVE', 15, '2D'),
  (20, 8, 'Phòng 1', 6, 48, 'ACTIVE', 16, '2D');

DROP PROCEDURE IF EXISTS showtime_db.seed_room_seats;
DELIMITER $$
CREATE PROCEDURE showtime_db.seed_room_seats(
  IN p_room_id BIGINT,
  IN p_rows INT,
  IN p_columns INT,
  IN p_vip_rows INT
)
BEGIN
  DECLARE v_row INT DEFAULT 1;
  DECLARE v_column INT;
  DECLARE v_type VARCHAR(30);
  DECLARE v_extra DOUBLE;
  WHILE v_row <= p_rows DO
    SET v_column = 1;
    WHILE v_column <= p_columns DO
      IF v_row = p_rows THEN
        SET v_type = 'COUPLE';
        SET v_extra = 30000;
      ELSEIF v_row <= p_vip_rows THEN
        SET v_type = 'VIP';
        SET v_extra = 20000;
      ELSE
        SET v_type = 'STANDARD';
        SET v_extra = 0;
      END IF;
      INSERT INTO showtime_db.seats
        (extra_price, room_id, seat_code, seat_number, seat_row, seat_type, status)
      VALUES
        (v_extra, p_room_id, CONCAT(CHAR(64 + v_row), v_column), v_column, CHAR(64 + v_row), v_type, 'ACTIVE');
      SET v_column = v_column + 1;
    END WHILE;
    SET v_row = v_row + 1;
  END WHILE;
END$$
DELIMITER ;

CALL showtime_db.seed_room_seats(1, 8, 10, 2);
CALL showtime_db.seed_room_seats(2, 8, 10, 2);
CALL showtime_db.seed_room_seats(3, 6, 8, 5);
CALL showtime_db.seed_room_seats(4, 8, 10, 2);
CALL showtime_db.seed_room_seats(5, 8, 12, 2);
CALL showtime_db.seed_room_seats(6, 8, 10, 2);
CALL showtime_db.seed_room_seats(7, 8, 10, 2);
CALL showtime_db.seed_room_seats(8, 6, 8, 2);
CALL showtime_db.seed_room_seats(9, 6, 8, 2);
CALL showtime_db.seed_room_seats(10, 6, 8, 2);
CALL showtime_db.seed_room_seats(11, 6, 8, 2);
CALL showtime_db.seed_room_seats(12, 6, 8, 2);
CALL showtime_db.seed_room_seats(13, 6, 8, 2);
CALL showtime_db.seed_room_seats(14, 6, 8, 2);
CALL showtime_db.seed_room_seats(15, 6, 8, 2);
CALL showtime_db.seed_room_seats(16, 6, 8, 2);
CALL showtime_db.seed_room_seats(17, 6, 8, 2);
CALL showtime_db.seed_room_seats(18, 6, 8, 2);
CALL showtime_db.seed_room_seats(19, 6, 8, 2);
CALL showtime_db.seed_room_seats(20, 6, 8, 2);
DROP PROCEDURE showtime_db.seed_room_seats;

INSERT INTO showtime_db.showtimes
  (id, audio_language, created_at, end_time, format_type, movie_id, movie_name, room_id,
   show_date, start_time, status, subtitle_language, theater_id)
VALUES
  (1, 'Tiếng Anh', NOW(), '13:01:00', '2D', 1, 'Avengers: Endgame', 1, CURDATE() + INTERVAL 1 DAY, '10:00:00', 'ONLINE', 'Tiếng Việt', 1),
  (2, 'Tiếng Anh', NOW(), '14:56:00', '3D', 2, 'Inside Out 2', 2, CURDATE() + INTERVAL 1 DAY, '13:20:00', 'ONLINE', 'Tiếng Việt', 1),
  (3, 'Tiếng Anh', NOW(), '19:46:00', '2D', 3, 'Dune: Hành Tinh Cát - Phần Hai', 3, CURDATE() + INTERVAL 1 DAY, '17:00:00', 'ONLINE', 'Tiếng Việt', 1),
  (4, 'Tiếng Việt', NOW(), '22:05:00', '2D', 4, 'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', 4, CURDATE() + INTERVAL 1 DAY, '20:10:00', 'ONLINE', 'Không', 2),
  (5, 'Tiếng Nhật', NOW(), '23:51:00', 'IMAX', 5, 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô', 5, CURDATE() + INTERVAL 1 DAY, '22:00:00', 'ONLINE', 'Tiếng Việt', 2),
  (6, 'Tiếng Việt', NOW(), '12:15:00', '2D', 4, 'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', 6, CURDATE() + INTERVAL 2 DAY, '10:20:00', 'ONLINE', 'Không', 3),
  (7, 'Tiếng Anh', NOW(), '16:31:00', '3D', 1, 'Avengers: Endgame', 7, CURDATE() + INTERVAL 2 DAY, '13:30:00', 'ONLINE', 'Tiếng Việt', 3),
  (8, 'Tiếng Anh', NOW(), '19:06:00', '2D', 2, 'Inside Out 2', 1, CURDATE() + INTERVAL 2 DAY, '17:30:00', 'ONLINE', 'Tiếng Việt', 1),
  (9, 'Tiếng Anh', NOW(), '22:56:00', '3D', 3, 'Dune: Hành Tinh Cát - Phần Hai', 2, CURDATE() + INTERVAL 2 DAY, '20:10:00', 'ONLINE', 'Tiếng Việt', 1),
  (10, 'Tiếng Anh', NOW(), '13:11:00', '2D', 1, 'Avengers: Endgame', 4, CURDATE() + INTERVAL 3 DAY, '10:10:00', 'ONLINE', 'Tiếng Việt', 2),
  (11, 'Tiếng Việt', NOW(), '15:45:00', '2D', 4, 'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', 6, CURDATE() + INTERVAL 3 DAY, '13:50:00', 'ONLINE', 'Không', 3),
  (12, 'Tiếng Nhật', NOW(), '19:31:00', 'IMAX', 5, 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô', 5, CURDATE() + INTERVAL 3 DAY, '17:40:00', 'ONLINE', 'Tiếng Việt', 2),
  (13, 'Tiếng Anh', NOW(), '23:16:00', '2D', 3, 'Dune: Hành Tinh Cát - Phần Hai', 3, CURDATE() + INTERVAL 3 DAY, '20:30:00', 'ONLINE', 'Tiếng Việt', 1),
  (14, 'Tiếng Anh', NOW(), '11:46:00', '2D', 2, 'Inside Out 2', 1, CURDATE() + INTERVAL 4 DAY, '10:10:00', 'ONLINE', 'Tiếng Việt', 1),
  (15, 'Tiếng Anh', NOW(), '16:31:00', '3D', 1, 'Avengers: Endgame', 7, CURDATE() + INTERVAL 4 DAY, '13:30:00', 'ONLINE', 'Tiếng Việt', 3),
  (16, 'Tiếng Việt', NOW(), '19:55:00', '2D', 4, 'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', 4, CURDATE() + INTERVAL 4 DAY, '18:00:00', 'ONLINE', 'Không', 2),
  (17, 'Tiếng Nhật', NOW(), '22:21:00', '3D', 5, 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô', 2, CURDATE() + INTERVAL 4 DAY, '20:30:00', 'ONLINE', 'Tiếng Việt', 1),
  (18, 'Tiếng Anh', NOW(), '12:56:00', '2D', 3, 'Dune: Hành Tinh Cát - Phần Hai', 6, CURDATE() + INTERVAL 5 DAY, '10:10:00', 'ONLINE', 'Tiếng Việt', 3),
  (19, 'Tiếng Anh', NOW(), '16:41:00', '2D', 1, 'Avengers: Endgame', 3, CURDATE() + INTERVAL 5 DAY, '13:40:00', 'ONLINE', 'Tiếng Việt', 1),
  (20, 'Tiếng Anh', NOW(), '19:16:00', '2D', 2, 'Inside Out 2', 4, CURDATE() + INTERVAL 5 DAY, '17:40:00', 'ONLINE', 'Tiếng Việt', 2),
  (21, 'Tiếng Việt', NOW(), '12:15:00', '2D', 6, 'Lật Mặt 8: Vòng Tay Nắng', 8, CURDATE() + INTERVAL 21 DAY, '10:00:00', 'ONLINE', 'Không', 4),
  (22, 'Tiếng Anh', NOW(), '13:00:00', '3D', 7, 'Oppenheimer', 9, CURDATE() + INTERVAL 6 DAY, '10:00:00', 'ONLINE', 'Tiếng Việt', 5),
  (23, 'Tiếng Anh', NOW(), '15:24:00', '2D', 8, 'Barbie', 10, CURDATE() + INTERVAL 6 DAY, '13:30:00', 'ONLINE', 'Tiếng Việt', 6),
  (24, 'Tiếng Anh', NOW(), '18:20:00', '2D', 9, 'Spider-Man: Across the Spider-Verse', 11, CURDATE() + INTERVAL 6 DAY, '16:00:00', 'ONLINE', 'Tiếng Việt', 7),
  (25, 'Tiếng Anh', NOW(), '20:32:00', '3D', 10, 'The Super Mario Bros. Movie', 12, CURDATE() + INTERVAL 6 DAY, '19:00:00', 'ONLINE', 'Tiếng Việt', 8),
  (26, 'Tiếng Anh', NOW(), '13:09:00', '2D', 11, 'John Wick: Chapter 4', 13, CURDATE() + INTERVAL 7 DAY, '10:20:00', 'ONLINE', 'Tiếng Việt', 9),
  (27, 'Tiếng Anh', NOW(), '16:10:00', '2D', 12, 'Guardians of the Galaxy Vol. 3', 14, CURDATE() + INTERVAL 7 DAY, '13:40:00', 'ONLINE', 'Tiếng Việt', 10),
  (28, 'Tiếng Anh', NOW(), '19:43:00', '3D', 13, 'Mission: Impossible - Dead Reckoning Part One', 15, CURDATE() + INTERVAL 7 DAY, '17:00:00', 'ONLINE', 'Tiếng Việt', 11),
  (29, 'Tiếng Anh', NOW(), '11:56:00', '2D', 14, 'Wonka', 16, CURDATE() + INTERVAL 5 DAY, '10:00:00', 'ONLINE', 'Tiếng Việt', 12),
  (30, 'Tiếng Anh', NOW(), '14:04:00', '2D', 15, 'Kung Fu Panda 4', 17, CURDATE() + INTERVAL 8 DAY, '12:30:00', 'ONLINE', 'Tiếng Việt', 13),
  (31, 'Tiếng Anh', NOW(), '16:25:00', '3D', 16, 'Godzilla x Kong: The New Empire', 18, CURDATE() + INTERVAL 11 DAY, '14:30:00', 'ONLINE', 'Tiếng Việt', 14),
  (32, 'Tiếng Anh', NOW(), '19:28:00', '2D', 17, 'Furiosa: A Mad Max Saga', 19, CURDATE() + INTERVAL 14 DAY, '17:00:00', 'ONLINE', 'Tiếng Việt', 15),
  (33, 'Tiếng Anh', NOW(), '21:39:00', '2D', 18, 'A Quiet Place: Day One', 20, CURDATE() + INTERVAL 17 DAY, '20:00:00', 'ONLINE', 'Tiếng Việt', 16),
  (34, 'Tiếng Anh', NOW(), '15:08:00', '2D', 19, 'Deadpool & Wolverine', 8, CURDATE() + INTERVAL 20 DAY, '13:00:00', 'ONLINE', 'Tiếng Việt', 4),
  (35, 'Tiếng Anh', NOW(), '16:40:00', '3D', 20, 'Moana 2', 9, CURDATE() + INTERVAL 25 DAY, '15:00:00', 'ONLINE', 'Tiếng Việt', 5),
  (36, 'Tiếng Anh', NOW(), '22:00:00', '2D', 7, 'Oppenheimer', 10, CURDATE() + INTERVAL 8 DAY, '19:00:00', 'ONLINE', 'Tiếng Việt', 6),
  (37, 'Tiếng Anh', NOW(), '11:54:00', '2D', 8, 'Barbie', 11, CURDATE() + INTERVAL 8 DAY, '10:00:00', 'ONLINE', 'Tiếng Việt', 7),
  (38, 'Tiếng Anh', NOW(), '15:20:00', '3D', 9, 'Spider-Man: Across the Spider-Verse', 12, CURDATE() + INTERVAL 8 DAY, '13:00:00', 'ONLINE', 'Tiếng Việt', 8),
  (39, 'Tiếng Anh', NOW(), '17:32:00', '2D', 10, 'The Super Mario Bros. Movie', 13, CURDATE() + INTERVAL 8 DAY, '16:00:00', 'ONLINE', 'Tiếng Việt', 9),
  (40, 'Tiếng Anh', NOW(), '22:49:00', '2D', 11, 'John Wick: Chapter 4', 14, CURDATE() + INTERVAL 8 DAY, '20:00:00', 'ONLINE', 'Tiếng Việt', 10);

INSERT INTO booking_db.ticket_pricing
  (id, adult_price, child_senior_price, day_group, member_online_price, student_price, time_slot)
VALUES
  (1, 75000, 50000, 'MON_THU', 70000, 55000, 'BEFORE_17H'),
  (2, 90000, 60000, 'MON_THU', 85000, 65000, 'AFTER_17H'),
  (3, 95000, 65000, 'FRI_SUN', 90000, 70000, 'BEFORE_17H'),
  (4, 115000, 75000, 'FRI_SUN', 105000, 80000, 'AFTER_17H');

INSERT INTO booking_db.ticket_surcharges (id, amount, surcharge_key, surcharge_name) VALUES
  (1, 15000, 'ROOM_3D', 'Phụ thu phòng chiếu 3D'),
  (2, 30000, 'ROOM_IMAX', 'Phụ thu phòng chiếu IMAX'),
  (3, 45000, 'ROOM_4DX', 'Phụ thu phòng chiếu 4DX'),
  (4, 20000, 'SEAT_VIP', 'Phụ thu ghế VIP'),
  (5, 30000, 'SEAT_COUPLE', 'Phụ thu ghế đôi');

INSERT INTO booking_db.foods
  (id, category, cost_price, created_at, description, display_order, image_url, low_stock_threshold,
   name, price, size, sku, status, stock_quantity, updated_at)
VALUES
  (1, 'POPCORN', 28000, NOW(), 'Bắp rang bơ vị truyền thống.', 1, '/media/files/5', 15, 'Bắp rang bơ vừa', 59000, 'MEDIUM', 'BAP-BO-M', 'ACTIVE', 120, NOW()),
  (2, 'POPCORN', 39000, NOW(), 'Bắp caramel giòn thơm cỡ lớn.', 2, NULL, 15, 'Bắp caramel lớn', 79000, 'LARGE', 'BAP-CARAMEL-L', 'ACTIVE', 90, NOW()),
  (3, 'DRINK', 18000, NOW(), 'Nước ngọt có ga cỡ vừa.', 3, '/media/files/6', 20, 'Nước ngọt vừa', 39000, 'MEDIUM', 'NUOC-NGOT-M', 'ACTIVE', 180, NOW()),
  (4, 'DRINK', 23000, NOW(), 'Nước ngọt có ga cỡ lớn.', 4, NULL, 20, 'Nước ngọt lớn', 49000, 'LARGE', 'NUOC-NGOT-L', 'ACTIVE', 150, NOW()),
  (5, 'SNACK', 32000, NOW(), 'Nachos giòn dùng kèm xốt phô mai.', 5, '/media/files/4', 10, 'Nachos phô mai', 65000, 'NONE', 'NACHOS-PHOMAI', 'ACTIVE', 70, NOW()),
  (6, 'COMBO', 56000, NOW(), 'Một bắp vừa và hai nước vừa.', 6, NULL, 10, 'Combo Hẹn Hò', 109000, 'NONE', 'COMBO-HENHO', 'ACTIVE', 80, NOW()),
  (7, 'COMBO', 78000, NOW(), 'Một bắp lớn, hai nước lớn và một phần nachos.', 7, NULL, 10, 'Combo Cả Nhà', 149000, 'NONE', 'COMBO-CANHA', 'ACTIVE', 60, NOW()),
  (8, 'POPCORN', 21000, NOW(), 'Bắp rang bơ cỡ nhỏ dành cho một người.', 8, NULL, 15, 'Bắp rang bơ nhỏ', 45000, 'SMALL', 'BAP-BO-S', 'ACTIVE', 100, NOW()),
  (9, 'POPCORN', 35000, NOW(), 'Bắp rang bơ cỡ lớn.', 9, NULL, 15, 'Bắp rang bơ lớn', 72000, 'LARGE', 'BAP-BO-L', 'ACTIVE', 100, NOW()),
  (10, 'POPCORN', 27000, NOW(), 'Bắp caramel cỡ vừa, vị ngọt dịu.', 10, NULL, 15, 'Bắp caramel vừa', 62000, 'MEDIUM', 'BAP-CARAMEL-M', 'ACTIVE', 90, NOW()),
  (11, 'POPCORN', 30000, NOW(), 'Bắp phô mai cỡ vừa.', 11, NULL, 15, 'Bắp phô mai vừa', 65000, 'MEDIUM', 'BAP-PHOMAI-M', 'ACTIVE', 85, NOW()),
  (12, 'POPCORN', 41000, NOW(), 'Bắp phô mai cỡ lớn.', 12, NULL, 15, 'Bắp phô mai lớn', 82000, 'LARGE', 'BAP-PHOMAI-L', 'ACTIVE', 75, NOW()),
  (13, 'DRINK', 14000, NOW(), 'Nước ngọt có ga cỡ nhỏ.', 13, NULL, 20, 'Nước ngọt nhỏ', 32000, 'SMALL', 'NUOC-NGOT-S', 'ACTIVE', 180, NOW()),
  (14, 'DRINK', 17000, NOW(), 'Nước suối đóng chai.', 14, NULL, 20, 'Nước suối', 25000, 'NONE', 'NUOC-SUOI', 'ACTIVE', 220, NOW()),
  (15, 'DRINK', 22000, NOW(), 'Trà đào mát lạnh cỡ vừa.', 15, NULL, 15, 'Trà đào vừa', 45000, 'MEDIUM', 'TRA-DAO-M', 'ACTIVE', 90, NOW()),
  (16, 'DRINK', 26000, NOW(), 'Trà chanh cỡ lớn.', 16, NULL, 15, 'Trà chanh lớn', 52000, 'LARGE', 'TRA-CHANH-L', 'ACTIVE', 80, NOW()),
  (17, 'DRINK', 28000, NOW(), 'Cà phê sữa dùng lạnh.', 17, NULL, 10, 'Cà phê sữa đá', 49000, 'NONE', 'CA-PHE-SUA', 'ACTIVE', 60, NOW()),
  (18, 'SNACK', 26000, NOW(), 'Khoai tây chiên giòn.', 18, NULL, 12, 'Khoai tây chiên', 55000, 'NONE', 'KHOAI-TAY-CHIEN', 'ACTIVE', 75, NOW()),
  (19, 'SNACK', 29000, NOW(), 'Xúc xích nướng dùng kèm tương.', 19, NULL, 12, 'Xúc xích nướng', 59000, 'NONE', 'XUC-XICH-NUONG', 'ACTIVE', 70, NOW()),
  (20, 'SNACK', 34000, NOW(), 'Gà viên giòn dùng kèm xốt.', 20, NULL, 12, 'Gà viên giòn', 69000, 'NONE', 'GA-VIEN-GION', 'ACTIVE', 65, NOW()),
  (21, 'SNACK', 25000, NOW(), 'Bánh quy sô-cô-la đóng gói.', 21, NULL, 10, 'Bánh quy sô-cô-la', 49000, 'NONE', 'BANH-QUY-SCL', 'ACTIVE', 55, NOW()),
  (22, 'OTHER', 19000, NOW(), 'Kẹo dẻo trái cây dùng trong suất chiếu.', 22, NULL, 10, 'Kẹo dẻo trái cây', 39000, 'NONE', 'KEO-DEO-TRAI-CAY', 'ACTIVE', 50, NOW()),
  (23, 'COMBO', 43000, NOW(), 'Một bắp nhỏ và một nước nhỏ.', 23, NULL, 10, 'Combo Một Mình', 79000, 'NONE', 'COMBO-MOTMINH', 'ACTIVE', 90, NOW()),
  (24, 'COMBO', 62000, NOW(), 'Một bắp vừa và hai nước nhỏ.', 24, NULL, 10, 'Combo Bạn Thân', 119000, 'NONE', 'COMBO-BANTHAN', 'ACTIVE', 75, NOW()),
  (25, 'COMBO', 70000, NOW(), 'Một bắp lớn và hai nước vừa.', 25, NULL, 10, 'Combo Cuối Tuần', 135000, 'NONE', 'COMBO-CUOITUAN', 'ACTIVE', 70, NOW()),
  (26, 'COMBO', 88000, NOW(), 'Hai bắp vừa và ba nước vừa.', 26, NULL, 10, 'Combo Nhóm Bạn', 169000, 'NONE', 'COMBO-NHOMBAN', 'ACTIVE', 55, NOW()),
  (27, 'COMBO', 53000, NOW(), 'Một bắp caramel vừa và một trà đào.', 27, NULL, 10, 'Combo Ngọt Ngào', 99000, 'NONE', 'COMBO-NGOTNGAO', 'ACTIVE', 60, NOW()),
  (28, 'COMBO', 65000, NOW(), 'Một bắp phô mai vừa, một nước lớn và một xúc xích.', 28, NULL, 10, 'Combo Năng Lượng', 129000, 'NONE', 'COMBO-NANGLUONG', 'ACTIVE', 55, NOW()),
  (29, 'COMBO', 72000, NOW(), 'Một bắp lớn, hai nước suối và một phần khoai tây.', 29, NULL, 10, 'Combo Gia Đình Nhỏ', 139000, 'NONE', 'COMBO-GIADINHNHO', 'ACTIVE', 50, NOW()),
  (30, 'COMBO', 96000, NOW(), 'Hai bắp lớn, bốn nước vừa và một phần gà viên.', 30, NULL, 10, 'Combo Đại Tiệc', 199000, 'NONE', 'COMBO-DAITIEC', 'ACTIVE', 45, NOW());

-- Giữ ba ảnh đồ ăn cục bộ hiện có, các món còn lại dùng ảnh mạng riêng và không tạo metadata dư thừa.
UPDATE booking_db.foods
SET image_url = CASE
  WHEN id = 1 THEN '/media/files/5'
  WHEN id = 3 THEN '/media/files/6'
  WHEN id = 5 THEN '/media/files/4'
  WHEN category = 'COMBO' THEN CONCAT('https://loremflickr.com/960/540/popcorn,drink?lock=', 5000 + id)
  ELSE CONCAT('https://loremflickr.com/960/540/popcorn,snack?lock=', 4000 + id)
END;

INSERT INTO booking_db.promotions
  (id, code, created_at, description, discount_type, discount_value, end_date, image_url,
   max_discount_amount, min_order_amount, name, start_date, status, updated_at, usage_limit, used_count)
VALUES
  (1, 'THANHVIEN10', NOW(), 'Giảm 10% cho đơn vé của thành viên đã đăng nhập.', 'PERCENT', 10,
   CURDATE() + INTERVAL 120 DAY, NULL, 30000, 150000, 'Ưu đãi thành viên', CURDATE(), 'ONLINE', NOW(), 500, 12),
  (2, 'COMBO20', NOW(), 'Giảm trực tiếp 20.000đ cho đơn có kèm combo.', 'FIXED', 20000,
   CURDATE() + INTERVAL 60 DAY, NULL, NULL, 250000, 'Tháng combo điện ảnh', CURDATE(), 'ONLINE', NOW(), 300, 8),
  (3, 'CHAO50', NOW(), 'Giảm 50.000đ cho đơn đầu tiên đủ điều kiện.', 'FIXED', 50000,
   CURDATE() + INTERVAL 90 DAY, NULL, NULL, 300000, 'Chào thành viên mới', CURDATE(), 'ONLINE', NOW(), 200, 4),
  (4, 'THUHAI15', NOW(), 'Giảm 15% cho đơn vé đặt vào thứ Hai.', 'PERCENT', 15,
   CURDATE() + INTERVAL 60 DAY, NULL, 40000, 120000, 'Thứ Hai điện ảnh', CURDATE(), 'ONLINE', NOW(), 250, 15),
  (5, 'HAPPYDAY25', NOW(), 'Giảm 25.000đ cho đơn đủ điều kiện trong ngày ưu đãi.', 'FIXED', 25000,
   CURDATE() + INTERVAL 45 DAY, NULL, NULL, 180000, 'Ngày vui xem phim', CURDATE(), 'ONLINE', NOW(), 300, 22),
  (6, 'SINHNHAT20', NOW(), 'Giảm 20% cho thành viên có sinh nhật trong tháng.', 'PERCENT', 20,
   CURDATE() + INTERVAL 180 DAY, NULL, 60000, 150000, 'Quà sinh nhật thành viên', CURDATE(), 'ONLINE', NOW(), 150, 6),
  (7, 'NHOMBAN40', NOW(), 'Giảm 40.000đ cho đơn từ bốn vé.', 'FIXED', 40000,
   CURDATE() + INTERVAL 75 DAY, NULL, NULL, 360000, 'Đi phim cùng nhóm bạn', CURDATE(), 'ONLINE', NOW(), 200, 10),
  (8, 'BANNGAY12', NOW(), 'Giảm 12% cho suất chiếu trước 17 giờ.', 'PERCENT', 12,
   CURDATE() + INTERVAL 50 DAY, NULL, 35000, 100000, 'Ưu đãi suất ban ngày', CURDATE(), 'ONLINE', NOW(), 350, 31),
  (9, 'CUOITUAN30', NOW(), 'Giảm 30.000đ cho đơn cuối tuần có kèm combo.', 'FIXED', 30000,
   CURDATE() + INTERVAL 80 DAY, NULL, NULL, 280000, 'Cuối tuần trọn vẹn', CURDATE(), 'ONLINE', NOW(), 220, 17),
  (10, 'TRIAN15', NOW(), 'Giảm 15% dành cho thành viên đã từng mua vé.', 'PERCENT', 15,
   CURDATE() + INTERVAL 120 DAY, NULL, 50000, 180000, 'Tri ân khán giả', CURDATE(), 'ONLINE', NOW(), 400, 28);

UPDATE booking_db.promotions
SET image_url = CONCAT('https://loremflickr.com/960/540/cinema,ticket?lock=', 3000 + id);

-- Đơn mẫu phục vụ dashboard, sơ đồ ghế và tra cứu khách hàng.
INSERT INTO booking_db.bookings
  (id, created_at, showtime_id, status, total_amount, user_id, booking_code, cancelled_at,
   customer_email, customer_name, customer_phone, discount_amount, expired_at, food_amount,
   movie_title, paid_at, room_name, show_date, start_time, theater_name, ticket_amount, promotion_code)
VALUES
  (1, NOW() - INTERVAL 2 DAY, 1, 'PAID', 289000, 11, 'HMC-PAID-0001', NULL,
   'quan.customer@gmail.com', 'Nguyễn Minh Quân', '0901111222', 0, NULL, 109000,
   'Avengers: Endgame', NOW() - INTERVAL 2 DAY, 'Phòng 1', CURDATE() + INTERVAL 1 DAY, '10:00:00', 'HMCinema Cao Lỗ', 180000, NULL),
  (2, NOW() - INTERVAL 1 HOUR, 2, 'PENDING', 220000, 12, 'HMC-PENDING-0002', NULL,
   'linh.customer@gmail.com', 'Trần Hoàng Linh', '0903333444', 0,
   TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '13:05:00'), 0,
   'Inside Out 2', NULL, 'Phòng 2', CURDATE() + INTERVAL 1 DAY, '13:20:00', 'HMCinema Cao Lỗ', 220000, NULL),
  (3, NOW() - INTERVAL 3 DAY, 3, 'PAID', 324000, 6, 'HMC-PAID-0003', NULL,
   'customer01@example.invalid', 'Nguyễn Thảo Vy', '0911000006', 0, NULL, 104000,
   'Dune: Hành Tinh Cát - Phần Hai', NOW() - INTERVAL 3 DAY, 'Phòng Premium', CURDATE() + INTERVAL 1 DAY, '17:00:00', 'HMCinema Cao Lỗ', 220000, NULL),
  (4, NOW() - INTERVAL 4 DAY, 1, 'CANCELLED', 180000, 7, 'HMC-CANCEL-0004', NOW() - INTERVAL 3 DAY,
   'customer02@example.invalid', 'Lê Hoàng Nam', '0911000007', 0, NULL, 0,
   'Avengers: Endgame', NULL, 'Phòng 1', CURDATE() + INTERVAL 1 DAY, '10:00:00', 'HMCinema Cao Lỗ', 180000, NULL),
  (5, NOW() - INTERVAL 6 HOUR, 4, 'PAID', 479000, 12, 'HMC-PAID-0005', NULL,
   'linh.customer@gmail.com', 'Trần Hoàng Linh', '0903333444', 30000, NULL, 59000,
   'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', NOW() - INTERVAL 6 HOUR, 'Phòng 1', CURDATE() + INTERVAL 1 DAY, '20:10:00', 'HMCinema Nguyễn Trãi', 450000, 'THANHVIEN10'),
  (6, NOW() - INTERVAL 5 DAY, 6, 'PAID', 90000, 6, 'HMC-PAID-0006', NULL,
   'customer01@example.invalid', 'Nguyễn Thảo Vy', '0911000006', 0, NULL, 0,
   'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', NOW() - INTERVAL 5 DAY, 'Phòng 1', CURDATE() + INTERVAL 2 DAY, '10:20:00', 'HMCinema Thủ Đức', 90000, NULL),
  (7, NOW() - INTERVAL 3 HOUR, 7, 'PENDING', 110000, 7, 'HMC-PENDING-0007', NULL,
   'customer02@example.invalid', 'Lê Hoàng Nam', '0911000007', 0, TIMESTAMP(CURDATE() + INTERVAL 2 DAY, '13:15:00'), 0,
   'Avengers: Endgame', NULL, 'Phòng 2', CURDATE() + INTERVAL 2 DAY, '13:30:00', 'HMCinema Thủ Đức', 110000, NULL),
  (8, NOW() - INTERVAL 4 DAY, 8, 'PAID', 90000, 8, 'HMC-PAID-0008', NULL,
   'customer03@example.invalid', 'Đỗ Minh Anh', '0911000008', 0, NULL, 0,
   'Inside Out 2', NOW() - INTERVAL 4 DAY, 'Phòng 1', CURDATE() + INTERVAL 2 DAY, '17:30:00', 'HMCinema Cao Lỗ', 90000, NULL),
  (9, NOW() - INTERVAL 2 DAY, 9, 'CANCELLED', 110000, 9, 'HMC-CANCEL-0009', NOW() - INTERVAL 1 DAY,
   'customer04@example.invalid', 'Võ Khánh Ngân', '0911000009', 0, NULL, 0,
   'Dune: Hành Tinh Cát - Phần Hai', NULL, 'Phòng 2', CURDATE() + INTERVAL 2 DAY, '20:10:00', 'HMCinema Cao Lỗ', 110000, NULL),
  (10, NOW() - INTERVAL 7 DAY, 10, 'PAID', 90000, 10, 'HMC-PAID-0010', NULL,
   'customer05@example.invalid', 'Bùi Đức Anh', '0911000010', 0, NULL, 0,
   'Avengers: Endgame', NOW() - INTERVAL 7 DAY, 'Phòng 1', CURDATE() + INTERVAL 3 DAY, '10:10:00', 'HMCinema Nguyễn Trãi', 90000, NULL),
  (11, NOW() - INTERVAL 50 MINUTE, 11, 'EXPIRED', 90000, 15, 'HMC-EXPIRED-0011', NULL,
   'mai.ngoc.anh@example.com', 'Mai Ngọc Anh', '0911000015', 0, NOW() - INTERVAL 35 MINUTE, 0,
   'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', NULL, 'Phòng 1', CURDATE() + INTERVAL 3 DAY, '13:50:00', 'HMCinema Thủ Đức', 90000, NULL),
  (12, NOW() - INTERVAL 6 DAY, 12, 'PAID', 90000, 16, 'HMC-PAID-0012', NULL,
   'phan.tuan.kiet@example.com', 'Phan Tuấn Kiệt', '0911000016', 0, NULL, 0,
   'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô', NOW() - INTERVAL 6 DAY, 'Phòng IMAX', CURDATE() + INTERVAL 3 DAY, '17:40:00', 'HMCinema Nguyễn Trãi', 90000, NULL),
  (13, NOW() - INTERVAL 8 DAY, 13, 'PAID', 90000, 17, 'HMC-PAID-0013', NULL,
   'huynh.bao.tram@example.com', 'Huỳnh Bảo Trâm', '0911000017', 0, NULL, 0,
   'Dune: Hành Tinh Cát - Phần Hai', NOW() - INTERVAL 8 DAY, 'Phòng Premium', CURDATE() + INTERVAL 3 DAY, '20:30:00', 'HMCinema Cao Lỗ', 90000, NULL),
  (14, NOW() - INTERVAL 25 MINUTE, 14, 'PENDING', 90000, 18, 'HMC-PENDING-0014', NULL,
   'truong.hai.dang@example.com', 'Trương Hải Đăng', '0911000018', 0, TIMESTAMP(CURDATE() + INTERVAL 4 DAY, '09:55:00'), 0,
   'Inside Out 2', NULL, 'Phòng 1', CURDATE() + INTERVAL 4 DAY, '10:10:00', 'HMCinema Cao Lỗ', 90000, NULL),
  (15, NOW() - INTERVAL 9 DAY, 15, 'PAID', 90000, 19, 'HMC-PAID-0015', NULL,
   'dang.quynh.nhu@example.com', 'Đặng Quỳnh Như', '0911000019', 0, NULL, 0,
   'Avengers: Endgame', NOW() - INTERVAL 9 DAY, 'Phòng 2', CURDATE() + INTERVAL 4 DAY, '13:30:00', 'HMCinema Thủ Đức', 90000, NULL),
  (16, NOW() - INTERVAL 5 DAY, 16, 'CANCELLED', 90000, 20, 'HMC-CANCEL-0016', NOW() - INTERVAL 4 DAY,
   'ngo.minh.chau@example.com', 'Ngô Minh Châu', '0911000020', 0, NULL, 0,
   'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', NULL, 'Phòng 1', CURDATE() + INTERVAL 4 DAY, '18:00:00', 'HMCinema Nguyễn Trãi', 90000, NULL),
  (17, NOW() - INTERVAL 10 DAY, 17, 'PAID', 110000, 6, 'HMC-PAID-0017', NULL,
   'customer01@example.invalid', 'Nguyễn Thảo Vy', '0911000006', 0, NULL, 0,
   'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô', NOW() - INTERVAL 10 DAY, 'Phòng 2', CURDATE() + INTERVAL 4 DAY, '20:30:00', 'HMCinema Cao Lỗ', 110000, NULL),
  (18, NOW() - INTERVAL 40 MINUTE, 18, 'EXPIRED', 90000, 7, 'HMC-EXPIRED-0018', NULL,
   'customer02@example.invalid', 'Lê Hoàng Nam', '0911000007', 0, NOW() - INTERVAL 25 MINUTE, 0,
   'Dune: Hành Tinh Cát - Phần Hai', NULL, 'Phòng 1', CURDATE() + INTERVAL 5 DAY, '10:10:00', 'HMCinema Thủ Đức', 90000, NULL),
  (19, NOW() - INTERVAL 11 DAY, 19, 'PAID', 90000, 8, 'HMC-PAID-0019', NULL,
   'customer03@example.invalid', 'Đỗ Minh Anh', '0911000008', 0, NULL, 0,
   'Avengers: Endgame', NOW() - INTERVAL 11 DAY, 'Phòng Premium', CURDATE() + INTERVAL 5 DAY, '13:40:00', 'HMCinema Cao Lỗ', 90000, NULL),
  (20, NOW() - INTERVAL 15 MINUTE, 20, 'PENDING', 90000, 9, 'HMC-PENDING-0020', NULL,
   'customer04@example.invalid', 'Võ Khánh Ngân', '0911000009', 0, TIMESTAMP(CURDATE() + INTERVAL 5 DAY, '17:25:00'), 0,
   'Inside Out 2', NULL, 'Phòng 1', CURDATE() + INTERVAL 5 DAY, '17:40:00', 'HMCinema Nguyễn Trãi', 90000, NULL);

INSERT INTO booking_db.booking_seats (id, price, seat_code, seat_id, booking_id, seat_type) VALUES
  (1, 90000, 'C3', 23, 1, 'STANDARD'),
  (2, 90000, 'C4', 24, 1, 'STANDARD'),
  (3, 110000, 'A3', 83, 2, 'VIP'),
  (4, 110000, 'A4', 84, 2, 'VIP'),
  (5, 110000, 'D3', 187, 3, 'VIP'),
  (6, 110000, 'D4', 188, 3, 'VIP'),
  (7, 90000, 'E5', 45, 4, 'STANDARD'),
  (8, 90000, 'E6', 46, 4, 'STANDARD'),
  (9, 90000, 'C1', 229, 5, 'STANDARD'),
  (10, 90000, 'C2', 230, 5, 'STANDARD'),
  (11, 90000, 'C3', 231, 5, 'STANDARD'),
  (12, 90000, 'C4', 232, 5, 'STANDARD'),
  (13, 90000, 'C5', 233, 5, 'STANDARD'),
  (14, 90000, 'C1', 405, 6, 'STANDARD'),
  (15, 110000, 'C1', 485, 7, 'STANDARD'),
  (16, 90000, 'C5', 25, 8, 'STANDARD'),
  (17, 110000, 'A5', 85, 9, 'VIP'),
  (18, 90000, 'C7', 235, 10, 'STANDARD'),
  (19, 90000, 'C2', 406, 11, 'STANDARD'),
  (20, 90000, 'C1', 313, 12, 'STANDARD'),
  (21, 90000, 'C1', 177, 13, 'STANDARD'),
  (22, 90000, 'C7', 27, 14, 'STANDARD'),
  (23, 90000, 'C3', 487, 15, 'STANDARD'),
  (24, 90000, 'C9', 237, 16, 'STANDARD'),
  (25, 110000, 'A7', 87, 17, 'VIP'),
  (26, 90000, 'C4', 408, 18, 'STANDARD'),
  (27, 90000, 'C3', 179, 19, 'STANDARD'),
  (28, 90000, 'D1', 239, 20, 'STANDARD');

INSERT INTO booking_db.booking_foods
  (id, food_id, food_name, quantity, total_price, unit_price, booking_id)
VALUES
  (1, 6, 'Combo Hẹn Hò', 1, 109000, 109000, 1),
  (2, 3, 'Nước ngọt vừa', 1, 39000, 39000, 3),
  (3, 5, 'Nachos phô mai', 1, 65000, 65000, 3),
  (4, 1, 'Bắp rang bơ vừa', 1, 59000, 59000, 5);

INSERT INTO booking_db.payments
  (id, amount, created_at, paid_at, payment_method, status, transaction_code, booking_id)
VALUES
  (1, 289000, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, 'VNPAY', 'PAID', 'SEED-VNPAY-0001', 1),
  (2, 324000, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, 'VNPAY', 'PAID', 'SEED-VNPAY-0003', 3),
  (3, 479000, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR, 'VNPAY', 'PAID', 'SEED-VNPAY-0005', 5);

INSERT INTO booking_db.tickets
  (id, issued_at, qr_code, status, ticket_code, used_at, booking_id)
VALUES
  (1, NOW() - INTERVAL 2 DAY, 'HMC-TICKET-0001', 'VALID', 'VE-HMC-0001', NULL, 1),
  (2, NOW() - INTERVAL 3 DAY, 'HMC-TICKET-0003', 'VALID', 'VE-HMC-0003', NULL, 3),
  (3, NOW() - INTERVAL 6 HOUR, 'HMC-TICKET-0005', 'VALID', 'VE-HMC-0005', NULL, 5);

INSERT INTO payment_db.payment_transactions
  (id, booking_id, user_id, recipient, transaction_reference, provider_transaction_id, provider,
   payment_method, amount, refunded_amount, currency, status, description, paid_at, created_at, updated_at)
VALUES
  (1, 1, 11, 'quan.customer@gmail.com', 'SEED-PAY-0001', 'SEED-PROVIDER-0001', 'VNPAY', 'ATM',
   289000, 0, 'VND', 'PAID', 'Thanh toán vé HMC-PAID-0001', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
  (2, 3, 6, 'customer01@example.invalid', 'SEED-PAY-0003', 'SEED-PROVIDER-0003', 'VNPAY', 'ATM',
   324000, 0, 'VND', 'PAID', 'Thanh toán vé HMC-PAID-0003', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
  (3, 5, 12, 'linh.customer@gmail.com', 'SEED-PAY-0005', 'SEED-PROVIDER-0005', 'VNPAY', 'ATM',
   479000, 0, 'VND', 'PAID', 'Thanh toán vé HMC-PAID-0005', NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR);

SET FOREIGN_KEY_CHECKS = 1;
