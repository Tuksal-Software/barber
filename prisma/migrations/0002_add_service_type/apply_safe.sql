-- Güvenli Migration Uygulama Scripti
-- Bu script kolonun zaten var olup olmadığını kontrol eder

-- 1. Kolonun varlığını kontrol et ve yoksa ekle
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointment_requests'
    AND COLUMN_NAME = 'serviceType'
);

-- 2. Eğer kolon yoksa, ekle
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `appointment_requests` ADD COLUMN `serviceType` ENUM(\'SAC\', \'SAKAL\', \'SAC_SAKAL\') NULL;',
    'SELECT "Column serviceType already exists, skipping migration" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Sonucu göster
SELECT 
    CASE 
        WHEN @column_exists = 0 THEN 'Column serviceType added successfully'
        ELSE 'Column serviceType already exists'
    END AS migration_status;


