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

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `movie_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `movie_db`;

--
-- Table structure for table `advertisements`
--

DROP TABLE IF EXISTS `advertisements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advertisements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` text,
  `display_order` int NOT NULL,
  `end_date` date NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `placement` varchar(40) NOT NULL,
  `start_date` date NOT NULL,
  `status` varchar(20) NOT NULL,
  `target_url` varchar(500) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmqrfy4gb41pjlaiwmviv05wcj` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advertisements`
--

LOCK TABLES `advertisements` WRITE;
/*!40000 ALTER TABLE `advertisements` DISABLE KEYS */;
/*!40000 ALTER TABLE `advertisements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `content` text,
  `apply_condition` text,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ONLINE',
  `staff_name` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Happy Day - Thứ Ba vui vẻ','/uploads/events/c9365f24-8add-4d70-b69a-2a645261f68c.png','Vào thứ Ba hàng tuần, khách hàng được mua vé với mức giá ưu đãi.','Áp dụng mỗi thứ Ba tại tất cả cụm rạp.','2026-07-02','2026-09-30','ONLINE','Admin Cinema','2026-07-02 15:13:03'),(2,'Ưu đãi thành viên Cinema','/uploads/events/3a8e32db-b71f-450a-a7ef-52e514f8a3f4.png','Tặng ưu đãi đặc biệt dành cho khách hàng thành viên.','Áp dụng cho tài khoản thành viên hợp lệ.','2026-07-02','2026-12-29','ONLINE','Admin Cinema','2026-07-02 15:13:03'),(3,'Giảm 10% khi thanh toán online','/uploads/events/cc5f0a52-39f5-48c2-bf46-2fd3c2a4995a.png','Khách hàng được giảm 10% khi thanh toán bằng ngân hàng liên kết.','Áp dụng cho giao dịch online đủ điều kiện.','2026-07-02','2026-08-31','ONLINE','Admin Cinema','2026-07-02 15:13:03');
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
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genres`
--

LOCK TABLES `genres` WRITE;
/*!40000 ALTER TABLE `genres` DISABLE KEYS */;
INSERT INTO `genres` VALUES (11,'Hành động','Phim hành động với nhịp phim nhanh, nhiều cảnh rượt đuổi và chiến đấu.',1),(12,'Hoạt hình','Phim hoạt hình dành cho gia đình, thiếu nhi và khán giả trẻ.',1),(13,'Tâm lý','Phim tâm lý tập trung vào câu chuyện, cảm xúc và hành trình nhân vật.',1),(14,'Hài','Phim hài, giải trí nhẹ nhàng, phù hợp xem cùng bạn bè và gia đình.',1),(15,'Kinh dị','Phim kinh dị tạo cảm giác hồi hộp, căng thẳng và bất ngờ.',1),(16,'Tình cảm','Phim tình cảm, lãng mạn, khai thác các mối quan hệ và cảm xúc.',1),(17,'Khoa học viễn tưởng','Phim khoa học viễn tưởng về công nghệ, tương lai và những thế giới mới.',1),(18,'Giả tưởng','Phim giả tưởng với phép thuật, truyền thuyết và thế giới hư cấu.',1),(19,'Giật gân','Phim giật gân, điều tra, bí ẩn và nhiều nút thắt.',1),(20,'Phiêu lưu','Phim phiêu lưu với hành trình khám phá và thử thách.',1),(21,'Gia đình','Phim gia đình có nội dung tích cực, dễ xem cho nhiều lứa tuổi.',1),(22,'Bí ẩn','Phim bí ẩn xoay quanh điều tra, manh mối và lời giải cuối cùng.',1);
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
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `genre` varchar(255) DEFAULT NULL,
  `age_rating` varchar(255) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `director` varchar(255) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (1,'Avengers: Endgame','Sau cú búng tay của Thanos, những siêu anh hùng còn lại tập hợp cho nhiệm vụ cuối cùng để khôi phục vũ trụ.','Hành động','C13',181,'Anthony Russo, Joe Russo','2026-06-01','https://m.media-amazon.com/images/I/81ExhpBEbHL._AC_UF894,1000_QL80_.jpg','https://www.youtube.com/watch?v=TcMBFSGVi1c','NOW_SHOWING','2026-07-02 13:33:01'),(2,'Doraemon Movie','Doraemon và Nobita bước vào chuyến phiêu lưu ấm áp, vui nhộn, phù hợp cho gia đình và trẻ em.','Hoạt hình','P',110,'Fujiko F. Fujio','2026-06-10','http://localhost:8081/uploads/movies/e96e5bac-c849-4de5-ad37-96f50ad69c25.jfif','https://www.youtube.com/watch?v=ksjC9cDCmWs','NOW_SHOWING','2026-07-02 13:33:01'),(3,'Lật Mặt 8','Một câu chuyện Việt Nam giàu cảm xúc, kết hợp yếu tố gia đình, hành động và những lựa chọn khó khăn.','Tâm lý','C16',120,'Ly Hai','2026-08-05','http://localhost:8081/uploads/movies/637e3fea-f1ad-4819-ae78-6f1b7840a04a.jfif','','COMING_SOON','2026-07-02 13:33:01'),(4,'Inside Out 2','Riley bước vào tuổi mới lớn, nơi những cảm xúc quen thuộc phải học cách làm việc cùng các cảm xúc hoàn toàn mới.','Hoạt hình','P',96,'Kelsey Mann','2026-06-05','https://m.media-amazon.com/images/M/MV5BYWY3MDE2Y2UtOTE3Zi00MGUzLTg2MTItZjE1ZWVkMGVlODRmXkEyXkFqcGc@._V1_.jpg','https://www.youtube.com/watch?v=LEjhY15eCx0','NOW_SHOWING','2026-07-02 15:04:14'),(5,'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô','Conan đối đầu một vụ án quy mô lớn với những manh mối phức tạp, các cuộc truy đuổi nghẹt thở và bí mật về một thanh kiếm cổ.','Bí ẩn','C13',111,'Chika Nagaoka','2026-08-12','https://m.media-amazon.com/images/M/MV5BNmQ1ZTAwNzUtYmE0YS00NGIxLWJkOTYtZWRhMGYxMzBjNjNjXkEyXkFqcGc@._V1_.jpg','https://www.youtube.com/watch?v=','COMING_SOON','2026-07-02 15:04:14'),(6,'Dune: Hành Tinh Cát - Phần Hai','Paul Atreides tiếp tục hành trình trên Arrakis trong cuộc chiến khốc liệt về quyền lực, định mệnh và lòng trung thành.','Khoa học viễn tưởng','C16',166,'Denis Villeneuve','2026-09-01','https://m.media-amazon.com/images/M/MV5BZjA2NGY2NTYtODliZS00NDk2LWE1MzMtNTVlOTQ2YjI5Y2Y4XkEyXkFqcGc@._V1_.jpg','https://www.youtube.com/watch?v=Way9Dexny3w','ADVANCE_BOOKING','2026-07-02 15:04:14');
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
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `content` longtext,
  `status` varchar(20) NOT NULL DEFAULT 'ONLINE',
  `staff_name` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'Hộp bắp sinh nhật dành cho thành viên','https://placehold.co/640x420/fff7ed/e11d48?text=HAPPY+BIRTHDAY+COMBO','<h3>Quà sinh nhật dành cho thành viên</h3><p>Khách hàng thành viên được nhận ưu đãi đặc biệt trong tháng sinh nhật.</p><ul><li>01 combo bắp và nước ưu đãi</li><li>Áp dụng theo điều kiện chương trình</li></ul>','ONLINE','Admin Cinema','2026-07-02 15:33:08','2026-07-02 15:33:08'),(2,'Doraemon hóa phi công trong chuyến phiêu lưu mới','https://placehold.co/640x360/38bdf8/ffffff?text=DORAEMON+NEWS','<h3>Doraemon trở lại màn ảnh rộng</h3><p>Cùng Nobita và những người bạn khám phá chuyến phiêu lưu hoàn toàn mới.</p>','ONLINE','Admin Cinema','2026-07-02 15:33:08','2026-07-02 15:33:08');
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

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `showtime_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `showtime_db`;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `theater_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `seat_count` int DEFAULT NULL,
  `row_count` int DEFAULT NULL,
  `column_count` int DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rooms_theater_name` (`theater_id`,`name`),
  CONSTRAINT `fk_rooms_theater` FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'Phòng 1',80,8,10,'2D','ACTIVE'),(2,1,'Phòng 2',100,10,10,'3D','ACTIVE'),(3,1,'Phòng VIP',50,5,10,'IMAX','ACTIVE'),(4,2,'Phòng 1',90,9,10,'2D','ACTIVE'),(5,2,'Phòng 2',120,10,12,'3D','ACTIVE'),(6,3,'Phòng 1',70,7,10,'2D','ACTIVE'),(7,4,'Phòng 1',100,10,10,'2D','ACTIVE');
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
  `room_id` bigint NOT NULL,
  `seat_code` varchar(20) NOT NULL,
  `seat_row` varchar(10) DEFAULT NULL,
  `seat_number` int DEFAULT NULL,
  `seat_type` varchar(30) DEFAULT NULL,
  `extra_price` double DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_seats_room_code` (`room_id`,`seat_code`),
  CONSTRAINT `fk_seats_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=611 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1,1,'A1','A',1,'VIP',20000,'ACTIVE'),(2,1,'A2','A',2,'VIP',20000,'ACTIVE'),(3,1,'A3','A',3,'VIP',20000,'ACTIVE'),(4,1,'A4','A',4,'VIP',20000,'ACTIVE'),(5,1,'A5','A',5,'VIP',20000,'ACTIVE'),(6,1,'A6','A',6,'VIP',20000,'ACTIVE'),(7,1,'A7','A',7,'VIP',20000,'ACTIVE'),(8,1,'A8','A',8,'VIP',20000,'ACTIVE'),(9,1,'A9','A',9,'VIP',20000,'ACTIVE'),(10,1,'A10','A',10,'VIP',20000,'ACTIVE'),(11,1,'B1','B',1,'VIP',20000,'ACTIVE'),(12,1,'B2','B',2,'VIP',20000,'ACTIVE'),(13,1,'B3','B',3,'VIP',20000,'ACTIVE'),(14,1,'B4','B',4,'VIP',20000,'ACTIVE'),(15,1,'B5','B',5,'VIP',20000,'ACTIVE'),(16,1,'B6','B',6,'VIP',20000,'ACTIVE'),(17,1,'B7','B',7,'VIP',20000,'ACTIVE'),(18,1,'B8','B',8,'VIP',20000,'ACTIVE'),(19,1,'B9','B',9,'VIP',20000,'ACTIVE'),(20,1,'B10','B',10,'VIP',20000,'ACTIVE'),(21,1,'C1','C',1,'STANDARD',0,'ACTIVE'),(22,1,'C2','C',2,'STANDARD',0,'ACTIVE'),(23,1,'C3','C',3,'STANDARD',0,'ACTIVE'),(24,1,'C4','C',4,'STANDARD',0,'ACTIVE'),(25,1,'C5','C',5,'STANDARD',0,'ACTIVE'),(26,1,'C6','C',6,'STANDARD',0,'ACTIVE'),(27,1,'C7','C',7,'STANDARD',0,'ACTIVE'),(28,1,'C8','C',8,'STANDARD',0,'ACTIVE'),(29,1,'C9','C',9,'STANDARD',0,'ACTIVE'),(30,1,'C10','C',10,'STANDARD',0,'ACTIVE'),(31,1,'D1','D',1,'STANDARD',0,'ACTIVE'),(32,1,'D2','D',2,'STANDARD',0,'ACTIVE'),(33,1,'D3','D',3,'STANDARD',0,'ACTIVE'),(34,1,'D4','D',4,'STANDARD',0,'ACTIVE'),(35,1,'D5','D',5,'STANDARD',0,'ACTIVE'),(36,1,'D6','D',6,'STANDARD',0,'ACTIVE'),(37,1,'D7','D',7,'STANDARD',0,'ACTIVE'),(38,1,'D8','D',8,'STANDARD',0,'ACTIVE'),(39,1,'D9','D',9,'STANDARD',0,'ACTIVE'),(40,1,'D10','D',10,'STANDARD',0,'ACTIVE'),(41,1,'E1','E',1,'STANDARD',0,'ACTIVE'),(42,1,'E2','E',2,'STANDARD',0,'ACTIVE'),(43,1,'E3','E',3,'STANDARD',0,'ACTIVE'),(44,1,'E4','E',4,'STANDARD',0,'ACTIVE'),(45,1,'E5','E',5,'STANDARD',0,'ACTIVE'),(46,1,'E6','E',6,'STANDARD',0,'ACTIVE'),(47,1,'E7','E',7,'STANDARD',0,'ACTIVE'),(48,1,'E8','E',8,'STANDARD',0,'ACTIVE'),(49,1,'E9','E',9,'STANDARD',0,'ACTIVE'),(50,1,'E10','E',10,'STANDARD',0,'ACTIVE'),(51,1,'F1','F',1,'STANDARD',0,'ACTIVE'),(52,1,'F2','F',2,'STANDARD',0,'ACTIVE'),(53,1,'F3','F',3,'STANDARD',0,'ACTIVE'),(54,1,'F4','F',4,'STANDARD',0,'ACTIVE'),(55,1,'F5','F',5,'STANDARD',0,'ACTIVE'),(56,1,'F6','F',6,'STANDARD',0,'ACTIVE'),(57,1,'F7','F',7,'STANDARD',0,'ACTIVE'),(58,1,'F8','F',8,'STANDARD',0,'ACTIVE'),(59,1,'F9','F',9,'STANDARD',0,'ACTIVE'),(60,1,'F10','F',10,'STANDARD',0,'ACTIVE'),(61,1,'G1','G',1,'STANDARD',0,'ACTIVE'),(62,1,'G2','G',2,'STANDARD',0,'ACTIVE'),(63,1,'G3','G',3,'STANDARD',0,'ACTIVE'),(64,1,'G4','G',4,'STANDARD',0,'ACTIVE'),(65,1,'G5','G',5,'STANDARD',0,'ACTIVE'),(66,1,'G6','G',6,'STANDARD',0,'ACTIVE'),(67,1,'G7','G',7,'STANDARD',0,'ACTIVE'),(68,1,'G8','G',8,'STANDARD',0,'ACTIVE'),(69,1,'G9','G',9,'STANDARD',0,'ACTIVE'),(70,1,'G10','G',10,'STANDARD',0,'ACTIVE'),(71,1,'H1','H',1,'STANDARD',0,'ACTIVE'),(72,1,'H2','H',2,'STANDARD',0,'ACTIVE'),(73,1,'H3','H',3,'COUPLE',30000,'ACTIVE'),(74,1,'H4','H',4,'COUPLE',30000,'ACTIVE'),(75,1,'H5','H',5,'STANDARD',0,'ACTIVE'),(76,1,'H6','H',6,'STANDARD',0,'ACTIVE'),(77,1,'H7','H',7,'COUPLE',30000,'ACTIVE'),(78,1,'H8','H',8,'COUPLE',30000,'ACTIVE'),(79,1,'H9','H',9,'STANDARD',0,'ACTIVE'),(80,1,'H10','H',10,'STANDARD',0,'ACTIVE'),(81,2,'A1','A',1,'VIP',20000,'ACTIVE'),(82,2,'A2','A',2,'VIP',20000,'ACTIVE'),(83,2,'A3','A',3,'VIP',20000,'ACTIVE'),(84,2,'A4','A',4,'VIP',20000,'ACTIVE'),(85,2,'A5','A',5,'VIP',20000,'ACTIVE'),(86,2,'A6','A',6,'VIP',20000,'ACTIVE'),(87,2,'A7','A',7,'VIP',20000,'ACTIVE'),(88,2,'A8','A',8,'VIP',20000,'ACTIVE'),(89,2,'A9','A',9,'VIP',20000,'ACTIVE'),(90,2,'A10','A',10,'VIP',20000,'ACTIVE'),(91,2,'B1','B',1,'VIP',20000,'ACTIVE'),(92,2,'B2','B',2,'VIP',20000,'ACTIVE'),(93,2,'B3','B',3,'VIP',20000,'ACTIVE'),(94,2,'B4','B',4,'VIP',20000,'ACTIVE'),(95,2,'B5','B',5,'VIP',20000,'ACTIVE'),(96,2,'B6','B',6,'VIP',20000,'ACTIVE'),(97,2,'B7','B',7,'VIP',20000,'ACTIVE'),(98,2,'B8','B',8,'VIP',20000,'ACTIVE'),(99,2,'B9','B',9,'VIP',20000,'ACTIVE'),(100,2,'B10','B',10,'VIP',20000,'ACTIVE'),(101,2,'C1','C',1,'STANDARD',0,'ACTIVE'),(102,2,'C2','C',2,'STANDARD',0,'ACTIVE'),(103,2,'C3','C',3,'STANDARD',0,'ACTIVE'),(104,2,'C4','C',4,'STANDARD',0,'ACTIVE'),(105,2,'C5','C',5,'STANDARD',0,'ACTIVE'),(106,2,'C6','C',6,'STANDARD',0,'ACTIVE'),(107,2,'C7','C',7,'STANDARD',0,'ACTIVE'),(108,2,'C8','C',8,'STANDARD',0,'ACTIVE'),(109,2,'C9','C',9,'STANDARD',0,'ACTIVE'),(110,2,'C10','C',10,'STANDARD',0,'ACTIVE'),(111,2,'D1','D',1,'STANDARD',0,'ACTIVE'),(112,2,'D2','D',2,'STANDARD',0,'ACTIVE'),(113,2,'D3','D',3,'STANDARD',0,'ACTIVE'),(114,2,'D4','D',4,'STANDARD',0,'ACTIVE'),(115,2,'D5','D',5,'STANDARD',0,'ACTIVE'),(116,2,'D6','D',6,'STANDARD',0,'ACTIVE'),(117,2,'D7','D',7,'STANDARD',0,'ACTIVE'),(118,2,'D8','D',8,'STANDARD',0,'ACTIVE'),(119,2,'D9','D',9,'STANDARD',0,'ACTIVE'),(120,2,'D10','D',10,'STANDARD',0,'ACTIVE'),(121,2,'E1','E',1,'STANDARD',0,'ACTIVE'),(122,2,'E2','E',2,'STANDARD',0,'ACTIVE'),(123,2,'E3','E',3,'STANDARD',0,'ACTIVE'),(124,2,'E4','E',4,'STANDARD',0,'ACTIVE'),(125,2,'E5','E',5,'STANDARD',0,'ACTIVE'),(126,2,'E6','E',6,'STANDARD',0,'ACTIVE'),(127,2,'E7','E',7,'STANDARD',0,'ACTIVE'),(128,2,'E8','E',8,'STANDARD',0,'ACTIVE'),(129,2,'E9','E',9,'STANDARD',0,'ACTIVE'),(130,2,'E10','E',10,'STANDARD',0,'ACTIVE'),(131,2,'F1','F',1,'STANDARD',0,'ACTIVE'),(132,2,'F2','F',2,'STANDARD',0,'ACTIVE'),(133,2,'F3','F',3,'STANDARD',0,'ACTIVE'),(134,2,'F4','F',4,'STANDARD',0,'ACTIVE'),(135,2,'F5','F',5,'STANDARD',0,'ACTIVE'),(136,2,'F6','F',6,'STANDARD',0,'ACTIVE'),(137,2,'F7','F',7,'STANDARD',0,'ACTIVE'),(138,2,'F8','F',8,'STANDARD',0,'ACTIVE'),(139,2,'F9','F',9,'STANDARD',0,'ACTIVE'),(140,2,'F10','F',10,'STANDARD',0,'ACTIVE'),(141,2,'G1','G',1,'STANDARD',0,'ACTIVE'),(142,2,'G2','G',2,'STANDARD',0,'ACTIVE'),(143,2,'G3','G',3,'STANDARD',0,'ACTIVE'),(144,2,'G4','G',4,'STANDARD',0,'ACTIVE'),(145,2,'G5','G',5,'STANDARD',0,'ACTIVE'),(146,2,'G6','G',6,'STANDARD',0,'ACTIVE'),(147,2,'G7','G',7,'STANDARD',0,'ACTIVE'),(148,2,'G8','G',8,'STANDARD',0,'ACTIVE'),(149,2,'G9','G',9,'STANDARD',0,'ACTIVE'),(150,2,'G10','G',10,'STANDARD',0,'ACTIVE'),(151,2,'H1','H',1,'STANDARD',0,'ACTIVE'),(152,2,'H2','H',2,'STANDARD',0,'ACTIVE'),(153,2,'H3','H',3,'STANDARD',0,'ACTIVE'),(154,2,'H4','H',4,'STANDARD',0,'ACTIVE'),(155,2,'H5','H',5,'STANDARD',0,'ACTIVE'),(156,2,'H6','H',6,'STANDARD',0,'ACTIVE'),(157,2,'H7','H',7,'STANDARD',0,'ACTIVE'),(158,2,'H8','H',8,'STANDARD',0,'ACTIVE'),(159,2,'H9','H',9,'STANDARD',0,'ACTIVE'),(160,2,'H10','H',10,'STANDARD',0,'ACTIVE'),(161,2,'I1','I',1,'STANDARD',0,'ACTIVE'),(162,2,'I2','I',2,'STANDARD',0,'ACTIVE'),(163,2,'I3','I',3,'STANDARD',0,'ACTIVE'),(164,2,'I4','I',4,'STANDARD',0,'ACTIVE'),(165,2,'I5','I',5,'STANDARD',0,'ACTIVE'),(166,2,'I6','I',6,'STANDARD',0,'ACTIVE'),(167,2,'I7','I',7,'STANDARD',0,'ACTIVE'),(168,2,'I8','I',8,'STANDARD',0,'ACTIVE'),(169,2,'I9','I',9,'STANDARD',0,'ACTIVE'),(170,2,'I10','I',10,'STANDARD',0,'ACTIVE'),(171,2,'J1','J',1,'STANDARD',0,'ACTIVE'),(172,2,'J2','J',2,'STANDARD',0,'ACTIVE'),(173,2,'J3','J',3,'COUPLE',30000,'ACTIVE'),(174,2,'J4','J',4,'COUPLE',30000,'ACTIVE'),(175,2,'J5','J',5,'STANDARD',0,'ACTIVE'),(176,2,'J6','J',6,'STANDARD',0,'ACTIVE'),(177,2,'J7','J',7,'COUPLE',30000,'ACTIVE'),(178,2,'J8','J',8,'COUPLE',30000,'ACTIVE'),(179,2,'J9','J',9,'STANDARD',0,'ACTIVE'),(180,2,'J10','J',10,'STANDARD',0,'ACTIVE'),(181,3,'A1','A',1,'IMAX',30000,'ACTIVE'),(182,3,'A2','A',2,'IMAX',30000,'ACTIVE'),(183,3,'A3','A',3,'IMAX',30000,'ACTIVE'),(184,3,'A4','A',4,'IMAX',30000,'ACTIVE'),(185,3,'A5','A',5,'IMAX',30000,'ACTIVE'),(186,3,'A6','A',6,'IMAX',30000,'ACTIVE'),(187,3,'A7','A',7,'IMAX',30000,'ACTIVE'),(188,3,'A8','A',8,'IMAX',30000,'ACTIVE'),(189,3,'A9','A',9,'IMAX',30000,'ACTIVE'),(190,3,'A10','A',10,'IMAX',30000,'ACTIVE'),(191,3,'B1','B',1,'IMAX',30000,'ACTIVE'),(192,3,'B2','B',2,'IMAX',30000,'ACTIVE'),(193,3,'B3','B',3,'IMAX',30000,'ACTIVE'),(194,3,'B4','B',4,'IMAX',30000,'ACTIVE'),(195,3,'B5','B',5,'IMAX',30000,'ACTIVE'),(196,3,'B6','B',6,'IMAX',30000,'ACTIVE'),(197,3,'B7','B',7,'IMAX',30000,'ACTIVE'),(198,3,'B8','B',8,'IMAX',30000,'ACTIVE'),(199,3,'B9','B',9,'IMAX',30000,'ACTIVE'),(200,3,'B10','B',10,'IMAX',30000,'ACTIVE'),(201,3,'C1','C',1,'IMAX',30000,'ACTIVE'),(202,3,'C2','C',2,'IMAX',30000,'ACTIVE'),(203,3,'C3','C',3,'IMAX',30000,'ACTIVE'),(204,3,'C4','C',4,'IMAX',30000,'ACTIVE'),(205,3,'C5','C',5,'IMAX',30000,'ACTIVE'),(206,3,'C6','C',6,'IMAX',30000,'ACTIVE'),(207,3,'C7','C',7,'IMAX',30000,'ACTIVE'),(208,3,'C8','C',8,'IMAX',30000,'ACTIVE'),(209,3,'C9','C',9,'IMAX',30000,'ACTIVE'),(210,3,'C10','C',10,'IMAX',30000,'ACTIVE'),(211,3,'D1','D',1,'IMAX',30000,'ACTIVE'),(212,3,'D2','D',2,'IMAX',30000,'ACTIVE'),(213,3,'D3','D',3,'IMAX',30000,'ACTIVE'),(214,3,'D4','D',4,'IMAX',30000,'ACTIVE'),(215,3,'D5','D',5,'IMAX',30000,'ACTIVE'),(216,3,'D6','D',6,'IMAX',30000,'ACTIVE'),(217,3,'D7','D',7,'IMAX',30000,'ACTIVE'),(218,3,'D8','D',8,'IMAX',30000,'ACTIVE'),(219,3,'D9','D',9,'IMAX',30000,'ACTIVE'),(220,3,'D10','D',10,'IMAX',30000,'ACTIVE'),(221,3,'E1','E',1,'IMAX',30000,'ACTIVE'),(222,3,'E2','E',2,'IMAX',30000,'ACTIVE'),(223,3,'E3','E',3,'IMAX',30000,'ACTIVE'),(224,3,'E4','E',4,'IMAX',30000,'ACTIVE'),(225,3,'E5','E',5,'IMAX',30000,'ACTIVE'),(226,3,'E6','E',6,'IMAX',30000,'ACTIVE'),(227,3,'E7','E',7,'IMAX',30000,'ACTIVE'),(228,3,'E8','E',8,'IMAX',30000,'ACTIVE'),(229,3,'E9','E',9,'IMAX',30000,'ACTIVE'),(230,3,'E10','E',10,'IMAX',30000,'ACTIVE'),(231,4,'A1','A',1,'VIP',20000,'ACTIVE'),(232,4,'A2','A',2,'VIP',20000,'ACTIVE'),(233,4,'A3','A',3,'VIP',20000,'ACTIVE'),(234,4,'A4','A',4,'VIP',20000,'ACTIVE'),(235,4,'A5','A',5,'VIP',20000,'ACTIVE'),(236,4,'A6','A',6,'VIP',20000,'ACTIVE'),(237,4,'A7','A',7,'VIP',20000,'ACTIVE'),(238,4,'A8','A',8,'VIP',20000,'ACTIVE'),(239,4,'A9','A',9,'VIP',20000,'ACTIVE'),(240,4,'A10','A',10,'VIP',20000,'ACTIVE'),(241,4,'B1','B',1,'VIP',20000,'ACTIVE'),(242,4,'B2','B',2,'VIP',20000,'ACTIVE'),(243,4,'B3','B',3,'VIP',20000,'ACTIVE'),(244,4,'B4','B',4,'VIP',20000,'ACTIVE'),(245,4,'B5','B',5,'VIP',20000,'ACTIVE'),(246,4,'B6','B',6,'VIP',20000,'ACTIVE'),(247,4,'B7','B',7,'VIP',20000,'ACTIVE'),(248,4,'B8','B',8,'VIP',20000,'ACTIVE'),(249,4,'B9','B',9,'VIP',20000,'ACTIVE'),(250,4,'B10','B',10,'VIP',20000,'ACTIVE'),(251,4,'C1','C',1,'STANDARD',0,'ACTIVE'),(252,4,'C2','C',2,'STANDARD',0,'ACTIVE'),(253,4,'C3','C',3,'STANDARD',0,'ACTIVE'),(254,4,'C4','C',4,'STANDARD',0,'ACTIVE'),(255,4,'C5','C',5,'STANDARD',0,'ACTIVE'),(256,4,'C6','C',6,'STANDARD',0,'ACTIVE'),(257,4,'C7','C',7,'STANDARD',0,'ACTIVE'),(258,4,'C8','C',8,'STANDARD',0,'ACTIVE'),(259,4,'C9','C',9,'STANDARD',0,'ACTIVE'),(260,4,'C10','C',10,'STANDARD',0,'ACTIVE'),(261,4,'D1','D',1,'STANDARD',0,'ACTIVE'),(262,4,'D2','D',2,'STANDARD',0,'ACTIVE'),(263,4,'D3','D',3,'STANDARD',0,'ACTIVE'),(264,4,'D4','D',4,'STANDARD',0,'ACTIVE'),(265,4,'D5','D',5,'STANDARD',0,'ACTIVE'),(266,4,'D6','D',6,'STANDARD',0,'ACTIVE'),(267,4,'D7','D',7,'STANDARD',0,'ACTIVE'),(268,4,'D8','D',8,'STANDARD',0,'ACTIVE'),(269,4,'D9','D',9,'STANDARD',0,'ACTIVE'),(270,4,'D10','D',10,'STANDARD',0,'ACTIVE'),(271,4,'E1','E',1,'STANDARD',0,'ACTIVE'),(272,4,'E2','E',2,'STANDARD',0,'ACTIVE'),(273,4,'E3','E',3,'STANDARD',0,'ACTIVE'),(274,4,'E4','E',4,'STANDARD',0,'ACTIVE'),(275,4,'E5','E',5,'STANDARD',0,'ACTIVE'),(276,4,'E6','E',6,'STANDARD',0,'ACTIVE'),(277,4,'E7','E',7,'STANDARD',0,'ACTIVE'),(278,4,'E8','E',8,'STANDARD',0,'ACTIVE'),(279,4,'E9','E',9,'STANDARD',0,'ACTIVE'),(280,4,'E10','E',10,'STANDARD',0,'ACTIVE'),(281,4,'F1','F',1,'STANDARD',0,'ACTIVE'),(282,4,'F2','F',2,'STANDARD',0,'ACTIVE'),(283,4,'F3','F',3,'STANDARD',0,'ACTIVE'),(284,4,'F4','F',4,'STANDARD',0,'ACTIVE'),(285,4,'F5','F',5,'STANDARD',0,'ACTIVE'),(286,4,'F6','F',6,'STANDARD',0,'ACTIVE'),(287,4,'F7','F',7,'STANDARD',0,'ACTIVE'),(288,4,'F8','F',8,'STANDARD',0,'ACTIVE'),(289,4,'F9','F',9,'STANDARD',0,'ACTIVE'),(290,4,'F10','F',10,'STANDARD',0,'ACTIVE'),(291,4,'G1','G',1,'STANDARD',0,'ACTIVE'),(292,4,'G2','G',2,'STANDARD',0,'ACTIVE'),(293,4,'G3','G',3,'STANDARD',0,'ACTIVE'),(294,4,'G4','G',4,'STANDARD',0,'ACTIVE'),(295,4,'G5','G',5,'STANDARD',0,'ACTIVE'),(296,4,'G6','G',6,'STANDARD',0,'ACTIVE'),(297,4,'G7','G',7,'STANDARD',0,'ACTIVE'),(298,4,'G8','G',8,'STANDARD',0,'ACTIVE'),(299,4,'G9','G',9,'STANDARD',0,'ACTIVE'),(300,4,'G10','G',10,'STANDARD',0,'ACTIVE'),(301,4,'H1','H',1,'STANDARD',0,'ACTIVE'),(302,4,'H2','H',2,'STANDARD',0,'ACTIVE'),(303,4,'H3','H',3,'STANDARD',0,'ACTIVE'),(304,4,'H4','H',4,'STANDARD',0,'ACTIVE'),(305,4,'H5','H',5,'STANDARD',0,'ACTIVE'),(306,4,'H6','H',6,'STANDARD',0,'ACTIVE'),(307,4,'H7','H',7,'STANDARD',0,'ACTIVE'),(308,4,'H8','H',8,'STANDARD',0,'ACTIVE'),(309,4,'H9','H',9,'STANDARD',0,'ACTIVE'),(310,4,'H10','H',10,'STANDARD',0,'ACTIVE'),(311,4,'I1','I',1,'STANDARD',0,'ACTIVE'),(312,4,'I2','I',2,'STANDARD',0,'ACTIVE'),(313,4,'I3','I',3,'COUPLE',30000,'ACTIVE'),(314,4,'I4','I',4,'COUPLE',30000,'ACTIVE'),(315,4,'I5','I',5,'STANDARD',0,'ACTIVE'),(316,4,'I6','I',6,'STANDARD',0,'ACTIVE'),(317,4,'I7','I',7,'COUPLE',30000,'ACTIVE'),(318,4,'I8','I',8,'COUPLE',30000,'ACTIVE'),(319,4,'I9','I',9,'STANDARD',0,'ACTIVE'),(320,4,'I10','I',10,'STANDARD',0,'ACTIVE'),(321,5,'A1','A',1,'VIP',20000,'ACTIVE'),(322,5,'A2','A',2,'VIP',20000,'ACTIVE'),(323,5,'A3','A',3,'VIP',20000,'ACTIVE'),(324,5,'A4','A',4,'VIP',20000,'ACTIVE'),(325,5,'A5','A',5,'VIP',20000,'ACTIVE'),(326,5,'A6','A',6,'VIP',20000,'ACTIVE'),(327,5,'A7','A',7,'VIP',20000,'ACTIVE'),(328,5,'A8','A',8,'VIP',20000,'ACTIVE'),(329,5,'A9','A',9,'VIP',20000,'ACTIVE'),(330,5,'A10','A',10,'VIP',20000,'ACTIVE'),(331,5,'A11','A',11,'VIP',20000,'ACTIVE'),(332,5,'A12','A',12,'VIP',20000,'ACTIVE'),(333,5,'B1','B',1,'VIP',20000,'ACTIVE'),(334,5,'B2','B',2,'VIP',20000,'ACTIVE'),(335,5,'B3','B',3,'VIP',20000,'ACTIVE'),(336,5,'B4','B',4,'VIP',20000,'ACTIVE'),(337,5,'B5','B',5,'VIP',20000,'ACTIVE'),(338,5,'B6','B',6,'VIP',20000,'ACTIVE'),(339,5,'B7','B',7,'VIP',20000,'ACTIVE'),(340,5,'B8','B',8,'VIP',20000,'ACTIVE'),(341,5,'B9','B',9,'VIP',20000,'ACTIVE'),(342,5,'B10','B',10,'VIP',20000,'ACTIVE'),(343,5,'B11','B',11,'VIP',20000,'ACTIVE'),(344,5,'B12','B',12,'VIP',20000,'ACTIVE'),(345,5,'C1','C',1,'STANDARD',0,'ACTIVE'),(346,5,'C2','C',2,'STANDARD',0,'ACTIVE'),(347,5,'C3','C',3,'STANDARD',0,'ACTIVE'),(348,5,'C4','C',4,'STANDARD',0,'ACTIVE'),(349,5,'C5','C',5,'STANDARD',0,'ACTIVE'),(350,5,'C6','C',6,'STANDARD',0,'ACTIVE'),(351,5,'C7','C',7,'STANDARD',0,'ACTIVE'),(352,5,'C8','C',8,'STANDARD',0,'ACTIVE'),(353,5,'C9','C',9,'STANDARD',0,'ACTIVE'),(354,5,'C10','C',10,'STANDARD',0,'ACTIVE'),(355,5,'C11','C',11,'STANDARD',0,'ACTIVE'),(356,5,'C12','C',12,'STANDARD',0,'ACTIVE'),(357,5,'D1','D',1,'STANDARD',0,'ACTIVE'),(358,5,'D2','D',2,'STANDARD',0,'ACTIVE'),(359,5,'D3','D',3,'STANDARD',0,'ACTIVE'),(360,5,'D4','D',4,'STANDARD',0,'ACTIVE'),(361,5,'D5','D',5,'STANDARD',0,'ACTIVE'),(362,5,'D6','D',6,'STANDARD',0,'ACTIVE'),(363,5,'D7','D',7,'STANDARD',0,'ACTIVE'),(364,5,'D8','D',8,'STANDARD',0,'ACTIVE'),(365,5,'D9','D',9,'STANDARD',0,'ACTIVE'),(366,5,'D10','D',10,'STANDARD',0,'ACTIVE'),(367,5,'D11','D',11,'STANDARD',0,'ACTIVE'),(368,5,'D12','D',12,'STANDARD',0,'ACTIVE'),(369,5,'E1','E',1,'STANDARD',0,'ACTIVE'),(370,5,'E2','E',2,'STANDARD',0,'ACTIVE'),(371,5,'E3','E',3,'STANDARD',0,'ACTIVE'),(372,5,'E4','E',4,'STANDARD',0,'ACTIVE'),(373,5,'E5','E',5,'STANDARD',0,'ACTIVE'),(374,5,'E6','E',6,'STANDARD',0,'ACTIVE'),(375,5,'E7','E',7,'STANDARD',0,'ACTIVE'),(376,5,'E8','E',8,'STANDARD',0,'ACTIVE'),(377,5,'E9','E',9,'STANDARD',0,'ACTIVE'),(378,5,'E10','E',10,'STANDARD',0,'ACTIVE'),(379,5,'E11','E',11,'STANDARD',0,'ACTIVE'),(380,5,'E12','E',12,'STANDARD',0,'ACTIVE'),(381,5,'F1','F',1,'STANDARD',0,'ACTIVE'),(382,5,'F2','F',2,'STANDARD',0,'ACTIVE'),(383,5,'F3','F',3,'STANDARD',0,'ACTIVE'),(384,5,'F4','F',4,'STANDARD',0,'ACTIVE'),(385,5,'F5','F',5,'STANDARD',0,'ACTIVE'),(386,5,'F6','F',6,'STANDARD',0,'ACTIVE'),(387,5,'F7','F',7,'STANDARD',0,'ACTIVE'),(388,5,'F8','F',8,'STANDARD',0,'ACTIVE'),(389,5,'F9','F',9,'STANDARD',0,'ACTIVE'),(390,5,'F10','F',10,'STANDARD',0,'ACTIVE'),(391,5,'F11','F',11,'STANDARD',0,'ACTIVE'),(392,5,'F12','F',12,'STANDARD',0,'ACTIVE'),(393,5,'G1','G',1,'STANDARD',0,'ACTIVE'),(394,5,'G2','G',2,'STANDARD',0,'ACTIVE'),(395,5,'G3','G',3,'STANDARD',0,'ACTIVE'),(396,5,'G4','G',4,'STANDARD',0,'ACTIVE'),(397,5,'G5','G',5,'STANDARD',0,'ACTIVE'),(398,5,'G6','G',6,'STANDARD',0,'ACTIVE'),(399,5,'G7','G',7,'STANDARD',0,'ACTIVE'),(400,5,'G8','G',8,'STANDARD',0,'ACTIVE'),(401,5,'G9','G',9,'STANDARD',0,'ACTIVE'),(402,5,'G10','G',10,'STANDARD',0,'ACTIVE'),(403,5,'G11','G',11,'STANDARD',0,'ACTIVE'),(404,5,'G12','G',12,'STANDARD',0,'ACTIVE'),(405,5,'H1','H',1,'STANDARD',0,'ACTIVE'),(406,5,'H2','H',2,'STANDARD',0,'ACTIVE'),(407,5,'H3','H',3,'STANDARD',0,'ACTIVE'),(408,5,'H4','H',4,'STANDARD',0,'ACTIVE'),(409,5,'H5','H',5,'STANDARD',0,'ACTIVE'),(410,5,'H6','H',6,'STANDARD',0,'ACTIVE'),(411,5,'H7','H',7,'STANDARD',0,'ACTIVE'),(412,5,'H8','H',8,'STANDARD',0,'ACTIVE'),(413,5,'H9','H',9,'STANDARD',0,'ACTIVE'),(414,5,'H10','H',10,'STANDARD',0,'ACTIVE'),(415,5,'H11','H',11,'STANDARD',0,'ACTIVE'),(416,5,'H12','H',12,'STANDARD',0,'ACTIVE'),(417,5,'I1','I',1,'STANDARD',0,'ACTIVE'),(418,5,'I2','I',2,'STANDARD',0,'ACTIVE'),(419,5,'I3','I',3,'STANDARD',0,'ACTIVE'),(420,5,'I4','I',4,'STANDARD',0,'ACTIVE'),(421,5,'I5','I',5,'STANDARD',0,'ACTIVE'),(422,5,'I6','I',6,'STANDARD',0,'ACTIVE'),(423,5,'I7','I',7,'STANDARD',0,'ACTIVE'),(424,5,'I8','I',8,'STANDARD',0,'ACTIVE'),(425,5,'I9','I',9,'STANDARD',0,'ACTIVE'),(426,5,'I10','I',10,'STANDARD',0,'ACTIVE'),(427,5,'I11','I',11,'STANDARD',0,'ACTIVE'),(428,5,'I12','I',12,'STANDARD',0,'ACTIVE'),(429,5,'J1','J',1,'STANDARD',0,'ACTIVE'),(430,5,'J2','J',2,'STANDARD',0,'ACTIVE'),(431,5,'J3','J',3,'COUPLE',30000,'ACTIVE'),(432,5,'J4','J',4,'COUPLE',30000,'ACTIVE'),(433,5,'J5','J',5,'STANDARD',0,'ACTIVE'),(434,5,'J6','J',6,'STANDARD',0,'ACTIVE'),(435,5,'J7','J',7,'COUPLE',30000,'ACTIVE'),(436,5,'J8','J',8,'COUPLE',30000,'ACTIVE'),(437,5,'J9','J',9,'STANDARD',0,'ACTIVE'),(438,5,'J10','J',10,'STANDARD',0,'ACTIVE'),(439,5,'J11','J',11,'STANDARD',0,'ACTIVE'),(440,5,'J12','J',12,'STANDARD',0,'ACTIVE'),(441,6,'A1','A',1,'VIP',20000,'ACTIVE'),(442,6,'A2','A',2,'VIP',20000,'ACTIVE'),(443,6,'A3','A',3,'VIP',20000,'ACTIVE'),(444,6,'A4','A',4,'VIP',20000,'ACTIVE'),(445,6,'A5','A',5,'VIP',20000,'ACTIVE'),(446,6,'A6','A',6,'VIP',20000,'ACTIVE'),(447,6,'A7','A',7,'VIP',20000,'ACTIVE'),(448,6,'A8','A',8,'VIP',20000,'ACTIVE'),(449,6,'A9','A',9,'VIP',20000,'ACTIVE'),(450,6,'A10','A',10,'VIP',20000,'ACTIVE'),(451,6,'B1','B',1,'VIP',20000,'ACTIVE'),(452,6,'B2','B',2,'VIP',20000,'ACTIVE'),(453,6,'B3','B',3,'VIP',20000,'ACTIVE'),(454,6,'B4','B',4,'VIP',20000,'ACTIVE'),(455,6,'B5','B',5,'VIP',20000,'ACTIVE'),(456,6,'B6','B',6,'VIP',20000,'ACTIVE'),(457,6,'B7','B',7,'VIP',20000,'ACTIVE'),(458,6,'B8','B',8,'VIP',20000,'ACTIVE'),(459,6,'B9','B',9,'VIP',20000,'ACTIVE'),(460,6,'B10','B',10,'VIP',20000,'ACTIVE'),(461,6,'C1','C',1,'STANDARD',0,'ACTIVE'),(462,6,'C2','C',2,'STANDARD',0,'ACTIVE'),(463,6,'C3','C',3,'STANDARD',0,'ACTIVE'),(464,6,'C4','C',4,'STANDARD',0,'ACTIVE'),(465,6,'C5','C',5,'STANDARD',0,'ACTIVE'),(466,6,'C6','C',6,'STANDARD',0,'ACTIVE'),(467,6,'C7','C',7,'STANDARD',0,'ACTIVE'),(468,6,'C8','C',8,'STANDARD',0,'ACTIVE'),(469,6,'C9','C',9,'STANDARD',0,'ACTIVE'),(470,6,'C10','C',10,'STANDARD',0,'ACTIVE'),(471,6,'D1','D',1,'STANDARD',0,'ACTIVE'),(472,6,'D2','D',2,'STANDARD',0,'ACTIVE'),(473,6,'D3','D',3,'STANDARD',0,'ACTIVE'),(474,6,'D4','D',4,'STANDARD',0,'ACTIVE'),(475,6,'D5','D',5,'STANDARD',0,'ACTIVE'),(476,6,'D6','D',6,'STANDARD',0,'ACTIVE'),(477,6,'D7','D',7,'STANDARD',0,'ACTIVE'),(478,6,'D8','D',8,'STANDARD',0,'ACTIVE'),(479,6,'D9','D',9,'STANDARD',0,'ACTIVE'),(480,6,'D10','D',10,'STANDARD',0,'ACTIVE'),(481,6,'E1','E',1,'STANDARD',0,'ACTIVE'),(482,6,'E2','E',2,'STANDARD',0,'ACTIVE'),(483,6,'E3','E',3,'STANDARD',0,'ACTIVE'),(484,6,'E4','E',4,'STANDARD',0,'ACTIVE'),(485,6,'E5','E',5,'STANDARD',0,'ACTIVE'),(486,6,'E6','E',6,'STANDARD',0,'ACTIVE'),(487,6,'E7','E',7,'STANDARD',0,'ACTIVE'),(488,6,'E8','E',8,'STANDARD',0,'ACTIVE'),(489,6,'E9','E',9,'STANDARD',0,'ACTIVE'),(490,6,'E10','E',10,'STANDARD',0,'ACTIVE'),(491,6,'F1','F',1,'STANDARD',0,'ACTIVE'),(492,6,'F2','F',2,'STANDARD',0,'ACTIVE'),(493,6,'F3','F',3,'STANDARD',0,'ACTIVE'),(494,6,'F4','F',4,'STANDARD',0,'ACTIVE'),(495,6,'F5','F',5,'STANDARD',0,'ACTIVE'),(496,6,'F6','F',6,'STANDARD',0,'ACTIVE'),(497,6,'F7','F',7,'STANDARD',0,'ACTIVE'),(498,6,'F8','F',8,'STANDARD',0,'ACTIVE'),(499,6,'F9','F',9,'STANDARD',0,'ACTIVE'),(500,6,'F10','F',10,'STANDARD',0,'ACTIVE'),(501,6,'G1','G',1,'STANDARD',0,'ACTIVE'),(502,6,'G2','G',2,'STANDARD',0,'ACTIVE'),(503,6,'G3','G',3,'COUPLE',30000,'ACTIVE'),(504,6,'G4','G',4,'COUPLE',30000,'ACTIVE'),(505,6,'G5','G',5,'STANDARD',0,'ACTIVE'),(506,6,'G6','G',6,'STANDARD',0,'ACTIVE'),(507,6,'G7','G',7,'COUPLE',30000,'ACTIVE'),(508,6,'G8','G',8,'COUPLE',30000,'ACTIVE'),(509,6,'G9','G',9,'STANDARD',0,'ACTIVE'),(510,6,'G10','G',10,'STANDARD',0,'ACTIVE'),(511,7,'A1','A',1,'VIP',20000,'ACTIVE'),(512,7,'A2','A',2,'VIP',20000,'ACTIVE'),(513,7,'A3','A',3,'VIP',20000,'ACTIVE'),(514,7,'A4','A',4,'VIP',20000,'ACTIVE'),(515,7,'A5','A',5,'VIP',20000,'ACTIVE'),(516,7,'A6','A',6,'VIP',20000,'ACTIVE'),(517,7,'A7','A',7,'VIP',20000,'ACTIVE'),(518,7,'A8','A',8,'VIP',20000,'ACTIVE'),(519,7,'A9','A',9,'VIP',20000,'ACTIVE'),(520,7,'A10','A',10,'VIP',20000,'ACTIVE'),(521,7,'B1','B',1,'VIP',20000,'ACTIVE'),(522,7,'B2','B',2,'VIP',20000,'ACTIVE'),(523,7,'B3','B',3,'VIP',20000,'ACTIVE'),(524,7,'B4','B',4,'VIP',20000,'ACTIVE'),(525,7,'B5','B',5,'VIP',20000,'ACTIVE'),(526,7,'B6','B',6,'VIP',20000,'ACTIVE'),(527,7,'B7','B',7,'VIP',20000,'ACTIVE'),(528,7,'B8','B',8,'VIP',20000,'ACTIVE'),(529,7,'B9','B',9,'VIP',20000,'ACTIVE'),(530,7,'B10','B',10,'VIP',20000,'ACTIVE'),(531,7,'C1','C',1,'STANDARD',0,'ACTIVE'),(532,7,'C2','C',2,'STANDARD',0,'ACTIVE'),(533,7,'C3','C',3,'STANDARD',0,'ACTIVE'),(534,7,'C4','C',4,'STANDARD',0,'ACTIVE'),(535,7,'C5','C',5,'STANDARD',0,'ACTIVE'),(536,7,'C6','C',6,'STANDARD',0,'ACTIVE'),(537,7,'C7','C',7,'STANDARD',0,'ACTIVE'),(538,7,'C8','C',8,'STANDARD',0,'ACTIVE'),(539,7,'C9','C',9,'STANDARD',0,'ACTIVE'),(540,7,'C10','C',10,'STANDARD',0,'ACTIVE'),(541,7,'D1','D',1,'STANDARD',0,'ACTIVE'),(542,7,'D2','D',2,'STANDARD',0,'ACTIVE'),(543,7,'D3','D',3,'STANDARD',0,'ACTIVE'),(544,7,'D4','D',4,'STANDARD',0,'ACTIVE'),(545,7,'D5','D',5,'STANDARD',0,'ACTIVE'),(546,7,'D6','D',6,'STANDARD',0,'ACTIVE'),(547,7,'D7','D',7,'STANDARD',0,'ACTIVE'),(548,7,'D8','D',8,'STANDARD',0,'ACTIVE'),(549,7,'D9','D',9,'STANDARD',0,'ACTIVE'),(550,7,'D10','D',10,'STANDARD',0,'ACTIVE'),(551,7,'E1','E',1,'STANDARD',0,'ACTIVE'),(552,7,'E2','E',2,'STANDARD',0,'ACTIVE'),(553,7,'E3','E',3,'STANDARD',0,'ACTIVE'),(554,7,'E4','E',4,'STANDARD',0,'ACTIVE'),(555,7,'E5','E',5,'STANDARD',0,'ACTIVE'),(556,7,'E6','E',6,'STANDARD',0,'ACTIVE'),(557,7,'E7','E',7,'STANDARD',0,'ACTIVE'),(558,7,'E8','E',8,'STANDARD',0,'ACTIVE'),(559,7,'E9','E',9,'STANDARD',0,'ACTIVE'),(560,7,'E10','E',10,'STANDARD',0,'ACTIVE'),(561,7,'F1','F',1,'STANDARD',0,'ACTIVE'),(562,7,'F2','F',2,'STANDARD',0,'ACTIVE'),(563,7,'F3','F',3,'STANDARD',0,'ACTIVE'),(564,7,'F4','F',4,'STANDARD',0,'ACTIVE'),(565,7,'F5','F',5,'STANDARD',0,'ACTIVE'),(566,7,'F6','F',6,'STANDARD',0,'ACTIVE'),(567,7,'F7','F',7,'STANDARD',0,'ACTIVE'),(568,7,'F8','F',8,'STANDARD',0,'ACTIVE'),(569,7,'F9','F',9,'STANDARD',0,'ACTIVE'),(570,7,'F10','F',10,'STANDARD',0,'ACTIVE'),(571,7,'G1','G',1,'STANDARD',0,'ACTIVE'),(572,7,'G2','G',2,'STANDARD',0,'ACTIVE'),(573,7,'G3','G',3,'STANDARD',0,'ACTIVE'),(574,7,'G4','G',4,'STANDARD',0,'ACTIVE'),(575,7,'G5','G',5,'STANDARD',0,'ACTIVE'),(576,7,'G6','G',6,'STANDARD',0,'ACTIVE'),(577,7,'G7','G',7,'STANDARD',0,'ACTIVE'),(578,7,'G8','G',8,'STANDARD',0,'ACTIVE'),(579,7,'G9','G',9,'STANDARD',0,'ACTIVE'),(580,7,'G10','G',10,'STANDARD',0,'ACTIVE'),(581,7,'H1','H',1,'STANDARD',0,'ACTIVE'),(582,7,'H2','H',2,'STANDARD',0,'ACTIVE'),(583,7,'H3','H',3,'STANDARD',0,'ACTIVE'),(584,7,'H4','H',4,'STANDARD',0,'ACTIVE'),(585,7,'H5','H',5,'STANDARD',0,'ACTIVE'),(586,7,'H6','H',6,'STANDARD',0,'ACTIVE'),(587,7,'H7','H',7,'STANDARD',0,'ACTIVE'),(588,7,'H8','H',8,'STANDARD',0,'ACTIVE'),(589,7,'H9','H',9,'STANDARD',0,'ACTIVE'),(590,7,'H10','H',10,'STANDARD',0,'ACTIVE'),(591,7,'I1','I',1,'STANDARD',0,'ACTIVE'),(592,7,'I2','I',2,'STANDARD',0,'ACTIVE'),(593,7,'I3','I',3,'STANDARD',0,'ACTIVE'),(594,7,'I4','I',4,'STANDARD',0,'ACTIVE'),(595,7,'I5','I',5,'STANDARD',0,'ACTIVE'),(596,7,'I6','I',6,'STANDARD',0,'ACTIVE'),(597,7,'I7','I',7,'STANDARD',0,'ACTIVE'),(598,7,'I8','I',8,'STANDARD',0,'ACTIVE'),(599,7,'I9','I',9,'STANDARD',0,'ACTIVE'),(600,7,'I10','I',10,'STANDARD',0,'ACTIVE'),(601,7,'J1','J',1,'STANDARD',0,'ACTIVE'),(602,7,'J2','J',2,'STANDARD',0,'ACTIVE'),(603,7,'J3','J',3,'COUPLE',30000,'ACTIVE'),(604,7,'J4','J',4,'COUPLE',30000,'ACTIVE'),(605,7,'J5','J',5,'STANDARD',0,'ACTIVE'),(606,7,'J6','J',6,'STANDARD',0,'ACTIVE'),(607,7,'J7','J',7,'COUPLE',30000,'ACTIVE'),(608,7,'J8','J',8,'COUPLE',30000,'ACTIVE'),(609,7,'J9','J',9,'STANDARD',0,'ACTIVE'),(610,7,'J10','J',10,'STANDARD',0,'ACTIVE');
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
  `theater_id` bigint NOT NULL,
  `room_id` bigint NOT NULL,
  `movie_id` bigint NOT NULL,
  `movie_name` varchar(255) NOT NULL,
  `show_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `audio_language` varchar(50) DEFAULT 'Viá»‡t',
  `subtitle_language` varchar(50) DEFAULT NULL,
  `format_type` varchar(30) DEFAULT '2D',
  `status` varchar(20) DEFAULT 'ONLINE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_showtimes_theater_date` (`theater_id`,`show_date`),
  KEY `idx_showtimes_room_date_time` (`room_id`,`show_date`,`start_time`,`end_time`),
  CONSTRAINT `fk_showtime_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_showtime_theater` FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `showtimes`
--

LOCK TABLES `showtimes` WRITE;
/*!40000 ALTER TABLE `showtimes` DISABLE KEYS */;
INSERT INTO `showtimes` VALUES (1,1,1,1,'Avengers: Endgame','2026-07-03','10:00:00','13:01:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-02 15:04:14'),(2,1,2,2,'Doraemon Movie','2026-07-03','14:00:00','15:50:00','Việt','Tiếng Việt','3D','ONLINE','2026-07-02 15:04:14'),(3,1,3,3,'Lật Mặt 8','2026-07-03','19:30:00','22:16:00','Việt','Tiếng Việt','IMAX','ONLINE','2026-07-02 15:04:14'),(4,2,4,4,'Inside Out 2','2026-07-04','09:30:00','11:06:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-02 15:04:14'),(5,2,5,5,'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô','2026-07-04','16:45:00','18:36:00','Việt','Tiếng Việt','3D','ONLINE','2026-07-02 15:04:14'),(6,3,6,6,'Dune: Hành Tinh Cát - Phần Hai','2026-07-05','20:15:00','23:01:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-02 15:04:14'),(8,2,4,2,'Doraemon Movie','2026-07-02','11:36:00','13:26:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-02 22:07:16'),(9,1,1,1,'Avengers: Endgame','2026-07-15','10:00:00','13:01:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-15 12:24:02'),(10,2,4,4,'Inside Out 2','2026-07-15','13:30:00','15:06:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-15 12:24:02'),(11,1,2,2,'Doraemon Movie','2026-07-15','16:00:00','17:50:00','Việt','Tiếng Việt','3D','ONLINE','2026-07-15 12:24:02'),(12,3,6,6,'Dune: Hành Tinh Cát - Phần Hai','2026-07-15','20:15:00','23:01:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-15 12:24:02'),(13,1,1,1,'Avengers: Endgame','2026-07-16','11:00:00','14:01:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-15 12:24:02'),(14,2,5,5,'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô','2026-07-16','16:45:00','18:36:00','Việt','Tiếng Việt','3D','ONLINE','2026-07-15 12:24:02'),(15,3,6,6,'Dune: Hành Tinh Cát - Phần Hai','2026-07-16','20:00:00','22:46:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-15 12:24:02'),(16,2,4,4,'Inside Out 2','2026-07-17','09:30:00','11:06:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-15 12:24:02'),(17,1,2,2,'Doraemon Movie','2026-07-17','14:00:00','15:50:00','Việt','Tiếng Việt','3D','ONLINE','2026-07-15 12:24:02'),(18,1,3,3,'Lật Mặt 8','2026-07-17','19:30:00','21:30:00','Việt','Tiếng Việt','IMAX','ONLINE','2026-07-15 12:24:02'),(19,1,1,1,'Avengers: Endgame','2026-07-18','10:30:00','13:31:00','Việt','Tiếng Việt','2D','ONLINE','2026-07-15 12:24:02'),(20,2,5,5,'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh Triệu Đô','2026-07-18','18:00:00','19:51:00','Việt','Tiếng Việt','3D','ONLINE','2026-07-15 12:24:02');
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
  `name` varchar(150) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `room_count` int DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theaters`
--

LOCK TABLES `theaters` WRITE;
/*!40000 ALTER TABLE `theaters` DISABLE KEYS */;
INSERT INTO `theaters` VALUES (1,'CGV Cao Lỗ','123 Cao Lỗ, Quận 8','Hồ Chí Minh','Tầng 3 trung tâm thương mại',4,'ONLINE'),(2,'Galaxy Nguyễn Trãi','456 Nguyễn Trãi, Quận 5','Hồ Chí Minh','Khu B tầng 2',6,'ONLINE'),(3,'Lotte Thủ Đức','789 Võ Văn Ngân, Thủ Đức','Hồ Chí Minh','Tầng 5 khu giải trí',5,'ONLINE'),(4,'BHD Phạm Hùng','12 Phạm Hùng, Bình Chánh','Hồ Chí Minh','Tầng 4 trung tâm thương mại',7,'ONLINE'),(5,'Cinestar Hai Bà Trưng','135 Hai Bà Trưng, Quận 1','Hồ Chí Minh','Khu rạp tầng 2',5,'ONLINE'),(6,'Mega GS Cao Thắng','19 Cao Thắng, Quận 3','Hồ Chí Minh','Tầng 6 khu vui chơi',4,'ONLINE'),(7,'Beta Tân Bình','221 Cộng Hòa, Tân Bình','Hồ Chí Minh','Tầng 3 khu dịch vụ',6,'ONLINE'),(11,'CGV Landmark 81','720A Điện Biên Phủ, Bình Thạnh','Hồ Chí Minh','Vincom Center Landmark 81, tầng B1',8,'ONLINE'),(12,'Galaxy Sala','10 Mai Chí Thọ, Thủ Đức','Hồ Chí Minh','Khu đô thị Sala, tầng 3',6,'ONLINE'),(13,'Lotte Cinema Gò Vấp','242 Nguyễn Văn Lượng, Gò Vấp','Hồ Chí Minh','Lotte Mart Gò Vấp, tầng 4',7,'ONLINE');
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

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `booking_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

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
  `food_name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `total_price` decimal(38,2) DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKofhk813sbay8or90gohmg8qd9` (`booking_id`),
  CONSTRAINT `FKofhk813sbay8or90gohmg8qd9` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_foods`
--

LOCK TABLES `booking_foods` WRITE;
/*!40000 ALTER TABLE `booking_foods` DISABLE KEYS */;
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
  `seat_code` varchar(255) DEFAULT NULL,
  `seat_id` bigint DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `seat_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmbi9ciapn0nvat63t0a8tv478` (`booking_id`),
  CONSTRAINT `FKmbi9ciapn0nvat63t0a8tv478` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_seats`
--

LOCK TABLES `booking_seats` WRITE;
/*!40000 ALTER TABLE `booking_seats` DISABLE KEYS */;
INSERT INTO `booking_seats` VALUES (1,90000.00,'A1',1,1,NULL),(2,90000.00,'A2',2,1,NULL),(3,105000.00,'A1',81,2,NULL),(4,105000.00,'A2',82,2,NULL),(5,160000.00,'A1',181,3,NULL),(6,160000.00,'A2',182,3,NULL);
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
  `status` varchar(255) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `booking_code` varchar(40) DEFAULT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `discount_amount` decimal(38,2) DEFAULT NULL,
  `expired_at` datetime(6) DEFAULT NULL,
  `food_amount` decimal(38,2) DEFAULT NULL,
  `movie_title` varchar(255) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `show_date` date DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `theater_name` varchar(255) DEFAULT NULL,
  `ticket_amount` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKq97166k18hklq6ls46osbrftx` (`booking_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'2026-06-30 15:04:14.000000',1,'ĐÃ_XÁC_NHẬN',180000.00,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'2026-07-01 15:04:14.000000',2,'ĐÃ_THANH_TOÁN',210000.00,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'2026-07-02 15:04:14.000000',3,'PAID',320000.00,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-14 22:18:51.257697',NULL,NULL,NULL,NULL,NULL);
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
  `category` varchar(30) NOT NULL,
  `cost_price` decimal(12,2) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text,
  `display_order` int NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `low_stock_threshold` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `size` varchar(20) DEFAULT NULL,
  `sku` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `stock_quantity` int NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKopswcerimahpeultr39dhse5x` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foods`
--

LOCK TABLES `foods` WRITE;
/*!40000 ALTER TABLE `foods` DISABLE KEYS */;
INSERT INTO `foods` VALUES
(1,'POPCORN',22000.00,'2026-07-15 20:30:00.000000','Bắp rang bơ caramel size vừa, vị ngọt nhẹ, dùng cho 1 người.',10,'https://placehold.co/640x420/f97316/ffffff?text=Bap+Caramel+M',15,'Bắp rang caramel M',45000.00,'M','POP-CARAMEL-M','ACTIVE',120,'2026-07-15 20:30:00.000000'),
(2,'POPCORN',32000.00,'2026-07-15 20:30:00.000000','Bắp rang phô mai size lớn, phù hợp 2 người.',20,'https://placehold.co/640x420/facc15/111827?text=Bap+Pho+Mai+L',15,'Bắp rang phô mai L',65000.00,'L','POP-CHEESE-L','ACTIVE',90,'2026-07-15 20:30:00.000000'),
(3,'DRINK',12000.00,'2026-07-15 20:30:00.000000','Nước ngọt Coca Cola size vừa.',30,'https://placehold.co/640x420/ef4444/ffffff?text=Coca+Cola+M',20,'Coca Cola M',30000.00,'M','DRK-COKE-M','ACTIVE',150,'2026-07-15 20:30:00.000000'),
(4,'DRINK',14000.00,'2026-07-15 20:30:00.000000','Trà đào cam sả size vừa, dùng lạnh.',40,'https://placehold.co/640x420/f59e0b/ffffff?text=Tra+Dao+M',20,'Trà đào cam sả M',35000.00,'M','DRK-PEACH-TEA-M','ACTIVE',110,'2026-07-15 20:30:00.000000'),
(5,'SNACK',18000.00,'2026-07-15 20:30:00.000000','Khoai tây chiên giòn dùng kèm sốt.',50,'https://placehold.co/640x420/fbbf24/111827?text=Khoai+Tay+Chien',10,'Khoai tây chiên',39000.00,'M','SNACK-FRIES-M','ACTIVE',80,'2026-07-15 20:30:00.000000'),
(6,'COMBO',60000.00,'2026-07-15 20:30:00.000000','1 bắp caramel M và 1 Coca Cola M.',60,'https://placehold.co/640x420/dc2626/ffffff?text=Combo+Solo',8,'Combo Solo',99000.00,'NONE','COMBO-SOLO','ACTIVE',70,'2026-07-15 20:30:00.000000'),
(7,'COMBO',72000.00,'2026-07-15 20:30:00.000000','1 bắp phô mai L và 2 Coca Cola M.',70,'https://placehold.co/640x420/7c3aed/ffffff?text=Combo+Couple',8,'Combo Couple',119000.00,'NONE','COMBO-COUPLE','ACTIVE',55,'2026-07-15 20:30:00.000000'),
(8,'COMBO',96000.00,'2026-07-15 20:30:00.000000','2 bắp caramel M và 2 nước ngọt M.',80,'https://placehold.co/640x420/2563eb/ffffff?text=Combo+Blockbuster',6,'Combo Blockbuster',159000.00,'NONE','COMBO-BLOCKBUSTER','ACTIVE',45,'2026-07-15 20:30:00.000000'),
(9,'COMBO',135000.00,'2026-07-15 20:30:00.000000','2 bắp phô mai L, 4 Coca Cola M và 2 snack.',90,'https://placehold.co/640x420/16a34a/ffffff?text=Combo+Family',6,'Combo Family',229000.00,'NONE','COMBO-FAMILY','ACTIVE',30,'2026-07-15 20:30:00.000000'),
(10,'COMBO',110000.00,'2026-07-15 20:30:00.000000','1 bắp phô mai L, 1 trà đào M và 1 khoai tây chiên.',100,'https://placehold.co/640x420/0f172a/facc15?text=Combo+Premium',5,'Combo Premium',189000.00,'NONE','COMBO-PREMIUM','ACTIVE',35,'2026-07-15 20:30:00.000000');
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
  `payment_method` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `transaction_code` varchar(60) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8inpv30544qjykcwa6ck7pusy` (`transaction_code`),
  KEY `FKc52o2b1jkxttngufqp3t7jr3h` (`booking_id`),
  CONSTRAINT `FKc52o2b1jkxttngufqp3t7jr3h` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,320000.00,'2026-07-14 22:18:51.257697','2026-07-14 22:18:51.257697','ONLINE','SUCCESS','PAY20260714151851',3);
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
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `discount_type` varchar(20) NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `min_order_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `max_discount_amount` decimal(12,2) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int NOT NULL DEFAULT '0',
  `status` varchar(20) NOT NULL DEFAULT 'ONLINE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'WELCOME10','Chào thành viên mới','Giảm 10% cho lần đặt vé đầu tiên.','https://placehold.co/640x320/2563eb/ffffff?text=WELCOME+10%25','PERCENT',10.00,100000.00,50000.00,'2026-07-02','2026-09-30',1000,0,'ONLINE','2026-07-02 15:46:17','2026-07-02 15:46:17'),(2,'HAPPY50K','Happy Day giảm 50.000đ','Giảm trực tiếp 50.000đ cho đơn đủ điều kiện.','https://placehold.co/640x320/0891b2/ffffff?text=HAPPY+DAY+50K','FIXED',50000.00,200000.00,NULL,'2026-07-02','2026-08-31',500,0,'ONLINE','2026-07-02 15:46:17','2026-07-02 15:46:17'),(3,'MEMBER20','Ưu đãi thành viên 20%','Giảm 20% dành cho thành viên thân thiết.','https://placehold.co/640x320/7c3aed/ffffff?text=MEMBER+20%25','PERCENT',20.00,150000.00,80000.00,'2026-07-02','2026-10-30',300,0,'ONLINE','2026-07-02 15:46:17','2026-07-02 15:46:17');
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
  `day_group` varchar(50) NOT NULL,
  `member_online_price` double DEFAULT NULL,
  `student_price` double DEFAULT NULL,
  `time_slot` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ticket_pricing_day_time` (`day_group`,`time_slot`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `surcharge_key` varchar(50) NOT NULL,
  `surcharge_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK76w3yxug0pfjd9pefrc34ctwa` (`surcharge_key`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `qr_code` varchar(120) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `ticket_code` varchar(40) DEFAULT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcvl4jbu5fln08ltem9rrmtp8w` (`ticket_code`),
  UNIQUE KEY `UKlwytoi4sx2v20kyuj6bvqto1y` (`booking_id`),
  CONSTRAINT `FKefja4avuu7g29t78mxifrsynb` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'2026-07-14 22:18:51.257697','QR-null','VALID','TK202607141518513',NULL,3);
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

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `user_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `user_db`;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `email_verification_token` varchar(120) DEFAULT NULL,
  `email_verification_token_expires_at` datetime(6) DEFAULT NULL,
  `email_verified` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Quản trị hệ thống','admin@gmail.com','$2a$10$8DGMMpjPcZ9JT9e.AaEOuOZl8vz9.3DyKPMQ4RAXIKH3pApoiWe5C','0900000000','ADMIN','2026-07-02 13:33:02',NULL,NULL,NULL),(2,'Nguyễn Minh Quân','quan.customer@gmail.com','123456','0901111222','CUSTOMER','2026-07-02 15:04:14',NULL,NULL,NULL),(3,'Trần Hoàng Linh','linh.customer@gmail.com','123456','0903333444','CUSTOMER','2026-07-02 15:04:14',NULL,NULL,NULL),(4,'Lê Thu Hà','ha.staff@gmail.com','123456','0905555666','STAFF','2026-07-02 15:04:14',NULL,NULL,NULL),(5,'Quản lý Rạp','manager@gmail.com','123456','0907777888','ADMIN','2026-07-02 15:04:14',NULL,NULL,NULL),(12,'minhi','tritruongminh2020@gmail.com','$2a$10$o48HReUEwGLfoG368s41ROdroqBW8UXEYDGWwWvplOSi2WJ.r/PPe','0364818531','CUSTOMER','2026-07-14 23:31:54',NULL,NULL,_binary '');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'user_db'
--

--
-- Dumping routines for database 'user_db'
--

--
-- Current Database: `payment_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `payment_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `payment_db`;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(12,2) NOT NULL,
  `booking_id` bigint NOT NULL,
  `callback_payload` tinytext,
  `created_at` datetime(6) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `provider` varchar(30) NOT NULL,
  `provider_transaction_id` varchar(120) DEFAULT NULL,
  `recipient` varchar(255) DEFAULT NULL,
  `refunded_amount` decimal(12,2) NOT NULL,
  `refunded_at` datetime(6) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `transaction_reference` varchar(80) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK61bc7vee8p067jyvyip7ja2yb` (`transaction_reference`),
  UNIQUE KEY `UKi2cerse1gcfbnl68yh9v4xhek` (`provider_transaction_id`),
  KEY `idx_payment_booking` (`booking_id`),
  KEY `idx_payment_user` (`user_id`),
  KEY `idx_payment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'payment_db'
--

--
-- Dumping routines for database 'payment_db'
--

--
-- Current Database: `notification_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `notification_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `notification_db`;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_count` int NOT NULL,
  `channel` varchar(20) NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email_attempt_count` int DEFAULT NULL,
  `email_failure_reason` varchar(500) DEFAULT NULL,
  `email_recipient` varchar(255) DEFAULT NULL,
  `email_sent_at` datetime(6) DEFAULT NULL,
  `email_status` varchar(20) DEFAULT NULL,
  `event_key` varchar(160) DEFAULT NULL,
  `event_type` varchar(60) DEFAULT NULL,
  `failure_reason` varchar(500) DEFAULT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `recipient` varchar(255) NOT NULL,
  `related_id` bigint DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notification_event_key` (`event_key`),
  KEY `idx_notification_user` (`user_id`),
  KEY `idx_notification_status` (`status`),
  KEY `idx_notification_related` (`related_type`,`related_id`),
  KEY `idx_notification_event_type` (`event_type`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'IN_APP','Đơn vé #3 đã thanh toán thành công. Ghế: A1, A2. Giá trị: 320.000đ.','2026-07-14 22:18:54.208017',1,'Chưa bật cấu hình gửi email SMTP','quan.customer@gmail.com',NULL,'SKIPPED','BOOKING_PAID:3','BOOKING_PAID',NULL,NULL,'2',3,'BOOKING','2026-07-14 22:18:54.540517','SENT','Vé đã được thanh toán','2026-07-14 22:18:54.598138',2);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'notification_db'
--

--
-- Dumping routines for database 'notification_db'
--

--
-- Current Database: `media_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `media_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `media_db`;

--
-- Table structure for table `media_assets`
--

DROP TABLE IF EXISTS `media_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_assets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `alt_text` varchar(255) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `checksum_sha256` varchar(64) NOT NULL,
  `content_type` varchar(100) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `owner_id` bigint NOT NULL,
  `public_url` varchar(500) NOT NULL,
  `size_bytes` bigint NOT NULL,
  `status` varchar(20) NOT NULL,
  `storage_path` varchar(700) NOT NULL,
  `storage_type` varchar(20) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK56tj3dqn83vm12vy803osacre` (`stored_name`),
  KEY `idx_media_owner` (`owner_id`),
  KEY `idx_media_category` (`category`),
  KEY `idx_media_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_assets`
--

LOCK TABLES `media_assets` WRITE;
/*!40000 ALTER TABLE `media_assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'media_db'
--

--
-- Dumping routines for database 'media_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-15 12:27:22
