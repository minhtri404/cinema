SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE showtime_db;

INSERT INTO showtimes
(theater_id, room_id, movie_id, movie_name, show_date, start_time, end_time,
 audio_language, subtitle_language, format_type, status, created_at)
SELECT v.theater_id, v.room_id, v.movie_id, v.movie_name, v.show_date,
       v.start_time, v.end_time, 'Việt', 'Tiếng Việt', v.format_type,
       'ONLINE', NOW()
FROM (
    SELECT 1 theater_id, 1 room_id, 1 movie_id, 'Avengers: Endgame' movie_name,
           DATE_ADD(CURDATE(), INTERVAL 1 DAY) show_date,
           '10:00:00' start_time, '13:01:00' end_time, '2D' format_type
    UNION ALL
    SELECT 1, 2, 2, 'Doraemon Movie',
           DATE_ADD(CURDATE(), INTERVAL 1 DAY),
           '14:00:00', '15:50:00', '3D'
    UNION ALL
    SELECT 1, 3, 3, 'Lật Mặt 8',
           DATE_ADD(CURDATE(), INTERVAL 1 DAY),
           '19:30:00', '22:16:00', 'IMAX'
    UNION ALL
    SELECT 2, 4, 4, 'Inside Out 2',
           DATE_ADD(CURDATE(), INTERVAL 2 DAY),
           '09:30:00', '11:06:00', '2D'
    UNION ALL
    SELECT 2, 5, 5, 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô',
           DATE_ADD(CURDATE(), INTERVAL 2 DAY),
           '16:45:00', '18:36:00', '3D'
    UNION ALL
    SELECT 3, 6, 6, 'Dune: Hành Tinh Cát - Phần Hai',
           DATE_ADD(CURDATE(), INTERVAL 3 DAY),
           '20:15:00', '23:01:00', '2D'
) v
WHERE NOT EXISTS (
    SELECT 1
    FROM showtimes s
    WHERE s.movie_id = v.movie_id
      AND s.room_id = v.room_id
      AND s.show_date = v.show_date
      AND s.start_time = v.start_time
);

USE booking_db;

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
