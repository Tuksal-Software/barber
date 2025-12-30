# Migration 0002: Add serviceType to appointment_requests

## 📋 Migration Detayları

**Dosya:** `prisma/migrations/0002_add_service_type/migration.sql`

**Amaç:** `appointment_requests` tablosuna `serviceType` kolonu eklemek

**Değişiklik:**
- Yeni kolon: `serviceType` (ENUM: 'SAC', 'SAKAL', 'SAC_SAKAL')
- Nullable: ✅ YES
- Default: NULL
- Mevcut kayıtlar: Etkilenmez (serviceType = NULL)

## ✅ Migration Dosyası Kontrolü

Migration dosyası mevcut ve doğru:

```sql
ALTER TABLE `appointment_requests` 
ADD COLUMN `serviceType` ENUM('SAC', 'SAKAL', 'SAC_SAKAL') NULL;
```

## 🚀 Uygulama

### Yöntem 1: Prisma Migrate Deploy (ÖNERİLEN)

```bash
npx prisma migrate deploy
```

### Yöntem 2: Güvenli SQL Script

```bash
mysql -h [HOST] -u [USER] -p [DATABASE] < prisma/migrations/0002_add_service_type/apply_safe.sql
```

### Yöntem 3: Manuel SQL

```sql
ALTER TABLE `appointment_requests` 
ADD COLUMN `serviceType` ENUM('SAC', 'SAKAL', 'SAC_SAKAL') NULL;
```

## 🔍 Doğrulama

### 1. Kolon Kontrolü

```sql
DESCRIBE appointment_requests;
```

Beklenen çıktı:
```
serviceType | enum('SAC','SAKAL','SAC_SAKAL') | YES | NULL | NULL
```

### 2. Mevcut Kayıt Kontrolü

```sql
SELECT 
    COUNT(*) as total,
    COUNT(serviceType) as with_type,
    COUNT(*) - COUNT(serviceType) as null_type
FROM appointment_requests;
```

Beklenen: Tüm mevcut kayıtlar `serviceType = NULL`

### 3. Prisma Client

```bash
npx prisma generate
npm run build
```

Build hatasız geçmeli.

## ⚠️ ÖNEMLİ NOTLAR

1. **Canlı Sistem:** Bu migration canlı sistemde uygulanacak
2. **Geriye Uyumluluk:** Mevcut kayıtlar etkilenmez (serviceType = NULL)
3. **Güvenlik:** Migration NULLABLE, DEFAULT yok, mevcut veriler korunuyor
4. **Idempotent:** `apply_safe.sql` scripti tekrar çalıştırılabilir

## 📝 Dosyalar

- `migration.sql` - Ana migration dosyası
- `apply_safe.sql` - Güvenli uygulama scripti (kolon kontrolü ile)
- `verify_migration.sql` - Doğrulama scripti
- `APPLY_MIGRATION.md` - Detaylı uygulama talimatları


