SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

ALTER DATABASE movie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER DATABASE showtime_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER DATABASE booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER DATABASE user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

UPDATE movie_db.genres
SET name = CASE id
    WHEN 11 THEN 'Hành động'
    WHEN 12 THEN 'Hoạt hình'
    WHEN 13 THEN 'Tâm lý'
    WHEN 14 THEN 'Hài'
    WHEN 15 THEN 'Kinh dị'
    WHEN 16 THEN 'Tình cảm'
    WHEN 17 THEN 'Khoa học viễn tưởng'
    WHEN 18 THEN 'Giả tưởng'
    WHEN 19 THEN 'Giật gân'
    WHEN 20 THEN 'Phiêu lưu'
    WHEN 21 THEN 'Gia đình'
    WHEN 22 THEN 'Bí ẩn'
    ELSE name
END
WHERE id BETWEEN 11 AND 22;

UPDATE movie_db.movies
SET title = CASE id
    WHEN 1 THEN 'Avengers: Endgame'
    WHEN 2 THEN 'Doraemon Movie'
    WHEN 3 THEN 'Lật Mặt 8'
    WHEN 4 THEN 'Inside Out 2'
    WHEN 5 THEN 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô'
    WHEN 6 THEN 'Dune: Hành Tinh Cát - Phần Hai'
    ELSE title
END
WHERE id BETWEEN 1 AND 6;

UPDATE showtime_db.theaters
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
END
WHERE id BETWEEN 1 AND 10;

UPDATE showtime_db.rooms
SET name = CASE id
    WHEN 1 THEN 'Phòng 1'
    WHEN 2 THEN 'Phòng 2'
    WHEN 3 THEN 'Phòng VIP'
    WHEN 4 THEN 'Phòng 1'
    WHEN 5 THEN 'Phòng 2'
    WHEN 6 THEN 'Phòng 1'
    WHEN 7 THEN 'Phòng 1'
    ELSE name
END
WHERE id BETWEEN 1 AND 7;

UPDATE showtime_db.showtimes s
LEFT JOIN movie_db.movies m ON m.id = s.movie_id
SET s.movie_name = COALESCE(m.title, s.movie_name),
    s.audio_language = 'Việt',
    s.subtitle_language = 'Tiếng Việt';

UPDATE user_db.users
SET full_name = CASE email
    WHEN 'admin@gmail.com' THEN 'Quản trị hệ thống'
    WHEN 'quan.customer@gmail.com' THEN 'Nguyễn Minh Quân'
    WHEN 'linh.customer@gmail.com' THEN 'Trần Hoàng Linh'
    WHEN 'ha.staff@gmail.com' THEN 'Lê Thu Hà'
    WHEN 'manager@gmail.com' THEN 'Quản lý Rạp'
    ELSE full_name
END;

UPDATE booking_db.bookings
SET status = CASE id
    WHEN 1 THEN 'PAID'
    WHEN 2 THEN 'PAID'
    WHEN 3 THEN 'PENDING'
    ELSE status
END
WHERE id BETWEEN 1 AND 3;

UPDATE movie_db.events
SET title = CASE id
    WHEN 1 THEN 'Happy Day - Thứ Ba vui vẻ'
    WHEN 2 THEN 'Ưu đãi thành viên Cinema'
    WHEN 3 THEN 'Giảm 10% khi thanh toán online'
    ELSE title
END
WHERE id BETWEEN 1 AND 3;
