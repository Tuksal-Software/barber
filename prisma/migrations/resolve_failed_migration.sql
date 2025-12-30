-- Failed Migration Resolve Script
-- Bu script DB'deki failed migration'ı resolve eder

-- 1. Failed migration'ı kontrol et
SELECT 
    migration_name,
    finished_at,
    rolled_back_at,
    logs
FROM 
    _prisma_migrations
WHERE 
    migration_name = '20251226174244_initial_schema';

-- 2. Eğer migration failed ise, applied olarak işaretle
UPDATE _prisma_migrations
SET 
    finished_at = NOW(),
    rolled_back_at = NULL,
    applied_steps_count = 1
WHERE 
    migration_name = '20251226174244_initial_schema'
    AND finished_at IS NULL;

-- 3. Sonucu kontrol et
SELECT 
    migration_name,
    finished_at,
    rolled_back_at,
    applied_steps_count
FROM 
    _prisma_migrations
WHERE 
    migration_name = '20251226174244_initial_schema';


