-- Migration kaydını manuel oluştur
-- Bu script'i QA DB'de çalıştırın

-- _prisma_migrations tablosu yoksa oluştur
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` VARCHAR(36) PRIMARY KEY,
  `checksum` VARCHAR(64),
  `finished_at` DATETIME,
  `migration_name` VARCHAR(255),
  `logs` TEXT,
  `rolled_back_at` DATETIME,
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `applied_steps_count` INT DEFAULT 0
);

-- Migration kaydını ekle
INSERT INTO `_prisma_migrations` (
  `id`,
  `migration_name`,
  `finished_at`,
  `applied_steps_count`
) VALUES (
  UUID(),
  '0001_init',
  NOW(),
  1
);

