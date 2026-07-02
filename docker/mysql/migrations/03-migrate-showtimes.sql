SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE showtime_db;

SET @show_date_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'showtime_db'
      AND table_name = 'showtimes'
      AND column_name = 'show_date'
);
SET @add_show_date_sql = IF(
    @show_date_exists = 0,
    'ALTER TABLE showtimes ADD COLUMN show_date DATE NULL AFTER movie_name',
    'SELECT 1'
);
PREPARE add_show_date_stmt FROM @add_show_date_sql;
EXECUTE add_show_date_stmt;
DEALLOCATE PREPARE add_show_date_stmt;

SET @created_at_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'showtime_db'
      AND table_name = 'showtimes'
      AND column_name = 'created_at'
);
SET @add_created_at_sql = IF(
    @created_at_exists = 0,
    'ALTER TABLE showtimes ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
);
PREPARE add_created_at_stmt FROM @add_created_at_sql;
EXECUTE add_created_at_stmt;
DEALLOCATE PREPARE add_created_at_stmt;

UPDATE showtimes s
JOIN rooms r ON r.id = s.room_id
LEFT JOIN movie_db.movies m ON m.id = s.movie_id
SET s.theater_id = r.theater_id,
    s.movie_name = COALESCE(NULLIF(m.title, ''), NULLIF(s.movie_name, ''), CONCAT('Phim #', s.movie_id)),
    s.show_date = COALESCE(
        s.show_date,
        DATE_ADD(CURDATE(), INTERVAL GREATEST(1, CEIL(s.id / 3)) DAY)
    ),
    s.audio_language = COALESCE(NULLIF(s.audio_language, ''), 'Việt'),
    s.subtitle_language = COALESCE(NULLIF(s.subtitle_language, ''), 'Tiếng Việt'),
    s.format_type = COALESCE(NULLIF(s.format_type, ''), NULLIF(r.type, ''), '2D'),
    s.status = CASE
        WHEN s.status IN ('ONLINE', 'SOLD_OUT', 'CANCELLED', 'OFFLINE') THEN s.status
        ELSE 'ONLINE'
    END,
    s.created_at = COALESCE(s.created_at, CURRENT_TIMESTAMP);

SET @ticket_price_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'showtime_db'
      AND table_name = 'showtimes'
      AND column_name = 'ticket_price'
);
SET @drop_ticket_price_sql = IF(
    @ticket_price_exists > 0,
    'ALTER TABLE showtimes DROP COLUMN ticket_price',
    'SELECT 1'
);
PREPARE drop_ticket_price_stmt FROM @drop_ticket_price_sql;
EXECUTE drop_ticket_price_stmt;
DEALLOCATE PREPARE drop_ticket_price_stmt;

SET @legacy_price_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'showtime_db'
      AND table_name = 'showtimes'
      AND column_name = 'price'
);
SET @drop_legacy_price_sql = IF(
    @legacy_price_exists > 0,
    'ALTER TABLE showtimes DROP COLUMN price',
    'SELECT 1'
);
PREPARE drop_legacy_price_stmt FROM @drop_legacy_price_sql;
EXECUTE drop_legacy_price_stmt;
DEALLOCATE PREPARE drop_legacy_price_stmt;

ALTER TABLE showtimes
    MODIFY theater_id BIGINT NOT NULL,
    MODIFY room_id BIGINT NOT NULL,
    MODIFY movie_id BIGINT NOT NULL,
    MODIFY movie_name VARCHAR(255) NOT NULL,
    MODIFY show_date DATE NOT NULL,
    MODIFY start_time TIME NOT NULL,
    MODIFY end_time TIME NOT NULL,
    MODIFY status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    MODIFY created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

SET @theater_date_index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = 'showtime_db'
      AND table_name = 'showtimes'
      AND index_name = 'idx_showtimes_theater_date'
);
SET @add_theater_date_index_sql = IF(
    @theater_date_index_exists = 0,
    'CREATE INDEX idx_showtimes_theater_date ON showtimes (theater_id, show_date)',
    'SELECT 1'
);
PREPARE add_theater_date_index_stmt FROM @add_theater_date_index_sql;
EXECUTE add_theater_date_index_stmt;
DEALLOCATE PREPARE add_theater_date_index_stmt;

SET @room_time_index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = 'showtime_db'
      AND table_name = 'showtimes'
      AND index_name = 'idx_showtimes_room_date_time'
);
SET @add_room_time_index_sql = IF(
    @room_time_index_exists = 0,
    'CREATE INDEX idx_showtimes_room_date_time ON showtimes (room_id, show_date, start_time, end_time)',
    'SELECT 1'
);
PREPARE add_room_time_index_stmt FROM @add_room_time_index_sql;
EXECUTE add_room_time_index_stmt;
DEALLOCATE PREPARE add_room_time_index_stmt;
