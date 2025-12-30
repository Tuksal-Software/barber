# Migration Uygulama Talimatları

## ⚠️ KRİTİK: Canlı Sistem

Bu migration canlı sistemde uygulanacak. Aşağıdaki adımları **SIRASIYLA** takip edin.

## 📋 Ön Kontrol

1. **Migration dosyası kontrolü:**
   ```bash
   cat prisma/migrations/0002_add_service_type/migration.sql
   ```
   
   Beklenen içerik:
   ```sql
   ALTER TABLE `appointment_requests` ADD COLUMN `serviceType` ENUM('SAC', 'SAKAL', 'SAC_SAKAL') NULL;
   ```

2. **DB'de kolon kontrolü:**
   ```sql
   DESCRIBE appointment_requests;
   ```
   
   Eğer `serviceType` kolonu görünmüyorsa, migration uygulanmamış demektir.

## 🚀 Migration Uygulama

### Yöntem 1: Prisma Migrate Deploy (ÖNERİLEN)

```bash
npx prisma migrate deploy
```

Bu komut:
- ✅ Sadece uygulanmamış migration'ları çalıştırır
- ✅ `_prisma_migrations` tablosunu günceller
- ✅ Güvenli ve idempotent

### Yöntem 2: Manuel SQL (Alternatif)

Eğer `prisma migrate deploy` çalışmazsa:

1. **DB bağlantısı kur:**
   ```bash
   mysql -h [HOST] -u [USER] -p [DATABASE]
   ```

2. **Migration'ı uygula:**
   ```sql
   ALTER TABLE `appointment_requests` 
   ADD COLUMN `serviceType` ENUM('SAC', 'SAKAL', 'SAC_SAKAL') NULL;
   ```

3. **Migration kaydını ekle:**
   ```sql
   INSERT INTO `_prisma_migrations` (
       `id`,
       `migration_name`,
       `finished_at`,
       `applied_steps_count`,
       `checksum`
   ) VALUES (
       UUID(),
       '0002_add_service_type',
       NOW(),
       1,
       SHA2('ALTER TABLE `appointment_requests` ADD COLUMN `serviceType` ENUM(\'SAC\', \'SAKAL\', \'SAC_SAKAL\') NULL;', 256)
   );
   ```

## ✅ Doğrulama

1. **Kolon kontrolü:**
   ```sql
   DESCRIBE appointment_requests;
   ```
   
   `serviceType` kolonu görünmeli:
   - Type: `enum('SAC','SAKAL','SAC_SAKAL')`
   - Null: `YES`
   - Default: `NULL`

2. **Mevcut kayıt kontrolü:**
   ```sql
   SELECT COUNT(*) as total, COUNT(serviceType) as with_type 
   FROM appointment_requests;
   ```
   
   Tüm mevcut kayıtlar `serviceType = NULL` olmalı.

3. **Prisma Client kontrolü:**
   ```bash
   npx prisma generate
   npm run build
   ```
   
   Build hatasız geçmeli.

4. **Test:**
   - Customer randevu oluştur
   - DB'de `serviceType` değerinin yazıldığını kontrol et
   - Eski randevular `serviceType = NULL` kalmalı

## 🔍 Sorun Giderme

### Kolon zaten varsa
```sql
-- Kolonun varlığını kontrol et
SHOW COLUMNS FROM appointment_requests LIKE 'serviceType';

-- Eğer varsa ve farklı tipte ise:
ALTER TABLE `appointment_requests` 
MODIFY COLUMN `serviceType` ENUM('SAC', 'SAKAL', 'SAC_SAKAL') NULL;
```

### Migration kaydı eksikse
```sql
-- Migration kaydını kontrol et
SELECT * FROM `_prisma_migrations` 
WHERE `migration_name` = '0002_add_service_type';

-- Eğer yoksa, yukarıdaki "Manuel SQL" adımındaki INSERT'i çalıştır
```

## 📝 Notlar

- ✅ Migration **NULLABLE** - Mevcut kayıtlar etkilenmez
- ✅ Migration **DEFAULT YOK** - Güvenli
- ✅ Migration **IDEMPOTENT** - Tekrar çalıştırılabilir (kolon varsa hata vermez, ama kontrol edin)
- ⚠️ Canlı sistemde **BACKUP** alın (önerilir)


