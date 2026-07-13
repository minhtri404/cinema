-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: movie_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `movie_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `movie_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `movie_db`;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `apply_condition` text COLLATE utf8mb4_unicode_ci,
  `content` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `end_date` date NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `staff_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKs28f48qss2cnh9fowua47xjss` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Áp dụng cho tất cả khách hàng mua vé online.','Chuỗi suất chiếu đặc biệt cho các phim hành động và khoa học viễn tưởng đang được yêu thích.','2026-07-13 19:03:11.791576','2026-07-27','https://placehold.co/900x420/1d4ed8/ffffff?text=Blockbuster+Week','Admin Cinema','2026-07-13','ONLINE','Tuần lễ phim bom tấn'),(2,'Áp dụng cho tài khoản có vai trò CUSTOMER.','Thành viên thân thiết nhận ưu đãi vé và combo bắp nước trong khung giờ vàng.','2026-07-13 19:03:11.791576','2026-08-12','https://placehold.co/900x420/7c3aed/ffffff?text=Member+Day','Admin Cinema','2026-07-16','ONLINE','Ngày hội thành viên'),(3,'Áp dụng tại các rạp đang hoạt động.','Các bộ phim hoạt hình và gia đình được sắp xếp thêm suất chiếu sáng thứ Bảy, Chủ nhật.','2026-07-13 19:03:11.791576','2026-08-27','https://placehold.co/900x420/059669/ffffff?text=Family+Weekend','Admin Cinema','2026-07-14','ONLINE','Suất chiếu gia đình cuối tuần');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genres`
--

DROP TABLE IF EXISTS `genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genres` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpe1a9woik1k97l87cieguyhh4` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genres`
--

LOCK TABLES `genres` WRITE;
/*!40000 ALTER TABLE `genres` DISABLE KEYS */;
INSERT INTO `genres` VALUES (1,_binary '','Phim hành động có nhịp phim nhanh, nhiều cảnh rượt đuổi và chiến đấu.','Hành động'),(2,_binary '','Phim hoạt hình dành cho gia đình, thiếu nhi và khán giả trẻ.','Hoạt hình'),(3,_binary '','Phim tập trung vào câu chuyện, cảm xúc và hành trình nhân vật.','Tâm lý'),(4,_binary '','Phim hài giải trí nhẹ nhàng, phù hợp xem cùng bạn bè và gia đình.','Hài'),(5,_binary '','Phim kinh dị tạo cảm giác hồi hộp, căng thẳng và bất ngờ.','Kinh dị'),(6,_binary '','Phim tình cảm, lãng mạn, khai thác các mối quan hệ và cảm xúc.','Tình cảm'),(7,_binary '','Phim về công nghệ, tương lai và những thế giới mới.','Khoa học viễn tưởng'),(8,_binary '','Phim giả tưởng với phép thuật, truyền thuyết và thế giới hư cấu.','Giả tưởng'),(9,_binary '','Phim điều tra, bí ẩn và nhiều nút thắt.','Giật gân'),(10,_binary '','Phim phiêu lưu với hành trình khám phá và thử thách.','Phiêu lưu'),(11,_binary '','Phim có nội dung tích cực, dễ xem cho nhiều lứa tuổi.','Gia đình'),(12,_binary '','Phim xoay quanh điều tra, manh mối và lời giải cuối cùng.','Bí ẩn');
/*!40000 ALTER TABLE `genres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `director` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `genre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poster_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trailer_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (1,'2026-07-13 19:03:11.761499','Riley bước vào tuổi mới lớn, nơi những cảm xúc quen thuộc phải học cách làm việc cùng các cảm xúc hoàn toàn mới.','Kelsey Mann',96,'Hoạt hình','https://m.media-amazon.com/images/M/MV5BYWY3MDE2Y2UtOTE3Zi00MGUzLTg2MTItZjE1ZWVkMGVlODRmXkEyXkFqcGc@._V1_.jpg','2026-06-05','NOW_SHOWING','Inside Out 2','https://www.youtube.com/watch?v=LEjhY15eCx0'),(2,'2026-07-13 19:03:11.761499','Conan đối đầu một vụ án quy mô lớn với những manh mối phức tạp, các cuộc truy đuổi nghẹt thở và bí mật về một thanh kiếm cổ.','Chika Nagaoka',111,'Bí ẩn','https://m.media-amazon.com/images/M/MV5BNmQ1ZTAwNzUtYmE0YS00NGIxLWJkOTYtZWRhMGYxMzBjNjNjXkEyXkFqcGc@._V1_.jpg','2026-06-12','NOW_SHOWING','Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô','https://www.youtube.com/watch?v='),(3,'2026-07-13 19:03:11.761499','Paul Atreides tiếp tục hành trình trên Arrakis trong cuộc chiến khốc liệt về quyền lực, định mệnh và lòng trung thành.','Denis Villeneuve',166,'Khoa học viễn tưởng','https://m.media-amazon.com/images/M/MV5BZjA2NGY2NTYtODliZS00NDk2LWE1MzMtNTVlOTQ2YjI5Y2Y4XkEyXkFqcGc@._V1_.jpg','2026-06-15','NOW_SHOWING','Dune: Hành Tinh Cát - Phần Hai','https://www.youtube.com/watch?v=Way9Dexny3w'),(4,'2026-07-13 19:03:11.761499','Sau cú búng tay của Thanos, những siêu anh hùng còn lại tập hợp cho nhiệm vụ cuối cùng để khôi phục vũ trụ.','Anthony Russo, Joe Russo',181,'Hành động','https://m.media-amazon.com/images/M/MV5BMTc5MTE4YzItZTk2Ny00Mjc2LTk0Y2UtYzNhYjY4MzEwYjU1XkEyXkFqcGc@._V1_.jpg','2026-06-20','COMING_SOON','Avengers: Endgame','https://www.youtube.com/watch?v=TcMBFSGVi1c'),(5,'2026-07-13 19:03:11.761499','Một câu chuyện Việt Nam giàu cảm xúc, kết hợp yếu tố gia đình, hành động và những lựa chọn khó khăn.','Lý Hải',135,'Tâm lý','https://placehold.co/360x540/0f172a/ffffff?text=Lat+Mat+8','2026-06-25','COMING_SOON','Lật Mặt 8','https://www.youtube.com/watch?v=');
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `staff_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK9tfgiwqioj4gn86792hj5fgx3` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'Hệ thống đặt vé trực tuyến được nâng cấp với giao diện nhanh hơn, dễ chọn ghế và hỗ trợ nhiều chương trình khuyến mãi.','2026-07-13 19:03:11.829710','https://placehold.co/900x420/0f172a/ffffff?text=Cinema+Booking','Admin Cinema','ONLINE','Cinema ra mắt hệ thống đặt vé mới','2026-07-13 19:03:11.829710'),(2,'Danh sách các bộ phim nổi bật gồm Inside Out 2, Conan Movie và Dune: Hành Tinh Cát - Phần Hai.','2026-07-13 19:03:11.829710','https://placehold.co/900x420/f97316/ffffff?text=Top+Movies','Biên tập viên','ONLINE','Top phim đáng xem trong tháng','2026-07-13 19:03:11.829710'),(3,'Một số phòng chiếu được bổ sung ghế VIP, âm thanh cải tiến và hệ thống đặt ghế trực quan hơn.','2026-07-13 19:03:11.829710','https://placehold.co/900x420/0891b2/ffffff?text=Cinema+Experience','Demo Manager','ONLINE','Nâng cấp trải nghiệm phòng chiếu','2026-07-13 19:03:11.829710');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'movie_db'
--

--
-- Dumping routines for database 'movie_db'
--

--
-- Current Database: `showtime_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `showtime_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `showtime_db`;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `column_count` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `row_count` int DEFAULT NULL,
  `seat_count` int DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `theater_id` bigint DEFAULT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,10,'Room 1',8,80,'ONLINE',1,'2D'),(2,10,'Room 2',9,90,'ONLINE',1,'3D'),(3,10,'Room 3',10,100,'ONLINE',1,'IMAX'),(4,10,'Room 1',8,80,'ONLINE',2,'2D'),(5,10,'Room 2',8,80,'ONLINE',2,'3D'),(6,10,'Room 1',9,90,'ONLINE',3,'2D'),(7,10,'Room 2',9,90,'ONLINE',3,'4DX');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seats` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `extra_price` double DEFAULT NULL,
  `room_id` bigint DEFAULT NULL,
  `seat_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seat_number` int DEFAULT NULL,
  `seat_row` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seat_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_seats_room_code` (`room_id`,`seat_code`)
) ENGINE=InnoDB AUTO_INCREMENT=1024 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1,20000,1,'A1',1,'A','VIP','ACTIVE'),(2,20000,1,'A2',2,'A','VIP','ACTIVE'),(3,20000,1,'A3',3,'A','VIP','ACTIVE'),(4,20000,1,'A4',4,'A','VIP','ACTIVE'),(5,20000,1,'A5',5,'A','VIP','ACTIVE'),(6,20000,1,'A6',6,'A','VIP','ACTIVE'),(7,20000,1,'A7',7,'A','VIP','ACTIVE'),(8,20000,1,'A8',8,'A','VIP','ACTIVE'),(9,20000,1,'A9',9,'A','VIP','ACTIVE'),(10,20000,1,'A10',10,'A','VIP','ACTIVE'),(11,20000,1,'B1',1,'B','VIP','ACTIVE'),(12,20000,1,'B2',2,'B','VIP','ACTIVE'),(13,20000,1,'B3',3,'B','VIP','ACTIVE'),(14,20000,1,'B4',4,'B','VIP','ACTIVE'),(15,20000,1,'B5',5,'B','VIP','ACTIVE'),(16,20000,1,'B6',6,'B','VIP','ACTIVE'),(17,20000,1,'B7',7,'B','VIP','ACTIVE'),(18,20000,1,'B8',8,'B','VIP','ACTIVE'),(19,20000,1,'B9',9,'B','VIP','ACTIVE'),(20,20000,1,'B10',10,'B','VIP','ACTIVE'),(21,0,1,'C1',1,'C','STANDARD','ACTIVE'),(22,0,1,'C2',2,'C','STANDARD','ACTIVE'),(23,0,1,'C3',3,'C','STANDARD','ACTIVE'),(24,0,1,'C4',4,'C','STANDARD','ACTIVE'),(25,0,1,'C5',5,'C','STANDARD','ACTIVE'),(26,0,1,'C6',6,'C','STANDARD','ACTIVE'),(27,0,1,'C7',7,'C','STANDARD','ACTIVE'),(28,0,1,'C8',8,'C','STANDARD','ACTIVE'),(29,0,1,'C9',9,'C','STANDARD','ACTIVE'),(30,0,1,'C10',10,'C','STANDARD','ACTIVE'),(31,0,1,'D1',1,'D','STANDARD','ACTIVE'),(32,0,1,'D2',2,'D','STANDARD','ACTIVE'),(33,0,1,'D3',3,'D','STANDARD','ACTIVE'),(34,0,1,'D4',4,'D','STANDARD','ACTIVE'),(35,0,1,'D5',5,'D','STANDARD','ACTIVE'),(36,0,1,'D6',6,'D','STANDARD','ACTIVE'),(37,0,1,'D7',7,'D','STANDARD','ACTIVE'),(38,0,1,'D8',8,'D','STANDARD','ACTIVE'),(39,0,1,'D9',9,'D','STANDARD','ACTIVE'),(40,0,1,'D10',10,'D','STANDARD','ACTIVE'),(41,0,1,'E1',1,'E','STANDARD','ACTIVE'),(42,0,1,'E2',2,'E','STANDARD','ACTIVE'),(43,0,1,'E3',3,'E','STANDARD','ACTIVE'),(44,0,1,'E4',4,'E','STANDARD','ACTIVE'),(45,0,1,'E5',5,'E','STANDARD','ACTIVE'),(46,0,1,'E6',6,'E','STANDARD','ACTIVE'),(47,0,1,'E7',7,'E','STANDARD','ACTIVE'),(48,0,1,'E8',8,'E','STANDARD','ACTIVE'),(49,0,1,'E9',9,'E','STANDARD','ACTIVE'),(50,0,1,'E10',10,'E','STANDARD','ACTIVE'),(51,0,1,'F1',1,'F','STANDARD','ACTIVE'),(52,0,1,'F2',2,'F','STANDARD','ACTIVE'),(53,0,1,'F3',3,'F','STANDARD','ACTIVE'),(54,0,1,'F4',4,'F','STANDARD','ACTIVE'),(55,0,1,'F5',5,'F','STANDARD','ACTIVE'),(56,0,1,'F6',6,'F','STANDARD','ACTIVE'),(57,0,1,'F7',7,'F','STANDARD','ACTIVE'),(58,0,1,'F8',8,'F','STANDARD','ACTIVE'),(59,0,1,'F9',9,'F','STANDARD','ACTIVE'),(60,0,1,'F10',10,'F','STANDARD','ACTIVE'),(61,0,1,'G1',1,'G','STANDARD','ACTIVE'),(62,0,1,'G2',2,'G','STANDARD','ACTIVE'),(63,0,1,'G3',3,'G','STANDARD','ACTIVE'),(64,0,1,'G4',4,'G','STANDARD','ACTIVE'),(65,0,1,'G5',5,'G','STANDARD','ACTIVE'),(66,0,1,'G6',6,'G','STANDARD','ACTIVE'),(67,0,1,'G7',7,'G','STANDARD','ACTIVE'),(68,0,1,'G8',8,'G','STANDARD','ACTIVE'),(69,0,1,'G9',9,'G','STANDARD','ACTIVE'),(70,0,1,'G10',10,'G','STANDARD','ACTIVE'),(71,0,1,'H1',1,'H','STANDARD','ACTIVE'),(72,0,1,'H2',2,'H','STANDARD','ACTIVE'),(73,30000,1,'H3',3,'H','COUPLE','ACTIVE'),(74,30000,1,'H4',4,'H','COUPLE','ACTIVE'),(75,0,1,'H5',5,'H','STANDARD','ACTIVE'),(76,0,1,'H6',6,'H','STANDARD','ACTIVE'),(77,30000,1,'H7',7,'H','COUPLE','ACTIVE'),(78,30000,1,'H8',8,'H','COUPLE','ACTIVE'),(79,0,1,'H9',9,'H','STANDARD','ACTIVE'),(80,0,1,'H10',10,'H','STANDARD','ACTIVE'),(81,20000,2,'A1',1,'A','VIP','ACTIVE'),(82,20000,2,'A2',2,'A','VIP','ACTIVE'),(83,20000,2,'A3',3,'A','VIP','ACTIVE'),(84,20000,2,'A4',4,'A','VIP','ACTIVE'),(85,20000,2,'A5',5,'A','VIP','ACTIVE'),(86,20000,2,'A6',6,'A','VIP','ACTIVE'),(87,20000,2,'A7',7,'A','VIP','ACTIVE'),(88,20000,2,'A8',8,'A','VIP','ACTIVE'),(89,20000,2,'A9',9,'A','VIP','ACTIVE'),(90,20000,2,'A10',10,'A','VIP','ACTIVE'),(91,20000,2,'B1',1,'B','VIP','ACTIVE'),(92,20000,2,'B2',2,'B','VIP','ACTIVE'),(93,20000,2,'B3',3,'B','VIP','ACTIVE'),(94,20000,2,'B4',4,'B','VIP','ACTIVE'),(95,20000,2,'B5',5,'B','VIP','ACTIVE'),(96,20000,2,'B6',6,'B','VIP','ACTIVE'),(97,20000,2,'B7',7,'B','VIP','ACTIVE'),(98,20000,2,'B8',8,'B','VIP','ACTIVE'),(99,20000,2,'B9',9,'B','VIP','ACTIVE'),(100,20000,2,'B10',10,'B','VIP','ACTIVE'),(101,0,2,'C1',1,'C','STANDARD','ACTIVE'),(102,0,2,'C2',2,'C','STANDARD','ACTIVE'),(103,0,2,'C3',3,'C','STANDARD','ACTIVE'),(104,0,2,'C4',4,'C','STANDARD','ACTIVE'),(105,0,2,'C5',5,'C','STANDARD','ACTIVE'),(106,0,2,'C6',6,'C','STANDARD','ACTIVE'),(107,0,2,'C7',7,'C','STANDARD','ACTIVE'),(108,0,2,'C8',8,'C','STANDARD','ACTIVE'),(109,0,2,'C9',9,'C','STANDARD','ACTIVE'),(110,0,2,'C10',10,'C','STANDARD','ACTIVE'),(111,0,2,'D1',1,'D','STANDARD','ACTIVE'),(112,0,2,'D2',2,'D','STANDARD','ACTIVE'),(113,0,2,'D3',3,'D','STANDARD','ACTIVE'),(114,0,2,'D4',4,'D','STANDARD','ACTIVE'),(115,0,2,'D5',5,'D','STANDARD','ACTIVE'),(116,0,2,'D6',6,'D','STANDARD','ACTIVE'),(117,0,2,'D7',7,'D','STANDARD','ACTIVE'),(118,0,2,'D8',8,'D','STANDARD','ACTIVE'),(119,0,2,'D9',9,'D','STANDARD','ACTIVE'),(120,0,2,'D10',10,'D','STANDARD','ACTIVE'),(121,0,2,'E1',1,'E','STANDARD','ACTIVE'),(122,0,2,'E2',2,'E','STANDARD','ACTIVE'),(123,0,2,'E3',3,'E','STANDARD','ACTIVE'),(124,0,2,'E4',4,'E','STANDARD','ACTIVE'),(125,0,2,'E5',5,'E','STANDARD','ACTIVE'),(126,0,2,'E6',6,'E','STANDARD','ACTIVE'),(127,0,2,'E7',7,'E','STANDARD','ACTIVE'),(128,0,2,'E8',8,'E','STANDARD','ACTIVE'),(129,0,2,'E9',9,'E','STANDARD','ACTIVE'),(130,0,2,'E10',10,'E','STANDARD','ACTIVE'),(131,0,2,'F1',1,'F','STANDARD','ACTIVE'),(132,0,2,'F2',2,'F','STANDARD','ACTIVE'),(133,0,2,'F3',3,'F','STANDARD','ACTIVE'),(134,0,2,'F4',4,'F','STANDARD','ACTIVE'),(135,0,2,'F5',5,'F','STANDARD','ACTIVE'),(136,0,2,'F6',6,'F','STANDARD','ACTIVE'),(137,0,2,'F7',7,'F','STANDARD','ACTIVE'),(138,0,2,'F8',8,'F','STANDARD','ACTIVE'),(139,0,2,'F9',9,'F','STANDARD','ACTIVE'),(140,0,2,'F10',10,'F','STANDARD','ACTIVE'),(141,0,2,'G1',1,'G','STANDARD','ACTIVE'),(142,0,2,'G2',2,'G','STANDARD','ACTIVE'),(143,0,2,'G3',3,'G','STANDARD','ACTIVE'),(144,0,2,'G4',4,'G','STANDARD','ACTIVE'),(145,0,2,'G5',5,'G','STANDARD','ACTIVE'),(146,0,2,'G6',6,'G','STANDARD','ACTIVE'),(147,0,2,'G7',7,'G','STANDARD','ACTIVE'),(148,0,2,'G8',8,'G','STANDARD','ACTIVE'),(149,0,2,'G9',9,'G','STANDARD','ACTIVE'),(150,0,2,'G10',10,'G','STANDARD','ACTIVE'),(151,0,2,'H1',1,'H','STANDARD','ACTIVE'),(152,0,2,'H2',2,'H','STANDARD','ACTIVE'),(153,0,2,'H3',3,'H','STANDARD','ACTIVE'),(154,0,2,'H4',4,'H','STANDARD','ACTIVE'),(155,0,2,'H5',5,'H','STANDARD','ACTIVE'),(156,0,2,'H6',6,'H','STANDARD','ACTIVE'),(157,0,2,'H7',7,'H','STANDARD','ACTIVE'),(158,0,2,'H8',8,'H','STANDARD','ACTIVE'),(159,0,2,'H9',9,'H','STANDARD','ACTIVE'),(160,0,2,'H10',10,'H','STANDARD','ACTIVE'),(161,0,2,'I1',1,'I','STANDARD','ACTIVE'),(162,0,2,'I2',2,'I','STANDARD','ACTIVE'),(163,0,2,'I3',3,'I','STANDARD','ACTIVE'),(164,0,2,'I4',4,'I','STANDARD','ACTIVE'),(165,0,2,'I5',5,'I','STANDARD','ACTIVE'),(166,0,2,'I6',6,'I','STANDARD','ACTIVE'),(167,0,2,'I7',7,'I','STANDARD','ACTIVE'),(168,0,2,'I8',8,'I','STANDARD','ACTIVE'),(169,0,2,'I9',9,'I','STANDARD','ACTIVE'),(170,0,2,'I10',10,'I','STANDARD','ACTIVE'),(171,0,2,'J1',1,'J','STANDARD','ACTIVE'),(172,0,2,'J2',2,'J','STANDARD','ACTIVE'),(173,30000,2,'J3',3,'J','COUPLE','ACTIVE'),(174,30000,2,'J4',4,'J','COUPLE','ACTIVE'),(175,0,2,'J5',5,'J','STANDARD','ACTIVE'),(176,0,2,'J6',6,'J','STANDARD','ACTIVE'),(177,30000,2,'J7',7,'J','COUPLE','ACTIVE'),(178,30000,2,'J8',8,'J','COUPLE','ACTIVE'),(179,0,2,'J9',9,'J','STANDARD','ACTIVE'),(180,0,2,'J10',10,'J','STANDARD','ACTIVE'),(181,30000,3,'A1',1,'A','IMAX','ACTIVE'),(182,30000,3,'A2',2,'A','IMAX','ACTIVE'),(183,30000,3,'A3',3,'A','IMAX','ACTIVE'),(184,30000,3,'A4',4,'A','IMAX','ACTIVE'),(185,30000,3,'A5',5,'A','IMAX','ACTIVE'),(186,30000,3,'A6',6,'A','IMAX','ACTIVE'),(187,30000,3,'A7',7,'A','IMAX','ACTIVE'),(188,30000,3,'A8',8,'A','IMAX','ACTIVE'),(189,30000,3,'A9',9,'A','IMAX','ACTIVE'),(190,30000,3,'A10',10,'A','IMAX','ACTIVE'),(191,30000,3,'B1',1,'B','IMAX','ACTIVE'),(192,30000,3,'B2',2,'B','IMAX','ACTIVE'),(193,30000,3,'B3',3,'B','IMAX','ACTIVE'),(194,30000,3,'B4',4,'B','IMAX','ACTIVE'),(195,30000,3,'B5',5,'B','IMAX','ACTIVE'),(196,30000,3,'B6',6,'B','IMAX','ACTIVE'),(197,30000,3,'B7',7,'B','IMAX','ACTIVE'),(198,30000,3,'B8',8,'B','IMAX','ACTIVE'),(199,30000,3,'B9',9,'B','IMAX','ACTIVE'),(200,30000,3,'B10',10,'B','IMAX','ACTIVE'),(201,30000,3,'C1',1,'C','IMAX','ACTIVE'),(202,30000,3,'C2',2,'C','IMAX','ACTIVE'),(203,30000,3,'C3',3,'C','IMAX','ACTIVE'),(204,30000,3,'C4',4,'C','IMAX','ACTIVE'),(205,30000,3,'C5',5,'C','IMAX','ACTIVE'),(206,30000,3,'C6',6,'C','IMAX','ACTIVE'),(207,30000,3,'C7',7,'C','IMAX','ACTIVE'),(208,30000,3,'C8',8,'C','IMAX','ACTIVE'),(209,30000,3,'C9',9,'C','IMAX','ACTIVE'),(210,30000,3,'C10',10,'C','IMAX','ACTIVE'),(211,30000,3,'D1',1,'D','IMAX','ACTIVE'),(212,30000,3,'D2',2,'D','IMAX','ACTIVE'),(213,30000,3,'D3',3,'D','IMAX','ACTIVE'),(214,30000,3,'D4',4,'D','IMAX','ACTIVE'),(215,30000,3,'D5',5,'D','IMAX','ACTIVE'),(216,30000,3,'D6',6,'D','IMAX','ACTIVE'),(217,30000,3,'D7',7,'D','IMAX','ACTIVE'),(218,30000,3,'D8',8,'D','IMAX','ACTIVE'),(219,30000,3,'D9',9,'D','IMAX','ACTIVE'),(220,30000,3,'D10',10,'D','IMAX','ACTIVE'),(221,30000,3,'E1',1,'E','IMAX','ACTIVE'),(222,30000,3,'E2',2,'E','IMAX','ACTIVE'),(223,30000,3,'E3',3,'E','IMAX','ACTIVE'),(224,30000,3,'E4',4,'E','IMAX','ACTIVE'),(225,30000,3,'E5',5,'E','IMAX','ACTIVE'),(226,30000,3,'E6',6,'E','IMAX','ACTIVE'),(227,30000,3,'E7',7,'E','IMAX','ACTIVE'),(228,30000,3,'E8',8,'E','IMAX','ACTIVE'),(229,30000,3,'E9',9,'E','IMAX','ACTIVE'),(230,30000,3,'E10',10,'E','IMAX','ACTIVE'),(231,20000,4,'A1',1,'A','VIP','ACTIVE'),(232,20000,4,'A2',2,'A','VIP','ACTIVE'),(233,20000,4,'A3',3,'A','VIP','ACTIVE'),(234,20000,4,'A4',4,'A','VIP','ACTIVE'),(235,20000,4,'A5',5,'A','VIP','ACTIVE'),(236,20000,4,'A6',6,'A','VIP','ACTIVE'),(237,20000,4,'A7',7,'A','VIP','ACTIVE'),(238,20000,4,'A8',8,'A','VIP','ACTIVE'),(239,20000,4,'A9',9,'A','VIP','ACTIVE'),(240,20000,4,'A10',10,'A','VIP','ACTIVE'),(241,20000,4,'B1',1,'B','VIP','ACTIVE'),(242,20000,4,'B2',2,'B','VIP','ACTIVE'),(243,20000,4,'B3',3,'B','VIP','ACTIVE'),(244,20000,4,'B4',4,'B','VIP','ACTIVE'),(245,20000,4,'B5',5,'B','VIP','ACTIVE'),(246,20000,4,'B6',6,'B','VIP','ACTIVE'),(247,20000,4,'B7',7,'B','VIP','ACTIVE'),(248,20000,4,'B8',8,'B','VIP','ACTIVE'),(249,20000,4,'B9',9,'B','VIP','ACTIVE'),(250,20000,4,'B10',10,'B','VIP','ACTIVE'),(251,0,4,'C1',1,'C','STANDARD','ACTIVE'),(252,0,4,'C2',2,'C','STANDARD','ACTIVE'),(253,0,4,'C3',3,'C','STANDARD','ACTIVE'),(254,0,4,'C4',4,'C','STANDARD','ACTIVE'),(255,0,4,'C5',5,'C','STANDARD','ACTIVE'),(256,0,4,'C6',6,'C','STANDARD','ACTIVE'),(257,0,4,'C7',7,'C','STANDARD','ACTIVE'),(258,0,4,'C8',8,'C','STANDARD','ACTIVE'),(259,0,4,'C9',9,'C','STANDARD','ACTIVE'),(260,0,4,'C10',10,'C','STANDARD','ACTIVE'),(261,0,4,'D1',1,'D','STANDARD','ACTIVE'),(262,0,4,'D2',2,'D','STANDARD','ACTIVE'),(263,0,4,'D3',3,'D','STANDARD','ACTIVE'),(264,0,4,'D4',4,'D','STANDARD','ACTIVE'),(265,0,4,'D5',5,'D','STANDARD','ACTIVE'),(266,0,4,'D6',6,'D','STANDARD','ACTIVE'),(267,0,4,'D7',7,'D','STANDARD','ACTIVE'),(268,0,4,'D8',8,'D','STANDARD','ACTIVE'),(269,0,4,'D9',9,'D','STANDARD','ACTIVE'),(270,0,4,'D10',10,'D','STANDARD','ACTIVE'),(271,0,4,'E1',1,'E','STANDARD','ACTIVE'),(272,0,4,'E2',2,'E','STANDARD','ACTIVE'),(273,0,4,'E3',3,'E','STANDARD','ACTIVE'),(274,0,4,'E4',4,'E','STANDARD','ACTIVE'),(275,0,4,'E5',5,'E','STANDARD','ACTIVE'),(276,0,4,'E6',6,'E','STANDARD','ACTIVE'),(277,0,4,'E7',7,'E','STANDARD','ACTIVE'),(278,0,4,'E8',8,'E','STANDARD','ACTIVE'),(279,0,4,'E9',9,'E','STANDARD','ACTIVE'),(280,0,4,'E10',10,'E','STANDARD','ACTIVE'),(281,0,4,'F1',1,'F','STANDARD','ACTIVE'),(282,0,4,'F2',2,'F','STANDARD','ACTIVE'),(283,0,4,'F3',3,'F','STANDARD','ACTIVE'),(284,0,4,'F4',4,'F','STANDARD','ACTIVE'),(285,0,4,'F5',5,'F','STANDARD','ACTIVE'),(286,0,4,'F6',6,'F','STANDARD','ACTIVE'),(287,0,4,'F7',7,'F','STANDARD','ACTIVE'),(288,0,4,'F8',8,'F','STANDARD','ACTIVE'),(289,0,4,'F9',9,'F','STANDARD','ACTIVE'),(290,0,4,'F10',10,'F','STANDARD','ACTIVE'),(291,0,4,'G1',1,'G','STANDARD','ACTIVE'),(292,0,4,'G2',2,'G','STANDARD','ACTIVE'),(293,0,4,'G3',3,'G','STANDARD','ACTIVE'),(294,0,4,'G4',4,'G','STANDARD','ACTIVE'),(295,0,4,'G5',5,'G','STANDARD','ACTIVE'),(296,0,4,'G6',6,'G','STANDARD','ACTIVE'),(297,0,4,'G7',7,'G','STANDARD','ACTIVE'),(298,0,4,'G8',8,'G','STANDARD','ACTIVE'),(299,0,4,'G9',9,'G','STANDARD','ACTIVE'),(300,0,4,'G10',10,'G','STANDARD','ACTIVE'),(301,0,4,'H1',1,'H','STANDARD','ACTIVE'),(302,0,4,'H2',2,'H','STANDARD','ACTIVE'),(303,0,4,'H3',3,'H','STANDARD','ACTIVE'),(304,0,4,'H4',4,'H','STANDARD','ACTIVE'),(305,0,4,'H5',5,'H','STANDARD','ACTIVE'),(306,0,4,'H6',6,'H','STANDARD','ACTIVE'),(307,0,4,'H7',7,'H','STANDARD','ACTIVE'),(308,0,4,'H8',8,'H','STANDARD','ACTIVE'),(309,0,4,'H9',9,'H','STANDARD','ACTIVE'),(310,0,4,'H10',10,'H','STANDARD','ACTIVE'),(311,0,4,'I1',1,'I','STANDARD','ACTIVE'),(312,0,4,'I2',2,'I','STANDARD','ACTIVE'),(313,30000,4,'I3',3,'I','COUPLE','ACTIVE'),(314,30000,4,'I4',4,'I','COUPLE','ACTIVE'),(315,0,4,'I5',5,'I','STANDARD','ACTIVE'),(316,0,4,'I6',6,'I','STANDARD','ACTIVE'),(317,30000,4,'I7',7,'I','COUPLE','ACTIVE'),(318,30000,4,'I8',8,'I','COUPLE','ACTIVE'),(319,0,4,'I9',9,'I','STANDARD','ACTIVE'),(320,0,4,'I10',10,'I','STANDARD','ACTIVE'),(321,20000,5,'A1',1,'A','VIP','ACTIVE'),(322,20000,5,'A2',2,'A','VIP','ACTIVE'),(323,20000,5,'A3',3,'A','VIP','ACTIVE'),(324,20000,5,'A4',4,'A','VIP','ACTIVE'),(325,20000,5,'A5',5,'A','VIP','ACTIVE'),(326,20000,5,'A6',6,'A','VIP','ACTIVE'),(327,20000,5,'A7',7,'A','VIP','ACTIVE'),(328,20000,5,'A8',8,'A','VIP','ACTIVE'),(329,20000,5,'A9',9,'A','VIP','ACTIVE'),(330,20000,5,'A10',10,'A','VIP','ACTIVE'),(331,20000,5,'A11',11,'A','VIP','ACTIVE'),(332,20000,5,'A12',12,'A','VIP','ACTIVE'),(333,20000,5,'B1',1,'B','VIP','ACTIVE'),(334,20000,5,'B2',2,'B','VIP','ACTIVE'),(335,20000,5,'B3',3,'B','VIP','ACTIVE'),(336,20000,5,'B4',4,'B','VIP','ACTIVE'),(337,20000,5,'B5',5,'B','VIP','ACTIVE'),(338,20000,5,'B6',6,'B','VIP','ACTIVE'),(339,20000,5,'B7',7,'B','VIP','ACTIVE'),(340,20000,5,'B8',8,'B','VIP','ACTIVE'),(341,20000,5,'B9',9,'B','VIP','ACTIVE'),(342,20000,5,'B10',10,'B','VIP','ACTIVE'),(343,20000,5,'B11',11,'B','VIP','ACTIVE'),(344,20000,5,'B12',12,'B','VIP','ACTIVE'),(345,0,5,'C1',1,'C','STANDARD','ACTIVE'),(346,0,5,'C2',2,'C','STANDARD','ACTIVE'),(347,0,5,'C3',3,'C','STANDARD','ACTIVE'),(348,0,5,'C4',4,'C','STANDARD','ACTIVE'),(349,0,5,'C5',5,'C','STANDARD','ACTIVE'),(350,0,5,'C6',6,'C','STANDARD','ACTIVE'),(351,0,5,'C7',7,'C','STANDARD','ACTIVE'),(352,0,5,'C8',8,'C','STANDARD','ACTIVE'),(353,0,5,'C9',9,'C','STANDARD','ACTIVE'),(354,0,5,'C10',10,'C','STANDARD','ACTIVE'),(355,0,5,'C11',11,'C','STANDARD','ACTIVE'),(356,0,5,'C12',12,'C','STANDARD','ACTIVE'),(357,0,5,'D1',1,'D','STANDARD','ACTIVE'),(358,0,5,'D2',2,'D','STANDARD','ACTIVE'),(359,0,5,'D3',3,'D','STANDARD','ACTIVE'),(360,0,5,'D4',4,'D','STANDARD','ACTIVE'),(361,0,5,'D5',5,'D','STANDARD','ACTIVE'),(362,0,5,'D6',6,'D','STANDARD','ACTIVE'),(363,0,5,'D7',7,'D','STANDARD','ACTIVE'),(364,0,5,'D8',8,'D','STANDARD','ACTIVE'),(365,0,5,'D9',9,'D','STANDARD','ACTIVE'),(366,0,5,'D10',10,'D','STANDARD','ACTIVE'),(367,0,5,'D11',11,'D','STANDARD','ACTIVE'),(368,0,5,'D12',12,'D','STANDARD','ACTIVE'),(369,0,5,'E1',1,'E','STANDARD','ACTIVE'),(370,0,5,'E2',2,'E','STANDARD','ACTIVE'),(371,0,5,'E3',3,'E','STANDARD','ACTIVE'),(372,0,5,'E4',4,'E','STANDARD','ACTIVE'),(373,0,5,'E5',5,'E','STANDARD','ACTIVE'),(374,0,5,'E6',6,'E','STANDARD','ACTIVE'),(375,0,5,'E7',7,'E','STANDARD','ACTIVE'),(376,0,5,'E8',8,'E','STANDARD','ACTIVE'),(377,0,5,'E9',9,'E','STANDARD','ACTIVE'),(378,0,5,'E10',10,'E','STANDARD','ACTIVE'),(379,0,5,'E11',11,'E','STANDARD','ACTIVE'),(380,0,5,'E12',12,'E','STANDARD','ACTIVE'),(381,0,5,'F1',1,'F','STANDARD','ACTIVE'),(382,0,5,'F2',2,'F','STANDARD','ACTIVE'),(383,0,5,'F3',3,'F','STANDARD','ACTIVE'),(384,0,5,'F4',4,'F','STANDARD','ACTIVE'),(385,0,5,'F5',5,'F','STANDARD','ACTIVE'),(386,0,5,'F6',6,'F','STANDARD','ACTIVE'),(387,0,5,'F7',7,'F','STANDARD','ACTIVE'),(388,0,5,'F8',8,'F','STANDARD','ACTIVE'),(389,0,5,'F9',9,'F','STANDARD','ACTIVE'),(390,0,5,'F10',10,'F','STANDARD','ACTIVE'),(391,0,5,'F11',11,'F','STANDARD','ACTIVE'),(392,0,5,'F12',12,'F','STANDARD','ACTIVE'),(393,0,5,'G1',1,'G','STANDARD','ACTIVE'),(394,0,5,'G2',2,'G','STANDARD','ACTIVE'),(395,0,5,'G3',3,'G','STANDARD','ACTIVE'),(396,0,5,'G4',4,'G','STANDARD','ACTIVE'),(397,0,5,'G5',5,'G','STANDARD','ACTIVE'),(398,0,5,'G6',6,'G','STANDARD','ACTIVE'),(399,0,5,'G7',7,'G','STANDARD','ACTIVE'),(400,0,5,'G8',8,'G','STANDARD','ACTIVE'),(401,0,5,'G9',9,'G','STANDARD','ACTIVE'),(402,0,5,'G10',10,'G','STANDARD','ACTIVE'),(403,0,5,'G11',11,'G','STANDARD','ACTIVE'),(404,0,5,'G12',12,'G','STANDARD','ACTIVE'),(405,0,5,'H1',1,'H','STANDARD','ACTIVE'),(406,0,5,'H2',2,'H','STANDARD','ACTIVE'),(407,0,5,'H3',3,'H','STANDARD','ACTIVE'),(408,0,5,'H4',4,'H','STANDARD','ACTIVE'),(409,0,5,'H5',5,'H','STANDARD','ACTIVE'),(410,0,5,'H6',6,'H','STANDARD','ACTIVE'),(411,0,5,'H7',7,'H','STANDARD','ACTIVE'),(412,0,5,'H8',8,'H','STANDARD','ACTIVE'),(413,0,5,'H9',9,'H','STANDARD','ACTIVE'),(414,0,5,'H10',10,'H','STANDARD','ACTIVE'),(415,0,5,'H11',11,'H','STANDARD','ACTIVE'),(416,0,5,'H12',12,'H','STANDARD','ACTIVE'),(417,0,5,'I1',1,'I','STANDARD','ACTIVE'),(418,0,5,'I2',2,'I','STANDARD','ACTIVE'),(419,0,5,'I3',3,'I','STANDARD','ACTIVE'),(420,0,5,'I4',4,'I','STANDARD','ACTIVE'),(421,0,5,'I5',5,'I','STANDARD','ACTIVE'),(422,0,5,'I6',6,'I','STANDARD','ACTIVE'),(423,0,5,'I7',7,'I','STANDARD','ACTIVE'),(424,0,5,'I8',8,'I','STANDARD','ACTIVE'),(425,0,5,'I9',9,'I','STANDARD','ACTIVE'),(426,0,5,'I10',10,'I','STANDARD','ACTIVE'),(427,0,5,'I11',11,'I','STANDARD','ACTIVE'),(428,0,5,'I12',12,'I','STANDARD','ACTIVE'),(429,0,5,'J1',1,'J','STANDARD','ACTIVE'),(430,0,5,'J2',2,'J','STANDARD','ACTIVE'),(431,30000,5,'J3',3,'J','COUPLE','ACTIVE'),(432,30000,5,'J4',4,'J','COUPLE','ACTIVE'),(433,0,5,'J5',5,'J','STANDARD','ACTIVE'),(434,0,5,'J6',6,'J','STANDARD','ACTIVE'),(435,30000,5,'J7',7,'J','COUPLE','ACTIVE'),(436,30000,5,'J8',8,'J','COUPLE','ACTIVE'),(437,0,5,'J9',9,'J','STANDARD','ACTIVE'),(438,0,5,'J10',10,'J','STANDARD','ACTIVE'),(439,0,5,'J11',11,'J','STANDARD','ACTIVE'),(440,0,5,'J12',12,'J','STANDARD','ACTIVE'),(441,20000,6,'A1',1,'A','VIP','ACTIVE'),(442,20000,6,'A2',2,'A','VIP','ACTIVE'),(443,20000,6,'A3',3,'A','VIP','ACTIVE'),(444,20000,6,'A4',4,'A','VIP','ACTIVE'),(445,20000,6,'A5',5,'A','VIP','ACTIVE'),(446,20000,6,'A6',6,'A','VIP','ACTIVE'),(447,20000,6,'A7',7,'A','VIP','ACTIVE'),(448,20000,6,'A8',8,'A','VIP','ACTIVE'),(449,20000,6,'A9',9,'A','VIP','ACTIVE'),(450,20000,6,'A10',10,'A','VIP','ACTIVE'),(451,20000,6,'B1',1,'B','VIP','ACTIVE'),(452,20000,6,'B2',2,'B','VIP','ACTIVE'),(453,20000,6,'B3',3,'B','VIP','ACTIVE'),(454,20000,6,'B4',4,'B','VIP','ACTIVE'),(455,20000,6,'B5',5,'B','VIP','ACTIVE'),(456,20000,6,'B6',6,'B','VIP','ACTIVE'),(457,20000,6,'B7',7,'B','VIP','ACTIVE'),(458,20000,6,'B8',8,'B','VIP','ACTIVE'),(459,20000,6,'B9',9,'B','VIP','ACTIVE'),(460,20000,6,'B10',10,'B','VIP','ACTIVE'),(461,0,6,'C1',1,'C','STANDARD','ACTIVE'),(462,0,6,'C2',2,'C','STANDARD','ACTIVE'),(463,0,6,'C3',3,'C','STANDARD','ACTIVE'),(464,0,6,'C4',4,'C','STANDARD','ACTIVE'),(465,0,6,'C5',5,'C','STANDARD','ACTIVE'),(466,0,6,'C6',6,'C','STANDARD','ACTIVE'),(467,0,6,'C7',7,'C','STANDARD','ACTIVE'),(468,0,6,'C8',8,'C','STANDARD','ACTIVE'),(469,0,6,'C9',9,'C','STANDARD','ACTIVE'),(470,0,6,'C10',10,'C','STANDARD','ACTIVE'),(471,0,6,'D1',1,'D','STANDARD','ACTIVE'),(472,0,6,'D2',2,'D','STANDARD','ACTIVE'),(473,0,6,'D3',3,'D','STANDARD','ACTIVE'),(474,0,6,'D4',4,'D','STANDARD','ACTIVE'),(475,0,6,'D5',5,'D','STANDARD','ACTIVE'),(476,0,6,'D6',6,'D','STANDARD','ACTIVE'),(477,0,6,'D7',7,'D','STANDARD','ACTIVE'),(478,0,6,'D8',8,'D','STANDARD','ACTIVE'),(479,0,6,'D9',9,'D','STANDARD','ACTIVE'),(480,0,6,'D10',10,'D','STANDARD','ACTIVE'),(481,0,6,'E1',1,'E','STANDARD','ACTIVE'),(482,0,6,'E2',2,'E','STANDARD','ACTIVE'),(483,0,6,'E3',3,'E','STANDARD','ACTIVE'),(484,0,6,'E4',4,'E','STANDARD','ACTIVE'),(485,0,6,'E5',5,'E','STANDARD','ACTIVE'),(486,0,6,'E6',6,'E','STANDARD','ACTIVE'),(487,0,6,'E7',7,'E','STANDARD','ACTIVE'),(488,0,6,'E8',8,'E','STANDARD','ACTIVE'),(489,0,6,'E9',9,'E','STANDARD','ACTIVE'),(490,0,6,'E10',10,'E','STANDARD','ACTIVE'),(491,0,6,'F1',1,'F','STANDARD','ACTIVE'),(492,0,6,'F2',2,'F','STANDARD','ACTIVE'),(493,0,6,'F3',3,'F','STANDARD','ACTIVE'),(494,0,6,'F4',4,'F','STANDARD','ACTIVE'),(495,0,6,'F5',5,'F','STANDARD','ACTIVE'),(496,0,6,'F6',6,'F','STANDARD','ACTIVE'),(497,0,6,'F7',7,'F','STANDARD','ACTIVE'),(498,0,6,'F8',8,'F','STANDARD','ACTIVE'),(499,0,6,'F9',9,'F','STANDARD','ACTIVE'),(500,0,6,'F10',10,'F','STANDARD','ACTIVE'),(501,0,6,'G1',1,'G','STANDARD','ACTIVE'),(502,0,6,'G2',2,'G','STANDARD','ACTIVE'),(503,30000,6,'G3',3,'G','COUPLE','ACTIVE'),(504,30000,6,'G4',4,'G','COUPLE','ACTIVE'),(505,0,6,'G5',5,'G','STANDARD','ACTIVE'),(506,0,6,'G6',6,'G','STANDARD','ACTIVE'),(507,30000,6,'G7',7,'G','COUPLE','ACTIVE'),(508,30000,6,'G8',8,'G','COUPLE','ACTIVE'),(509,0,6,'G9',9,'G','STANDARD','ACTIVE'),(510,0,6,'G10',10,'G','STANDARD','ACTIVE'),(511,20000,7,'A1',1,'A','VIP','ACTIVE'),(512,20000,7,'A2',2,'A','VIP','ACTIVE'),(513,20000,7,'A3',3,'A','VIP','ACTIVE'),(514,20000,7,'A4',4,'A','VIP','ACTIVE'),(515,20000,7,'A5',5,'A','VIP','ACTIVE'),(516,20000,7,'A6',6,'A','VIP','ACTIVE'),(517,20000,7,'A7',7,'A','VIP','ACTIVE'),(518,20000,7,'A8',8,'A','VIP','ACTIVE'),(519,20000,7,'A9',9,'A','VIP','ACTIVE'),(520,20000,7,'A10',10,'A','VIP','ACTIVE'),(521,20000,7,'B1',1,'B','VIP','ACTIVE'),(522,20000,7,'B2',2,'B','VIP','ACTIVE'),(523,20000,7,'B3',3,'B','VIP','ACTIVE'),(524,20000,7,'B4',4,'B','VIP','ACTIVE'),(525,20000,7,'B5',5,'B','VIP','ACTIVE'),(526,20000,7,'B6',6,'B','VIP','ACTIVE'),(527,20000,7,'B7',7,'B','VIP','ACTIVE'),(528,20000,7,'B8',8,'B','VIP','ACTIVE'),(529,20000,7,'B9',9,'B','VIP','ACTIVE'),(530,20000,7,'B10',10,'B','VIP','ACTIVE'),(531,0,7,'C1',1,'C','STANDARD','ACTIVE'),(532,0,7,'C2',2,'C','STANDARD','ACTIVE'),(533,0,7,'C3',3,'C','STANDARD','ACTIVE'),(534,0,7,'C4',4,'C','STANDARD','ACTIVE'),(535,0,7,'C5',5,'C','STANDARD','ACTIVE'),(536,0,7,'C6',6,'C','STANDARD','ACTIVE'),(537,0,7,'C7',7,'C','STANDARD','ACTIVE'),(538,0,7,'C8',8,'C','STANDARD','ACTIVE'),(539,0,7,'C9',9,'C','STANDARD','ACTIVE'),(540,0,7,'C10',10,'C','STANDARD','ACTIVE'),(541,0,7,'D1',1,'D','STANDARD','ACTIVE'),(542,0,7,'D2',2,'D','STANDARD','ACTIVE'),(543,0,7,'D3',3,'D','STANDARD','ACTIVE'),(544,0,7,'D4',4,'D','STANDARD','ACTIVE'),(545,0,7,'D5',5,'D','STANDARD','ACTIVE'),(546,0,7,'D6',6,'D','STANDARD','ACTIVE'),(547,0,7,'D7',7,'D','STANDARD','ACTIVE'),(548,0,7,'D8',8,'D','STANDARD','ACTIVE'),(549,0,7,'D9',9,'D','STANDARD','ACTIVE'),(550,0,7,'D10',10,'D','STANDARD','ACTIVE'),(551,0,7,'E1',1,'E','STANDARD','ACTIVE'),(552,0,7,'E2',2,'E','STANDARD','ACTIVE'),(553,0,7,'E3',3,'E','STANDARD','ACTIVE'),(554,0,7,'E4',4,'E','STANDARD','ACTIVE'),(555,0,7,'E5',5,'E','STANDARD','ACTIVE'),(556,0,7,'E6',6,'E','STANDARD','ACTIVE'),(557,0,7,'E7',7,'E','STANDARD','ACTIVE'),(558,0,7,'E8',8,'E','STANDARD','ACTIVE'),(559,0,7,'E9',9,'E','STANDARD','ACTIVE'),(560,0,7,'E10',10,'E','STANDARD','ACTIVE'),(561,0,7,'F1',1,'F','STANDARD','ACTIVE'),(562,0,7,'F2',2,'F','STANDARD','ACTIVE'),(563,0,7,'F3',3,'F','STANDARD','ACTIVE'),(564,0,7,'F4',4,'F','STANDARD','ACTIVE'),(565,0,7,'F5',5,'F','STANDARD','ACTIVE'),(566,0,7,'F6',6,'F','STANDARD','ACTIVE'),(567,0,7,'F7',7,'F','STANDARD','ACTIVE'),(568,0,7,'F8',8,'F','STANDARD','ACTIVE'),(569,0,7,'F9',9,'F','STANDARD','ACTIVE'),(570,0,7,'F10',10,'F','STANDARD','ACTIVE'),(571,0,7,'G1',1,'G','STANDARD','ACTIVE'),(572,0,7,'G2',2,'G','STANDARD','ACTIVE'),(573,0,7,'G3',3,'G','STANDARD','ACTIVE'),(574,0,7,'G4',4,'G','STANDARD','ACTIVE'),(575,0,7,'G5',5,'G','STANDARD','ACTIVE'),(576,0,7,'G6',6,'G','STANDARD','ACTIVE'),(577,0,7,'G7',7,'G','STANDARD','ACTIVE'),(578,0,7,'G8',8,'G','STANDARD','ACTIVE'),(579,0,7,'G9',9,'G','STANDARD','ACTIVE'),(580,0,7,'G10',10,'G','STANDARD','ACTIVE'),(581,0,7,'H1',1,'H','STANDARD','ACTIVE'),(582,0,7,'H2',2,'H','STANDARD','ACTIVE'),(583,0,7,'H3',3,'H','STANDARD','ACTIVE'),(584,0,7,'H4',4,'H','STANDARD','ACTIVE'),(585,0,7,'H5',5,'H','STANDARD','ACTIVE'),(586,0,7,'H6',6,'H','STANDARD','ACTIVE'),(587,0,7,'H7',7,'H','STANDARD','ACTIVE'),(588,0,7,'H8',8,'H','STANDARD','ACTIVE'),(589,0,7,'H9',9,'H','STANDARD','ACTIVE'),(590,0,7,'H10',10,'H','STANDARD','ACTIVE'),(591,0,7,'I1',1,'I','STANDARD','ACTIVE'),(592,0,7,'I2',2,'I','STANDARD','ACTIVE'),(593,0,7,'I3',3,'I','STANDARD','ACTIVE'),(594,0,7,'I4',4,'I','STANDARD','ACTIVE'),(595,0,7,'I5',5,'I','STANDARD','ACTIVE'),(596,0,7,'I6',6,'I','STANDARD','ACTIVE'),(597,0,7,'I7',7,'I','STANDARD','ACTIVE'),(598,0,7,'I8',8,'I','STANDARD','ACTIVE'),(599,0,7,'I9',9,'I','STANDARD','ACTIVE'),(600,0,7,'I10',10,'I','STANDARD','ACTIVE'),(601,0,7,'J1',1,'J','STANDARD','ACTIVE'),(602,0,7,'J2',2,'J','STANDARD','ACTIVE'),(603,30000,7,'J3',3,'J','COUPLE','ACTIVE'),(604,30000,7,'J4',4,'J','COUPLE','ACTIVE'),(605,0,7,'J5',5,'J','STANDARD','ACTIVE'),(606,0,7,'J6',6,'J','STANDARD','ACTIVE'),(607,30000,7,'J7',7,'J','COUPLE','ACTIVE'),(608,30000,7,'J8',8,'J','COUPLE','ACTIVE'),(609,0,7,'J9',9,'J','STANDARD','ACTIVE'),(610,0,7,'J10',10,'J','STANDARD','ACTIVE');
/*!40000 ALTER TABLE `seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `showtimes`
--

DROP TABLE IF EXISTS `showtimes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `showtimes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `audio_language` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `format_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `movie_id` bigint NOT NULL,
  `movie_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` bigint NOT NULL,
  `show_date` date NOT NULL,
  `start_time` time(6) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle_language` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `theater_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showtimes`
--

LOCK TABLES `showtimes` WRITE;
/*!40000 ALTER TABLE `showtimes` DISABLE KEYS */;
INSERT INTO `showtimes` VALUES (1,'Tiếng Việt','2026-07-13 18:56:59.538328','11:36:00.000000','2D',1,'Inside Out 2',1,'2026-07-14','10:00:00.000000','ONLINE','Phụ đề Việt',1),(2,'Tiếng Việt','2026-07-13 18:56:59.538328','15:51:00.000000','3D',2,'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô',2,'2026-07-14','14:00:00.000000','ONLINE','Phụ đề Việt',1),(3,'Tiếng Việt','2026-07-13 18:56:59.538328','22:16:00.000000','IMAX',3,'Dune: Hành Tinh Cát - Phần Hai',3,'2026-07-14','19:30:00.000000','ONLINE','Phụ đề Việt',1),(4,'Tiếng Việt','2026-07-13 18:56:59.538328','11:06:00.000000','2D',1,'Inside Out 2',4,'2026-07-15','09:30:00.000000','ONLINE','Phụ đề Việt',2),(5,'Tiếng Việt','2026-07-13 18:56:59.538328','18:36:00.000000','3D',2,'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô',5,'2026-07-15','16:45:00.000000','ONLINE','Phụ đề Việt',2),(6,'Tiếng Việt','2026-07-13 18:56:59.538328','23:01:00.000000','2D',3,'Dune: Hành Tinh Cát - Phần Hai',6,'2026-07-16','20:15:00.000000','ONLINE','Phụ đề Việt',3),(8,'Việt','2026-07-13 19:07:00.040611','21:52:00.000000','2D',3,'Dune: Hành Tinh Cát - Phần Hai',4,'2026-07-13','19:06:00.000000','ONLINE','Tiếng Việt',2);
/*!40000 ALTER TABLE `showtimes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `theaters`
--

DROP TABLE IF EXISTS `theaters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theaters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_count` int DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theaters`
--

LOCK TABLES `theaters` WRITE;
/*!40000 ALTER TABLE `theaters` DISABLE KEYS */;
INSERT INTO `theaters` VALUES (1,'Demo Address 01','Hồ Chí Minh','Tầng 3 trung tâm thương mại','CGV Cao Lỗ',8,'ONLINE'),(2,'Demo Address 02','Hồ Chí Minh','Khu B tầng 2','Galaxy Nguyễn Trãi',6,'ONLINE'),(3,'Demo Address 03','Hồ Chí Minh','Tầng 5 khu giải trí','Lotte Thủ Đức',7,'ONLINE');
/*!40000 ALTER TABLE `theaters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'showtime_db'
--

--
-- Dumping routines for database 'showtime_db'
--

--
-- Current Database: `booking_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `booking_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `booking_db`;

--
-- Table structure for table `booking_foods`
--

DROP TABLE IF EXISTS `booking_foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_foods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `food_id` bigint DEFAULT NULL,
  `food_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `total_price` decimal(38,2) DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKofhk813sbay8or90gohmg8qd9` (`booking_id`),
  CONSTRAINT `FKofhk813sbay8or90gohmg8qd9` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_foods`
--

LOCK TABLES `booking_foods` WRITE;
/*!40000 ALTER TABLE `booking_foods` DISABLE KEYS */;
INSERT INTO `booking_foods` VALUES (1,6,'Combo Couple',1,119000.00,119000.00,1),(2,3,'Bắp rang phô mai L',1,65000.00,65000.00,2),(3,4,'Coca Cola M',1,30000.00,30000.00,4);
/*!40000 ALTER TABLE `booking_foods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_seats`
--

DROP TABLE IF EXISTS `booking_seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_seats` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `price` decimal(38,2) DEFAULT NULL,
  `seat_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seat_id` bigint DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `seat_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmbi9ciapn0nvat63t0a8tv478` (`booking_id`),
  CONSTRAINT `FKmbi9ciapn0nvat63t0a8tv478` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_seats`
--

LOCK TABLES `booking_seats` WRITE;
/*!40000 ALTER TABLE `booking_seats` DISABLE KEYS */;
INSERT INTO `booking_seats` VALUES (1,90000.00,'A1',1,1,'STANDARD'),(2,90000.00,'A2',2,1,'STANDARD'),(3,105000.00,'A1',81,2,'STANDARD'),(4,105000.00,'A2',82,2,'STANDARD'),(5,160000.00,'A1',181,3,'VIP'),(6,160000.00,'A2',182,3,'VIP'),(7,75000.00,'B5',21,4,'STANDARD'),(8,75000.00,'B6',22,4,'STANDARD');
/*!40000 ALTER TABLE `booking_seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `showtime_id` bigint DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `booking_code` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_amount` decimal(38,2) DEFAULT NULL,
  `expired_at` datetime(6) DEFAULT NULL,
  `food_amount` decimal(38,2) DEFAULT NULL,
  `movie_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `show_date` date DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `theater_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ticket_amount` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKq97166k18hklq6ls46osbrftx` (`booking_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'2026-07-11 18:56:59.579561',1,'PAID',279000.00,2,'BK20260711193001',NULL,'customer01@example.invalid','Demo Customer 01',NULL,20000.00,'2026-07-11 19:45:00.000000',119000.00,'Inside Out 2','2026-07-11 19:35:00.000000','Phòng 1','2026-07-15','19:30:00.000000','CGV Cao Lỗ',180000.00),(2,'2026-07-12 18:56:59.579561',2,'PAID',275000.00,3,'BK20260712200002',NULL,'customer02@example.invalid','Demo Customer 02',NULL,0.00,'2026-07-12 20:15:00.000000',65000.00,'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô','2026-07-12 20:05:00.000000','Phòng 2','2026-07-16','20:00:00.000000','Galaxy Nguyễn Trãi',210000.00),(3,'2026-07-13 18:56:59.579561',3,'PENDING',320000.00,8,'BK20260713213003',NULL,'customer03@example.invalid','Demo Customer 03',NULL,0.00,'2026-07-13 21:45:00.000000',0.00,'Dune: Hành Tinh Cát - Phần Hai',NULL,'Phòng IMAX','2026-07-17','21:30:00.000000','Lotte Thủ Đức',320000.00),(4,'2026-07-14 18:01:00.000000',4,'CANCELLED',180000.00,9,'BK20260714183004','2026-07-14 18:08:00.000000','customer04@example.invalid','Demo Customer 04',NULL,0.00,'2026-07-14 18:16:00.000000',30000.00,'Godzilla x Kong: Đế Chế Mới',NULL,'Phòng 3','2026-07-18','18:30:00.000000','CGV Cao Lỗ',150000.00);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `foods`
--

DROP TABLE IF EXISTS `foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost_price` decimal(12,2) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `low_stock_threshold` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock_quantity` int NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKopswcerimahpeultr39dhse5x` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foods`
--

LOCK TABLES `foods` WRITE;
/*!40000 ALTER TABLE `foods` DISABLE KEYS */;
INSERT INTO `foods` VALUES (2,'POPCORN',22000.00,'2026-07-13 18:31:44.783090','Bắp rang bơ caramel size vừa',10,NULL,15,'Bắp rang caramel M',45000.00,'M','POP-CARAMEL-M','ACTIVE',100,'2026-07-13 18:31:44.783090'),(3,'POPCORN',32000.00,'2026-07-13 18:31:44.921755','Bắp rang phô mai size lớn',20,NULL,15,'Bắp rang phô mai L',65000.00,'L','POP-CHEESE-L','ACTIVE',80,'2026-07-13 18:31:44.921755'),(4,'DRINK',12000.00,'2026-07-13 18:31:44.999756','Nước ngọt Coca Cola size vừa',30,NULL,20,'Coca Cola M',30000.00,'M','DRK-COKE-M','ACTIVE',120,'2026-07-13 18:31:44.999756'),(5,'DRINK',16000.00,'2026-07-13 18:31:45.089601','Nước ngọt Coca Cola size lớn',40,NULL,20,'Coca Cola L',40000.00,'L','DRK-COKE-L','ACTIVE',90,'2026-07-13 18:31:45.089601'),(6,'COMBO',60000.00,'2026-07-13 18:31:45.153916','1 bắp lớn và 2 nước size vừa',50,NULL,10,'Combo Couple',119000.00,'NONE','COMBO-COUPLE','ACTIVE',50,'2026-07-13 18:31:45.153916'),(7,'COMBO',115000.00,'2026-07-13 18:31:45.190502','2 bắp lớn và 4 nước size vừa',60,NULL,8,'Combo Family',219000.00,'NONE','COMBO-FAMILY','ACTIVE',30,'2026-07-13 18:31:45.190502'),(8,'COMBO',72000.00,'2026-07-13 20:12:00.000000','1 bắp caramel size M và 1 Coca Cola size M',70,NULL,8,'Combo Solo',99000.00,'NONE','COMBO-SOLO','ACTIVE',65,'2026-07-13 20:12:00.000000'),(9,'COMBO',135000.00,'2026-07-13 20:12:00.000000','1 bắp phô mai size L, 2 Coca Cola size L và 1 snack',80,NULL,6,'Combo Premium',249000.00,'NONE','COMBO-PREMIUM','ACTIVE',24,'2026-07-13 20:12:00.000000');
/*!40000 ALTER TABLE `foods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_code` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8inpv30544qjykcwa6ck7pusy` (`transaction_code`),
  KEY `FKc52o2b1jkxttngufqp3t7jr3h` (`booking_id`),
  CONSTRAINT `FKc52o2b1jkxttngufqp3t7jr3h` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,279000.00,'2026-07-11 19:35:00.000000','2026-07-11 19:35:00.000000','MOMO','SUCCESS','PAY20260711193501',1),(2,275000.00,'2026-07-12 20:05:00.000000','2026-07-12 20:05:00.000000','BANKING','SUCCESS','PAY20260712200502',2);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `end_date` date NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_discount_amount` decimal(12,2) DEFAULT NULL,
  `min_order_amount` decimal(12,2) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjdho73ymbyu46p2hh562dk4kk` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'WELCOME10','2026-07-13 19:03:11.884874','Giảm 10% cho lần đặt vé đầu tiên.','PERCENT',10.00,'2026-10-11','https://placehold.co/640x320/2563eb/ffffff?text=WELCOME+10',50000.00,100000.00,'Chào thành viên mới','2026-07-13','ONLINE','2026-07-13 19:03:11.884874',1000,0),(2,'HAPPY50K','2026-07-13 19:03:11.884874','Giảm trực tiếp 50.000đ cho đơn đủ điều kiện.','FIXED',50000.00,'2026-09-11','https://placehold.co/640x320/0891b2/ffffff?text=HAPPY+50K',NULL,200000.00,'Happy Day giảm 50.000đ','2026-07-13','ONLINE','2026-07-13 19:03:11.884874',500,0),(3,'MEMBER20','2026-07-13 19:03:11.884874','Giảm 20% dành cho thành viên thân thiết.','PERCENT',20.00,'2026-11-10','https://placehold.co/640x320/7c3aed/ffffff?text=MEMBER+20',80000.00,150000.00,'Ưu đãi thành viên 20%','2026-07-13','ONLINE','2026-07-13 19:03:11.884874',300,0);
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_pricing`
--

DROP TABLE IF EXISTS `ticket_pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_pricing` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adult_price` double DEFAULT NULL,
  `child_senior_price` double DEFAULT NULL,
  `day_group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_online_price` double DEFAULT NULL,
  `student_price` double DEFAULT NULL,
  `time_slot` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_pricing`
--

LOCK TABLES `ticket_pricing` WRITE;
/*!40000 ALTER TABLE `ticket_pricing` DISABLE KEYS */;
INSERT INTO `ticket_pricing` VALUES (1,75000,50000,'MON_THU',70000,55000,'BEFORE_17H'),(2,90000,60000,'MON_THU',85000,65000,'AFTER_17H'),(3,95000,65000,'FRI_SUN',90000,70000,'BEFORE_17H'),(4,115000,75000,'FRI_SUN',105000,80000,'AFTER_17H'),(5,130000,85000,'HOLIDAY',120000,90000,'ALL_DAY');
/*!40000 ALTER TABLE `ticket_pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_surcharges`
--

DROP TABLE IF EXISTS `ticket_surcharges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_surcharges` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double DEFAULT NULL,
  `surcharge_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surcharge_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK76w3yxug0pfjd9pefrc34ctwa` (`surcharge_key`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_surcharges`
--

LOCK TABLES `ticket_surcharges` WRITE;
/*!40000 ALTER TABLE `ticket_surcharges` DISABLE KEYS */;
INSERT INTO `ticket_surcharges` VALUES (1,15000,'ROOM_3D','Phụ thu phòng chiếu 3D'),(2,30000,'ROOM_IMAX','Phụ thu phòng chiếu IMAX'),(3,45000,'ROOM_4DX','Phụ thu phòng chiếu 4DX'),(4,20000,'SEAT_VIP','Phụ thu ghế VIP'),(5,30000,'SEAT_COUPLE','Phụ thu ghế đôi'),(6,10000,'WEEKEND','Phụ thu cuối tuần'),(7,20000,'HOLIDAY','Phụ thu ngày lễ'),(8,5000,'LATE_NIGHT','Phụ thu suất khuya');
/*!40000 ALTER TABLE `ticket_surcharges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `issued_at` datetime(6) DEFAULT NULL,
  `qr_code` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ticket_code` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcvl4jbu5fln08ltem9rrmtp8w` (`ticket_code`),
  UNIQUE KEY `UKlwytoi4sx2v20kyuj6bvqto1y` (`booking_id`),
  CONSTRAINT `FKefja4avuu7g29t78mxifrsynb` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'2026-07-11 19:35:00.000000','QR-BK20260711193001','VALID','TK202607111935011',NULL,1),(2,'2026-07-12 20:05:00.000000','QR-BK20260712200002','USED','TK202607122005022','2026-07-16 19:48:00.000000',2);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'booking_db'
--

--
-- Dumping routines for database 'booking_db'
--

--
-- Current Database: `user_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `user_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `user_db`;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-07-13 18:33:41.244874','admin@example.invalid','Demo Admin','demo_password_change_me',NULL,'ADMIN'),(2,'2026-07-13 18:54:32.000000','staff01@example.invalid','Demo Staff 01','demo_password_change_me',NULL,'STAFF'),(3,'2026-07-13 18:54:32.000000','staff02@example.invalid','Demo Staff 02','demo_password_change_me',NULL,'STAFF'),(4,'2026-07-13 18:54:32.000000','staff03@example.invalid','Demo Staff 03','demo_password_change_me',NULL,'STAFF'),(5,'2026-07-13 18:54:32.000000','manager@example.invalid','Demo Manager','demo_password_change_me',NULL,'ADMIN'),(6,'2026-07-13 18:54:32.000000','customer01@example.invalid','Demo Customer 01','demo_password_change_me',NULL,'CUSTOMER'),(7,'2026-07-13 18:54:32.000000','customer02@example.invalid','Demo Customer 02','demo_password_change_me',NULL,'CUSTOMER'),(8,'2026-07-13 19:26:00.000000','customer03@example.invalid','Demo Customer 03','demo_password_change_me',NULL,'CUSTOMER'),(9,'2026-07-13 19:26:00.000000','customer04@example.invalid','Demo Customer 04','demo_password_change_me',NULL,'CUSTOMER'),(10,'2026-07-13 19:26:00.000000','customer05@example.invalid','Demo Customer 05','demo_password_change_me',NULL,'CUSTOMER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'user_db'
--

--
-- Dumping routines for database 'user_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-13 19:46:34






