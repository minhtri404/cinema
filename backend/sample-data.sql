USE movie_db;

INSERT INTO genres (name, description, active)
VALUES
('Hành động', 'Phim hành động với nhịp phim nhanh, nhiều cảnh rượt đuổi và chiến đấu.', true),
('Hoạt hình', 'Phim hoạt hình dành cho gia đình, thiếu nhi và khán giả trẻ.', true),
('Tâm lý', 'Phim tâm lý tập trung vào câu chuyện, cảm xúc và hành trình nhân vật.', true),
('Hài', 'Phim hài, giải trí nhẹ nhàng, phù hợp xem cùng bạn bè và gia đình.', true),
('Kinh dị', 'Phim kinh dị tạo cảm giác hồi hộp, căng thẳng và bất ngờ.', true),
('Tình cảm', 'Phim tình cảm, lãng mạn, khai thác các mối quan hệ và cảm xúc.', true),
('Khoa học viễn tưởng', 'Phim khoa học viễn tưởng về công nghệ, tương lai và những thế giới mới.', true),
('Giả tưởng', 'Phim giả tưởng với phép thuật, truyền thuyết và thế giới hư cấu.', true),
('Giật gân', 'Phim giật gân, điều tra, bí ẩn và nhiều nút thắt.', true),
('Phiêu lưu', 'Phim phiêu lưu với hành trình khám phá và thử thách.', true),
('Gia đình', 'Phim gia đình có nội dung tích cực, dễ xem cho nhiều lứa tuổi.', true),
('Bí ẩn', 'Phim bí ẩn xoay quanh điều tra, manh mối và lời giải cuối cùng.', true)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    active = VALUES(active);

DELETE FROM genres
WHERE name IN ('Action', 'Animation', 'Drama', 'Comedy', 'Horror', 'Romance', 'Science Fiction', 'Fantasy', 'Thriller', 'Adventure', 'Family', 'Mystery');

INSERT INTO movies
(title, description, genre, duration, director, release_date, poster_url, trailer_url, status, created_at)
SELECT v.title, v.description, v.genre, v.duration, v.director, v.release_date, v.poster_url, v.trailer_url, v.status, NOW()
FROM (
    SELECT 'Inside Out 2' title,
           'Riley bước vào tuổi mới lớn, nơi những cảm xúc quen thuộc phải học cách làm việc cùng các cảm xúc hoàn toàn mới.' description,
           'Hoạt hình' genre,
           96 duration,
           'Kelsey Mann' director,
           '2026-06-05' release_date,
           'https://m.media-amazon.com/images/M/MV5BYWY3MDE2Y2UtOTE3Zi00MGUzLTg2MTItZjE1ZWVkMGVlODRmXkEyXkFqcGc@._V1_.jpg' poster_url,
           'https://www.youtube.com/watch?v=LEjhY15eCx0' trailer_url,
           'NOW_SHOWING' status
    UNION ALL
    SELECT 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô',
           'Conan đối đầu một vụ án quy mô lớn với những manh mối phức tạp, các cuộc truy đuổi nghẹt thở và bí mật về một thanh kiếm cổ.',
           'Bí ẩn',
           111,
           'Chika Nagaoka',
           '2026-06-12',
           'https://m.media-amazon.com/images/M/MV5BNmQ1ZTAwNzUtYmE0YS00NGIxLWJkOTYtZWRhMGYxMzBjNjNjXkEyXkFqcGc@._V1_.jpg',
           'https://www.youtube.com/watch?v=',
           'NOW_SHOWING'
    UNION ALL
    SELECT 'Dune: Hành Tinh Cát - Phần Hai',
           'Paul Atreides tiếp tục hành trình trên Arrakis trong cuộc chiến khốc liệt về quyền lực, định mệnh và lòng trung thành.',
           'Khoa học viễn tưởng',
           166,
           'Denis Villeneuve',
           '2026-06-15',
           'https://m.media-amazon.com/images/M/MV5BZjA2NGY2NTYtODliZS00NDk2LWE1MzMtNTVlOTQ2YjI5Y2Y4XkEyXkFqcGc@._V1_.jpg',
           'https://www.youtube.com/watch?v=Way9Dexny3w',
           'NOW_SHOWING'
) v
WHERE NOT EXISTS (
    SELECT 1 FROM movies m WHERE m.title = v.title
);

UPDATE movies
SET title = CASE title
        WHEN 'Detective Conan: The Million-dollar Pentagram' THEN 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô'
        WHEN 'Dune: Part Two' THEN 'Dune: Hành Tinh Cát - Phần Hai'
        ELSE title
    END,
    description = CASE title
        WHEN 'Avengers: Endgame' THEN 'Sau cú búng tay của Thanos, những siêu anh hùng còn lại tập hợp cho nhiệm vụ cuối cùng để khôi phục vũ trụ.'
        WHEN 'Doraemon Movie' THEN 'Doraemon và Nobita bước vào chuyến phiêu lưu ấm áp, vui nhộn, phù hợp cho gia đình và trẻ em.'
        WHEN 'Lat Mat 8' THEN 'Một câu chuyện Việt Nam giàu cảm xúc, kết hợp yếu tố gia đình, hành động và những lựa chọn khó khăn.'
        WHEN 'Inside Out 2' THEN 'Riley bước vào tuổi mới lớn, nơi những cảm xúc quen thuộc phải học cách làm việc cùng các cảm xúc hoàn toàn mới.'
        WHEN 'Detective Conan: The Million-dollar Pentagram' THEN 'Conan đối đầu một vụ án quy mô lớn với những manh mối phức tạp, các cuộc truy đuổi nghẹt thở và bí mật về một thanh kiếm cổ.'
        WHEN 'Dune: Part Two' THEN 'Paul Atreides tiếp tục hành trình trên Arrakis trong cuộc chiến khốc liệt về quyền lực, định mệnh và lòng trung thành.'
        WHEN 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô' THEN 'Conan đối đầu một vụ án quy mô lớn với những manh mối phức tạp, các cuộc truy đuổi nghẹt thở và bí mật về một thanh kiếm cổ.'
        WHEN 'Dune: Hành Tinh Cát - Phần Hai' THEN 'Paul Atreides tiếp tục hành trình trên Arrakis trong cuộc chiến khốc liệt về quyền lực, định mệnh và lòng trung thành.'
        ELSE description
    END,
    genre = CASE title
        WHEN 'Avengers: Endgame' THEN 'Hành động'
        WHEN 'Doraemon Movie' THEN 'Hoạt hình'
        WHEN 'Lat Mat 8' THEN 'Tâm lý'
        WHEN 'Inside Out 2' THEN 'Hoạt hình'
        WHEN 'Detective Conan: The Million-dollar Pentagram' THEN 'Bí ẩn'
        WHEN 'Dune: Part Two' THEN 'Khoa học viễn tưởng'
        WHEN 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô' THEN 'Bí ẩn'
        WHEN 'Dune: Hành Tinh Cát - Phần Hai' THEN 'Khoa học viễn tưởng'
        ELSE genre
    END
WHERE title IN ('Avengers: Endgame', 'Doraemon Movie', 'Lat Mat 8', 'Inside Out 2', 'Detective Conan: The Million-dollar Pentagram', 'Dune: Part Two', 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô', 'Dune: Hành Tinh Cát - Phần Hai');

DELETE m
FROM movies m
JOIN (
    SELECT title, MIN(id) keep_id
    FROM movies
    GROUP BY title
    HAVING COUNT(*) > 1
) d ON d.title = m.title
WHERE m.id <> d.keep_id;

USE user_db;

INSERT INTO users (full_name, email, password, phone, role, created_at)
SELECT v.full_name, v.email, v.password, v.phone, v.role, NOW()
FROM (
    SELECT 'Nguyễn Minh Quân' full_name, 'quan.customer@gmail.com' email, '123456' password, '0901111222' phone, 'CUSTOMER' role
    UNION ALL
    SELECT 'Trần Hoàng Linh', 'linh.customer@gmail.com', '123456', '0903333444', 'CUSTOMER'
    UNION ALL
    SELECT 'Lê Thu Hà', 'ha.staff@gmail.com', '123456', '0905555666', 'STAFF'
    UNION ALL
    SELECT 'Quản lý Rạp', 'manager@gmail.com', '123456', '0907777888', 'ADMIN'
) v
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = v.email
);

UPDATE users
SET full_name = CASE email
        WHEN 'admin@gmail.com' THEN 'Quản trị hệ thống'
        WHEN 'quan.customer@gmail.com' THEN 'Nguyễn Minh Quân'
        WHEN 'linh.customer@gmail.com' THEN 'Trần Hoàng Linh'
        WHEN 'ha.staff@gmail.com' THEN 'Lê Thu Hà'
        WHEN 'manager@gmail.com' THEN 'Quản lý Rạp'
        ELSE full_name
    END
WHERE email IN ('admin@gmail.com', 'quan.customer@gmail.com', 'linh.customer@gmail.com', 'ha.staff@gmail.com', 'manager@gmail.com');

USE showtime_db;

DELETE FROM theaters
WHERE id > 7;

INSERT INTO theaters (name, address, city, location, room_count, status)
VALUES
('CGV Landmark 81', '720A Điện Biên Phủ, Bình Thạnh', 'Hồ Chí Minh', 'Vincom Center Landmark 81, tầng B1', 8, 'ONLINE'),
('Galaxy Sala', '10 Mai Chí Thọ, Thủ Đức', 'Hồ Chí Minh', 'Khu đô thị Sala, tầng 3', 6, 'ONLINE'),
('Lotte Cinema Gò Vấp', '242 Nguyễn Văn Lượng, Gò Vấp', 'Hồ Chí Minh', 'Lotte Mart Gò Vấp, tầng 4', 7, 'ONLINE')
ON DUPLICATE KEY UPDATE
    address = VALUES(address),
    city = VALUES(city),
    location = VALUES(location),
    room_count = VALUES(room_count),
    status = VALUES(status);

UPDATE theaters
SET name = CASE id
        WHEN 1 THEN 'CGV Cao Lỗ'
        WHEN 2 THEN 'Galaxy Nguyễn Trãi'
        WHEN 3 THEN 'Lotte Thủ Đức'
        WHEN 4 THEN 'BHD Phạm Hùng'
        WHEN 5 THEN 'Cinestar Hai Bà Trưng'
        WHEN 6 THEN 'Mega GS Cao Thắng'
        WHEN 7 THEN 'Beta Tân Bình'
        WHEN 8 THEN 'CGV Landmark 81'
        WHEN 9 THEN 'Galaxy Sala'
        WHEN 10 THEN 'Lotte Cinema Gò Vấp'
        ELSE name
    END,
    address = CASE id
        WHEN 1 THEN '123 Cao Lỗ, Quận 8'
        WHEN 2 THEN '456 Nguyễn Trãi, Quận 5'
        WHEN 3 THEN '789 Võ Văn Ngân, Thủ Đức'
        WHEN 4 THEN '12 Phạm Hùng, Bình Chánh'
        WHEN 5 THEN '135 Hai Bà Trưng, Quận 1'
        WHEN 6 THEN '19 Cao Thắng, Quận 3'
        WHEN 7 THEN '221 Cộng Hòa, Tân Bình'
        WHEN 8 THEN '720A Điện Biên Phủ, Bình Thạnh'
        WHEN 9 THEN '10 Mai Chí Thọ, Thủ Đức'
        WHEN 10 THEN '242 Nguyễn Văn Lượng, Gò Vấp'
        ELSE address
    END,
    city = 'Hồ Chí Minh',
    location = CASE id
        WHEN 1 THEN 'Tầng 3 trung tâm thương mại'
        WHEN 2 THEN 'Khu B tầng 2'
        WHEN 3 THEN 'Tầng 5 khu giải trí'
        WHEN 4 THEN 'Tầng 4 trung tâm thương mại'
        WHEN 5 THEN 'Khu rạp tầng 2'
        WHEN 6 THEN 'Tầng 6 khu vui chơi'
        WHEN 7 THEN 'Tầng 3 khu dịch vụ'
        WHEN 8 THEN 'Vincom Center Landmark 81, tầng B1'
        WHEN 9 THEN 'Khu đô thị Sala, tầng 3'
        WHEN 10 THEN 'Lotte Mart Gò Vấp, tầng 4'
        ELSE location
    END
WHERE id BETWEEN 1 AND 10;

UPDATE rooms
SET name = CASE name
        WHEN 'Phong 1' THEN 'Phòng 1'
        WHEN 'Phong 2' THEN 'Phòng 2'
        WHEN 'Phong VIP' THEN 'Phòng VIP'
        ELSE name
    END,
    row_count = CASE id
        WHEN 1 THEN 8
        WHEN 2 THEN 10
        WHEN 3 THEN 5
        WHEN 4 THEN 9
        WHEN 5 THEN 10
        WHEN 6 THEN 7
        WHEN 7 THEN 10
        ELSE row_count
    END,
    column_count = CASE id
        WHEN 5 THEN 12
        ELSE 10
    END
WHERE id BETWEEN 1 AND 7;

CREATE TEMPORARY TABLE seed_row_numbers (n INT PRIMARY KEY);
INSERT INTO seed_row_numbers (n)
VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12);

CREATE TEMPORARY TABLE seed_seat_numbers (n INT PRIMARY KEY);
INSERT INTO seed_seat_numbers (n)
VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12);

CREATE TEMPORARY TABLE seed_room_plan (
    room_id BIGINT PRIMARY KEY,
    row_count INT NOT NULL,
    column_count INT NOT NULL
);

INSERT INTO seed_room_plan (room_id, row_count, column_count)
VALUES
(1, 8, 10),
(2, 10, 10),
(3, 5, 10),
(4, 9, 10),
(5, 10, 12),
(6, 7, 10),
(7, 10, 10);

INSERT INTO seats (room_id, seat_code, seat_row, seat_number, seat_type, extra_price, status)
SELECT
    rp.room_id,
    CONCAT(CHAR(64 + row_num.n), seat_num.n),
    CHAR(64 + row_num.n),
    seat_num.n,
    CASE
        WHEN rp.room_id = 3 THEN 'IMAX'
        WHEN row_num.n <= 2 THEN 'VIP'
        WHEN row_num.n = rp.row_count AND seat_num.n IN (3, 4, 7, 8) THEN 'COUPLE'
        ELSE 'STANDARD'
    END,
    CASE
        WHEN rp.room_id = 3 THEN 30000
        WHEN row_num.n <= 2 THEN 20000
        WHEN row_num.n = rp.row_count AND seat_num.n IN (3, 4, 7, 8) THEN 30000
        ELSE 0
    END,
    'ACTIVE'
FROM seed_room_plan rp
JOIN seed_row_numbers row_num ON row_num.n <= rp.row_count
JOIN seed_seat_numbers seat_num ON seat_num.n <= rp.column_count
WHERE NOT EXISTS (
    SELECT 1 FROM seats s
    WHERE s.room_id = rp.room_id
      AND s.seat_code = CONCAT(CHAR(64 + row_num.n), seat_num.n)
);

UPDATE seats s
JOIN seed_room_plan rp ON rp.room_id = s.room_id
SET s.seat_type = CASE
        WHEN rp.room_id = 3 THEN 'IMAX'
        WHEN ASCII(s.seat_row) - 64 <= 2 THEN 'VIP'
        WHEN ASCII(s.seat_row) - 64 = rp.row_count AND s.seat_number IN (3, 4, 7, 8) THEN 'COUPLE'
        ELSE 'STANDARD'
    END,
    s.extra_price = CASE
        WHEN rp.room_id = 3 THEN 30000
        WHEN ASCII(s.seat_row) - 64 <= 2 THEN 20000
        WHEN ASCII(s.seat_row) - 64 = rp.row_count AND s.seat_number IN (3, 4, 7, 8) THEN 30000
        ELSE 0
    END,
    s.status = 'ACTIVE';

DELETE s
FROM seats s
JOIN (
    SELECT room_id, seat_code, MAX(id) keep_id
    FROM seats
    GROUP BY room_id, seat_code
    HAVING COUNT(*) > 1
) d ON d.room_id = s.room_id AND d.seat_code = s.seat_code
WHERE s.id <> d.keep_id;

SET @seat_index_exists = (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'seats'
      AND index_name = 'uk_seats_room_code'
);
SET @seat_index_sql = IF(
    @seat_index_exists = 0,
    'ALTER TABLE seats ADD UNIQUE KEY uk_seats_room_code (room_id, seat_code)',
    'SELECT 1'
);
PREPARE seat_index_stmt FROM @seat_index_sql;
EXECUTE seat_index_stmt;
DEALLOCATE PREPARE seat_index_stmt;

DROP TEMPORARY TABLE seed_room_plan;
DROP TEMPORARY TABLE seed_row_numbers;
DROP TEMPORARY TABLE seed_seat_numbers;

INSERT INTO showtimes (movie_id, cinema_id, room_id, start_time, end_time, price, status)
SELECT v.movie_id, v.cinema_id, v.room_id, v.start_time, v.end_time, v.price, v.status
FROM (
    SELECT 1 movie_id, 1 cinema_id, 1 room_id,
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00') start_time,
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:01:00') end_time,
           90000 price, 'ĐANG_MỞ_BÁN' status
    UNION ALL
    SELECT 2, 1, 2,
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00'),
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:50:00'),
           95000, 'ĐANG_MỞ_BÁN'
    UNION ALL
    SELECT 3, 1, 3,
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:30:00'),
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '22:16:00'),
           130000, 'ĐANG_MỞ_BÁN'
    UNION ALL
    SELECT 4, 2, 4,
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:30:00'),
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:06:00'),
           85000, 'ĐANG_MỞ_BÁN'
    UNION ALL
    SELECT 5, 2, 5,
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:45:00'),
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:36:00'),
           105000, 'ĐANG_MỞ_BÁN'
    UNION ALL
    SELECT 6, 3, 6,
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '20:15:00'),
           TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '23:01:00'),
           125000, 'ĐANG_MỞ_BÁN'
) v
WHERE NOT EXISTS (
    SELECT 1 FROM showtimes s
    WHERE s.movie_id = v.movie_id
      AND s.room_id = v.room_id
      AND s.start_time = v.start_time
);

UPDATE showtimes
SET status = CASE status
        WHEN 'OPEN' THEN 'ĐANG_MỞ_BÁN'
        ELSE status
    END;

USE booking_db;

CREATE TABLE IF NOT EXISTS ticket_pricing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    day_group VARCHAR(50) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    student_price DOUBLE,
    adult_price DOUBLE,
    child_senior_price DOUBLE,
    member_online_price DOUBLE
);

CREATE TABLE IF NOT EXISTS ticket_surcharges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    surcharge_key VARCHAR(50) NOT NULL UNIQUE,
    surcharge_name VARCHAR(100) NOT NULL,
    amount DOUBLE
);

INSERT INTO ticket_pricing (day_group, time_slot, student_price, adult_price, child_senior_price, member_online_price)
SELECT v.day_group, v.time_slot, v.student_price, v.adult_price, v.child_senior_price, v.member_online_price
FROM (
    SELECT 'THỨ_2_ĐẾN_THỨ_5' day_group, 'TRƯỚC_17H' time_slot, 55000 student_price, 75000 adult_price, 50000 child_senior_price, 70000 member_online_price
    UNION ALL
    SELECT 'THỨ_2_ĐẾN_THỨ_5', 'SAU_17H', 65000, 90000, 60000, 85000
    UNION ALL
    SELECT 'THỨ_6_ĐẾN_CN', 'TRƯỚC_17H', 70000, 95000, 65000, 90000
    UNION ALL
    SELECT 'THỨ_6_ĐẾN_CN', 'SAU_17H', 80000, 115000, 75000, 105000
    UNION ALL
    SELECT 'NGÀY_LỄ', 'CẢ_NGÀY', 90000, 130000, 85000, 120000
) v
WHERE NOT EXISTS (
    SELECT 1 FROM ticket_pricing p
    WHERE p.day_group = v.day_group
      AND p.time_slot = v.time_slot
);

UPDATE ticket_pricing p
JOIN (
    SELECT 'MON_THU' old_day_group, 'BEFORE_17H' old_time_slot, 'THỨ_2_ĐẾN_THỨ_5' day_group, 'TRƯỚC_17H' time_slot, 55000 student_price, 75000 adult_price, 50000 child_senior_price, 70000 member_online_price
    UNION ALL
    SELECT 'MON_THU', 'AFTER_17H', 'THỨ_2_ĐẾN_THỨ_5', 'SAU_17H', 65000, 90000, 60000, 85000
    UNION ALL
    SELECT 'FRI_SUN', 'BEFORE_17H', 'THỨ_6_ĐẾN_CN', 'TRƯỚC_17H', 70000, 95000, 65000, 90000
    UNION ALL
    SELECT 'FRI_SUN', 'AFTER_17H', 'THỨ_6_ĐẾN_CN', 'SAU_17H', 80000, 115000, 75000, 105000
    UNION ALL
    SELECT 'HOLIDAY', 'ALL_DAY', 'NGÀY_LỄ', 'CẢ_NGÀY', 90000, 130000, 85000, 120000
) v ON (p.day_group = v.old_day_group AND p.time_slot = v.old_time_slot)
     OR (p.day_group = v.day_group AND p.time_slot = v.time_slot)
SET p.day_group = v.day_group,
    p.time_slot = v.time_slot,
    p.student_price = v.student_price,
    p.adult_price = v.adult_price,
    p.child_senior_price = v.child_senior_price,
    p.member_online_price = v.member_online_price;

DELETE p
FROM ticket_pricing p
JOIN (
    SELECT day_group, time_slot, MIN(id) keep_id
    FROM ticket_pricing
    GROUP BY day_group, time_slot
    HAVING COUNT(*) > 1
) d ON d.day_group = p.day_group AND d.time_slot = p.time_slot
WHERE p.id <> d.keep_id;

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

INSERT INTO bookings (user_id, showtime_id, total_amount, status, created_at)
SELECT v.user_id, v.showtime_id, v.total_amount, v.status, v.created_at
FROM (
    SELECT 2 user_id, 1 showtime_id, 180000 total_amount, 'ĐÃ_XÁC_NHẬN' status, DATE_SUB(NOW(), INTERVAL 2 DAY) created_at
    UNION ALL
    SELECT 3, 2, 210000, 'ĐÃ_THANH_TOÁN', DATE_SUB(NOW(), INTERVAL 1 DAY)
    UNION ALL
    SELECT 2, 3, 320000, 'CHỜ_THANH_TOÁN', NOW()
) v
WHERE NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.user_id = v.user_id
      AND b.showtime_id = v.showtime_id
      AND b.status = v.status
);

UPDATE bookings
SET status = CASE status
        WHEN 'CONFIRMED' THEN 'ĐÃ_XÁC_NHẬN'
        WHEN 'PAID' THEN 'ĐÃ_THANH_TOÁN'
        WHEN 'PENDING' THEN 'CHỜ_THANH_TOÁN'
        ELSE status
    END;

INSERT INTO booking_seats (booking_id, seat_id, seat_code, price)
SELECT b.id, s.id, v.seat_code, v.price
FROM (
    SELECT 2 user_id, 1 showtime_id, 1 room_id, 'A1' seat_code, 90000 price
    UNION ALL
    SELECT 2, 1, 1, 'A2', 90000
    UNION ALL
    SELECT 3, 2, 2, 'A1', 105000
    UNION ALL
    SELECT 3, 2, 2, 'A2', 105000
    UNION ALL
    SELECT 2, 3, 3, 'A1', 160000
    UNION ALL
    SELECT 2, 3, 3, 'A2', 160000
) v
JOIN bookings b ON b.user_id = v.user_id AND b.showtime_id = v.showtime_id
JOIN showtime_db.seats s ON s.room_id = v.room_id AND s.seat_code = v.seat_code
WHERE NOT EXISTS (
    SELECT 1 FROM booking_seats bs
    WHERE bs.booking_id = b.id
      AND bs.seat_code = v.seat_code
);
