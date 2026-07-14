USE `user_db`;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `email_verified` bit(1) DEFAULT b'1',
  ADD COLUMN IF NOT EXISTS `email_verification_token` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `email_verification_token_expires_at` datetime(6) DEFAULT NULL;

UPDATE `users`
SET `email_verified` = b'1'
WHERE `email_verified` IS NULL;
