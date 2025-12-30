-- Failed Migration Resolve Script (COMPLETE)
-- Bu script DB'deki failed migration'ı resolve eder ve yeni migration'ların uygulanmasını sağlar

-- ADIM 1: Failed migration'ı kontrol et
SELECT 
    migration_name,
    finished_at,
    rolled_back_at,
    applied_steps_count,
    logs
FROM 
    _prisma_migrations
WHERE 
    migration_name = '20251226174244_initial_schema';

-- ADIM 2: Eğer migration failed ise (finished_at IS NULL), applied olarak işaretle
UPDATE _prisma_migrations
SET 
    finished_at = NOW(),
    rolled_back_at = NULL,
    applied_steps_count = COALESCE(applied_steps_count, 1)
WHERE 
    migration_name = '20251226174244_initial_schema'
    AND finished_at IS NULL;

-- ADIM 3: Sonucu kontrol et
SELECT 
    migration_name,
    finished_at,
    rolled_back_at,
    applied_steps_count,
    CASE 
        WHEN finished_at IS NOT NULL THEN 'RESOLVED - Applied'
        WHEN rolled_back_at IS NOT NULL THEN 'Rolled Back'
        ELSE 'Still Failed'
    END AS status
FROM 
    _prisma_migrations
WHERE 
    migration_name = '20251226174244_initial_schema';

-- ADIM 4: Tüm failed migration'ları kontrol et (opsiyonel)
SELECT 
    migration_name,
    finished_at,
    rolled_back_at
FROM 
    _prisma_migrations
WHERE 
    finished_at IS NULL
    AND rolled_back_at IS NULL
ORDER BY 
    migration_name;


