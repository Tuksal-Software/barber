<div align="center">
  <img src="public/logo.png" alt="The Mens Hair Logo" width="120" height="120">
  
  # 💈 The Mens Hair
  
  ### Profesyonel Erkek Kuaförlük & Randevu Yönetim Sistemi
  
  Modern, kullanıcı dostu ve tam özellikli berber salonu web sitesi ve randevu yönetim platformu
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.15-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  
  [Demo](#) • [Dokümantasyon](#) • [Hata Bildir](../../issues)
</div>

---

## 📋 İçindekiler

- [Genel Bakış](#-genel-bakış)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#️-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Proje Yapısı](#-proje-yapısı)
- [Veritabanı Şeması](#-veritabanı-şeması)
- [API Endpoints](#-api-endpoints)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Katkıda Bulunma](#-katkıda-bulunma)

---

## 🎯 Genel Bakış

**The Mens Hair**, modern berber salonları için geliştirilmiş, tam özellikli bir web uygulaması ve randevu yönetim sistemidir. Müşterilerin online randevu almasından, admin panelinde randevu yönetimine kadar tüm süreçleri kapsar.

### 🎪 Temel Özellikler

- 🗓️ **Akıllı Randevu Sistemi** - Step-by-step wizard ile kolay randevu alma
- 👨‍💼 **Admin Paneli** - Randevu, berber ve performans yönetimi
- 📱 **Responsive Tasarım** - Tüm cihazlarda mükemmel çalışır
- 🎨 **Modern UI/UX** - Shadcn/UI ve Tailwind CSS ile şık arayüz
- ⚡ **Hızlı & Performanslı** - Next.js 15 App Router ile optimize edilmiş

---

## ✨ Özellikler

### 👥 Müşteri Özellikleri

- ✅ **Online Randevu Alma**
  - 4 adımlı basit randevu sihirbazı
  - Berber seçimi (deneyim, rating, müsaitlik)
  - Tarih ve saat seçimi (30 günlük ileri tarih limiti)
  - Gerçek zamanlı müsaitlik kontrolü
  - Konfetti animasyonlu onay ekranı

- ✅ **Dinamik Çalışma Saatleri**
  - Berber bazlı haftalık çalışma programları
  - Özel tarihler için override mekanizması
  - Otomatik müsaitlik hesaplama

- ✅ **Görsel ve İçerik**
  - Modern anasayfa (Hero, About, Why Us, CTA)
  - Hakkımızda sayfası (Hikaye, Misyon, Vizyon)
  - İletişim sayfası (Form, Bilgiler, Google Maps)
  - Responsive galeri sistemi

### 🔐 Admin Özellikleri

- ✅ **Dashboard**
  - Günlük/haftalık randevu istatistikleri
  - Berber performans metrikleri
  - Son randevular listesi
  - Hızlı status güncelleme

- ✅ **Berber Yönetimi**
  - Berber ekleme/düzenleme
  - Çalışma saatleri düzenleme (günlük bazda)
  - Slot süresi ayarlama (15/30/60 dk)
  - Aktif/Pasif durum yönetimi
  - Role-based filtering (sadece barber'lar)

- ✅ **Randevu Yönetimi**
  - Haftalık takvim görünümü
  - Randevu detayları modal
  - Status güncelleme (Beklemede/Onaylandı/Tamamlandı/İptal Edildi)
  - Not ekleme ve düzenleme
  - Berber bazlı filtreleme
  - İptal edilmiş randevular tracking

- ✅ **Akıllı Özellikler**
  - İptal edilen randevular admin'de görünür ama slot boşalır
  - Geçmiş saatler otomatik devre dışı
  - Çift rezervasyon önleme
  - Gerçek zamanlı veri senkronizasyonu

---

## 🛠️ Teknoloji Stack

### Frontend
- **Framework:** Next.js 15.5 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.3
- **UI Components:** Shadcn/UI (Radix UI)
- **Icons:** Lucide React
- **Form Management:** React Hook Form + Zod
- **Date Handling:** date-fns
- **Notifications:** Sonner
- **Animations:** Canvas Confetti

### Backend
- **Database ORM:** Prisma 6.15
- **Database:** MySQL (Production) / SQLite (Development)
- **Authentication:** bcryptjs
- **API:** Next.js Server Actions & Route Handlers
- **Validation:** Zod Schema Validation

### Development
- **Package Manager:** npm
- **Linter:** ESLint
- **Type Checking:** TypeScript
- **Dev Server:** Turbopack (Next.js 15)

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- MySQL (production) veya SQLite (development)

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/Tuksal-Software/barber.git
cd barber
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Değişkenlerini Ayarlayın

`.env` dosyası oluşturun:

```env
# Database (MySQL - Production)
DATABASE_URL="mysql://username:password@localhost:3306/barber_db"

# Database (SQLite - Development)
# DATABASE_URL="file:./prisma/dev.db"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 4. Veritabanını Hazırlayın

```bash
# Prisma client generate
npx prisma generate

# Database migration
npx prisma migrate dev --name init

# Seed data (opsiyonel)
npm run db:seed
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

---

## 📖 Kullanım

### Müşteri Tarafı

1. **Anasayfa**: `http://localhost:3000`
2. **Randevu Al**: `http://localhost:3000/randevu-al`
3. **Hakkımızda**: `http://localhost:3000/hakkimizda`
4. **İletişim**: `http://localhost:3000/iletisim`

### Admin Paneli

1. **Login**: `http://localhost:3000/admin/login`
   - **Email**: `buraksirin@themenshair.com`
   - **Şifre**: `sirinburak1712`

2. **Dashboard**: `http://localhost:3000/admin`
3. **Berberler**: `http://localhost:3000/admin/berberler`
4. **Randevular**: `http://localhost:3000/admin/randevular`

---

## 📁 Proje Yapısı

```
barber/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts               # Seed data
│   └── dev.db                # SQLite database (dev)
│
├── public/
│   ├── logo.png              # Site logosu
│   ├── hero.jpg              # Ana sayfa hero görseli
│   └── about.jpg             # Hakkımızda görseli
│
├── src/
│   ├── app/
│   │   ├── (public)/         # Public sayfalar
│   │   │   ├── page.tsx      # Anasayfa
│   │   │   ├── hakkimizda/   # Hakkımızda
│   │   │   ├── iletisim/     # İletişim
│   │   │   └── randevu-al/   # Randevu alma wizard
│   │   │
│   │   ├── (admin)/          # Admin paneli
│   │   │   └── admin/
│   │   │       ├── page.tsx           # Dashboard
│   │   │       ├── berberler/         # Berber yönetimi
│   │   │       ├── randevular/        # Randevu yönetimi
│   │   │       └── components/        # Admin components
│   │   │
│   │   ├── (auth)/           # Authentication
│   │   │   └── admin/login/  # Admin login
│   │   │
│   │   ├── api/              # API routes
│   │   │   ├── appointments/ # Randevu API
│   │   │   ├── auth/         # Auth API
│   │   │   └── barbers/      # Berber API
│   │   │
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   │
│   ├── components/
│   │   ├── ui/               # Shadcn/UI components
│   │   ├── home/             # Anasayfa components
│   │   ├── public/           # Public components
│   │   └── shared/           # Paylaşılan components
│   │
│   ├── lib/
│   │   ├── actions/          # Server actions
│   │   │   ├── appointment.ts
│   │   │   ├── barber.actions.ts
│   │   │   └── dashboard.ts
│   │   ├── prisma.ts         # Prisma client
│   │   ├── utils.ts          # Utility functions
│   │   └── mock-data.ts      # Mock data
│   │
│   └── types/
│       └── index.ts          # TypeScript types
│
└── package.json
```

---

## 🗄️ Veritabanı Şeması

### Ana Modeller

#### Barber (Berberler)
```prisma
model Barber {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  password     String
  role         String   @default("barber")  // "admin" | "barber"
  experience   Int      @default(0)
  rating       Decimal  @default(5.0)
  specialties  String?
  image        String?
  slotDuration Int      @default(30)        // 15 | 30 | 60
  isActive     Boolean  @default(true)
}
```

#### Appointment (Randevular)
```prisma
model Appointment {
  id            String   @id @default(cuid())
  customerName  String
  customerPhone String
  customerEmail String?
  barberId      String
  date          DateTime
  startTime     String
  endTime       String
  status        String   @default("pending") // pending | confirmed | completed | cancelled
  notes         String?
}
```

#### WorkingHour (Çalışma Saatleri)
```prisma
model WorkingHour {
  id        String   @id @default(cuid())
  barberId  String
  dayOfWeek Int      // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  startTime String
  endTime   String
  isWorking Boolean  @default(true)
}
```

**Diğer Modeller:** `BarberSchedule`, `SiteSettings`, `AppointmentSettings`, `GalleryImage`

---

## 🔌 API Endpoints

### Public API

```typescript
// Berber müsaitlik kontrolü
GET /api/barbers/[id]/availability?date=2024-01-15

// Randevu oluşturma
POST /api/appointments
{
  "barberId": "...",
  "date": "2024-01-15",
  "startTime": "10:00",
  "customerName": "...",
  "customerPhone": "..."
}
```

### Admin API

```typescript
// Randevu güncelleme
PATCH /api/appointments/[id]
{
  "status": "confirmed",
  "notes": "Özel not..."
}

// Randevu silme
DELETE /api/appointments/[id]
```

### Server Actions

```typescript
// Berber işlemleri
getBarbers()                    // Sadece role='barber' olanlar
getActiveBarbers()              // Aktif barberlar
createBarber(data)              // Yeni berber
updateBarber(id, data)          // Berber güncelleme
toggleBarberStatus(id)          // Aktif/Pasif

// Randevu işlemleri
createAppointment(data)         // Yeni randevu
getAvailableSlots(barberId, date) // Müsait saatler
updateAppointmentStatus(id, status, notes) // Güncelleme
getAppointmentsByWeek(date, barberId) // Haftalık randevular

// Dashboard işlemleri
getDashboardStats()             // İstatistikler
getBarberPerformance()          // Berber performansı
getRecentAppointments()         // Son randevular
```

---

## 🎨 Özellik Detayları

### Randevu Alma Süreci

```
1. Berber Seçimi
   └─> Sadece aktif ve role='barber' olan berberler listelenir
   
2. Tarih & Saat Seçimi
   └─> Berberin çalışma saatleri kontrol edilir
   └─> Dolu slotlar disabled gösterilir
   └─> İptal edilen randevu slotları boş sayılır
   
3. Müşteri Bilgileri
   └─> Form validation (Zod schema)
   
4. Onay & Konfeti 🎉
   └─> Başarılı randevu kaydı
```

### Admin Paneli İşlevleri

#### Dashboard
- Bugünkü ve haftalık randevu sayıları
- Trend göstergeleri (↑↓)
- Berber performans kartları
- Son randevular tablosu
- Hızlı status güncelleme dropdown

#### Berber Yönetimi
- Berber ekleme (otomatik role='barber', varsayılan değerler)
- Profil bilgileri düzenleme
- Haftalık çalışma saatleri ayarlama (gün bazlı)
- Slot süresi belirleme (15/30/60 dk)
- Aktif/Pasif durum toggle

#### Randevu Yönetimi
- Haftalık takvim görünümü
- Berber bazlı filtreleme
- Detaylı randevu modal
- Status ve not güncelleme
- İptal edilen randevular izleme (gri + strikethrough)

### Akıllı Özellikler

- **Çift Rezervasyon Önleme**: Aynı saatte birden fazla randevu alınamaz
- **Geçmiş Saat Kontrolü**: Bugün için geçmiş saatler disable
- **İptal Yönetimi**: İptal edilen randevular admin'de görünür, slot boşalır
- **Otomatik Validasyon**: Telefon numarası, email formatları kontrol edilir
- **Real-time Güncelleme**: Status değişiklikleri anında yansır

---

## 💻 Kullanılabilir Komutlar

```bash
# Geliştirme
npm run dev              # Development server (Turbopack)
npm run build            # Production build
npm start                # Production server
npm run lint             # ESLint kontrolü
npm run type-check       # TypeScript kontrolü

# Database
npm run db:seed          # Seed data ekle
npm run db:studio        # Prisma Studio aç
npm run db:reset         # Database sıfırla ve seed

# Prisma
npx prisma generate      # Client generate
npx prisma migrate dev   # Migration oluştur
npx prisma studio        # Database GUI
```

---

## 🌐 Environment Variables

Gerekli environment değişkenleri:

```env
# Database Connection
DATABASE_URL="mysql://user:password@localhost:3306/barber_db"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

---

## 📸 Ekran Görüntüleri

### Müşteri Arayüzü
- **Anasayfa**: Modern hero section, hakkımızda bölümü
- **Randevu Alma**: 4 adımlı wizard, progress bar
- **Responsive Tasarım**: Mobile & desktop optimize

### Admin Paneli
- **Dashboard**: Metrikler, grafikler, son aktiviteler
- **Takvim**: Haftalık grid view, renk kodlu berberler
- **Yönetim**: Modal'lar, dropdown'lar, form'lar

---

## 🔒 Güvenlik

- ✅ Password hashing (bcryptjs)
- ✅ Input validation (Zod schemas)
- ✅ SQL Injection koruması (Prisma ORM)
- ✅ XSS koruması (React)
- ✅ CSRF koruması (Next.js)

---

## 🚦 Status Değerleri

Randevu durumları:

| Status | Türkçe | Açıklama |
|--------|---------|----------|
| `pending` | Beklemede | Yeni oluşturulan randevu |
| `confirmed` | Onaylandı | Admin tarafından onaylandı |
| `completed` | Tamamlandı | Hizmet tamamlandı |
| `cancelled` | İptal Edildi | İptal edildi (slot boşalır) |

---

## 🎯 Gelecek Özellikler

- [ ] WhatsApp entegrasyonu (randevu bildirimleri)
- [ ] SMS/Email otomasyonu
- [ ] Online ödeme sistemi
- [ ] Müşteri yorumları ve rating
- [ ] Loyalty program
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Analytics dashboard
- [ ] Export/Report özelliği

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. **Fork** edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. **Pull Request** açın

### Commit Kuralları

Conventional Commits formatını kullanıyoruz:

```
feat(scope): yeni özellik
fix(scope): hata düzeltme
refactor(scope): kod iyileştirme
style(scope): görsel değişiklik
chore(scope): genel düzenleme
remove(scope): özellik kaldırma
```

---

## 📝 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

---

## 👨‍💻 Geliştirici

**Tuksal Software**

- 🌐 Website: [tuksal.com](https://tuksal.com)
- 📧 Email: info@tuksal.com
- 🔗 GitHub: [@Tuksal-Software](https://github.com/Tuksal-Software)

---

## 🙏 Teşekkürler

Bu projede kullanılan harika teknolojiler:

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn/UI](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives

---

<div align="center">
  
  ### 💈 The Mens Hair
  
  **Profesyonel Berber Hizmetleri | Modern Randevu Sistemi**
  
  Made with ❤️ by Tuksal Software
  
  [⬆ Başa Dön](#-the-mens-hair)
  
</div>
