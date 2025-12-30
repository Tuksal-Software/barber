# Failed Migration Resolve Talimatları

## 🔍 Durum

DB'de `20251226174244_initial_schema` migration'ı failed durumda. Bu yüzden yeni migration'lar uygulanamıyor.

## ✅ Çözüm

### Yöntem 1: Prisma Migrate Resolve (ÖNERİLEN)

Migration dosyası local'de olmadığı için, Prisma resolve komutu çalışmayabilir. Bu durumda:

```bash
# Önce migration'ı DB'de applied olarak işaretle
mysql -h [HOST] -u [USER] -p [DATABASE] < prisma/migrations/resolve_failed_migration.sql
```

### Yöntem 2: Manuel SQL

```sql
-- Failed migration'ı applied olarak işaretle
UPDATE _prisma_migrations
SET 
    finished_at = NOW(),
    rolled_back_at = NULL,
    applied_steps_count = 1
WHERE 
    migration_name = '20251226174244_initial_schema'
    AND finished_at IS NULL;
```

### Yöntem 3: Tüm DB Migration'larını Baseline Olarak İşaretle

Eğer DB zaten doğru şemada ise ve tüm migration'lar uygulanmışsa:

```sql
-- Tüm migration'ları applied olarak işaretle
UPDATE _prisma_migrations
SET 
    finished_at = COALESCE(finished_at, NOW()),
    rolled_back_at = NULL,
    applied_steps_count = COALESCE(applied_steps_count, 1)
WHERE 
    finished_at IS NULL;
```

## 🔍 Doğrulama

```bash
npx prisma migrate status
```

Beklenen:
- `20251226174244_initial_schema` → Applied
- `0002_add_service_type` → Pending

## 🚀 Sonraki Adım

Resolve işlemi tamamlandıktan sonra:

```bash
npx prisma migrate deploy
```

Bu komut `0002_add_service_type` migration'ını uygulayacak.


