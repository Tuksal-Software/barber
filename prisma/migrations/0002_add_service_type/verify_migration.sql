-- Migration Doğrulama Scripti
-- Bu script'i DB'de çalıştırarak migration'ın uygulanıp uygulanmadığını kontrol edin

-- 1. Kolonun varlığını kontrol et
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointment_requests'
    AND COLUMN_NAME = 'serviceType';

-- Beklenen çıktı:
-- COLUMN_NAME: serviceType
-- COLUMN_TYPE: enum('SAC','SAKAL','SAC_SAKAL')
-- IS_NULLABLE: YES
-- COLUMN_DEFAULT: NULL

-- 2. Eğer kolon yoksa, migration'ı uygula:
-- ALTER TABLE `appointment_requests` ADD COLUMN `serviceType` ENUM('SAC', 'SAKAL', 'SAC_SAKAL') NULL;

-- 3. Mevcut kayıtların serviceType değerlerini kontrol et
SELECT 
    COUNT(*) as total_records,
    COUNT(serviceType) as records_with_service_type,
    COUNT(*) - COUNT(serviceType) as records_with_null_service_type
FROM 
    appointment_requests;

-- Beklenen: Tüm mevcut kayıtlar serviceType = NULL olmalı


