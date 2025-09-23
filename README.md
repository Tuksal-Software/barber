# Elite Berber Salonu - Web Sitesi ve Randevu Sistemi

Modern, responsive berber salonu web sitesi ve randevu sistemi. Next.js 14+ (App Router), shadcn/ui, Tailwind CSS ve Prisma ORM kullanılarak geliştirilmiştir.

## 🚀 **Proje Durumu**

### ✅ **Tamamlanan Özellikler (Faz 1)**
- [x] **Ana Sayfa** - Hero section, hizmetler preview, berberler preview
- [x] **Hakkımızda Sayfası** - Salon hikayesi, misyon/vizyon, ekip
- [x] **Hizmetler Sayfası** - Kategoriler, fiyat listesi, detaylar
- [x] **Galeri Sayfası** - Masonry layout, filtreleme, arama
- [x] **İletişim Sayfası** - Form, bilgiler, harita placeholder
- [x] **Responsive Tasarım** - Mobile-first yaklaşım
- [x] **Modern UI/UX** - Sade slate tema, smooth animasyonlar
s
### ✅ **Tamamlanan Özellikler (Faz 2)**
- [x] **Randevu Sistemi** - Step-by-step wizard
- [x] **Hizmet Seçimi** - Kategori filtreleme, detaylı bilgiler
- [x] **Berber Seçimi** - Deneyim, puan, uzmanlık alanları
- [x] **Tarih & Saat Seçimi** - 30 günlük limit, saat slotları
- [x] **Müşteri Bilgileri** - Form validation, Türkçe UX
- [x] **Randevu Onayı** - Detaylı özet, önemli bilgiler
- [x] **Prisma Şeması** - Veritabanı modelleri hazır

### 🔄 **Devam Eden Geliştirmeler**
- [ ] **Backend API** - Server actions, form handling
- [ ] **Veritabanı Entegrasyonu** - PostgreSQL/SQLite
- [ ] **Admin Panel** - Dashboard, randevu yönetimi
- [ ] **Galeri Yönetimi** - Upload, kategoriler
- [ ] **WhatsApp Entegrasyonu** - Randevu paylaşımı

## 🛠️ **Teknolojiler**

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Prisma ORM, PostgreSQL/SQLite
- **Icons**: Lucide React
- **Development**: ESLint, Prettier, Turbopack

## 📁 **Proje Yapısı**

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Ana sayfa
│   ├── hakkimizda/        # Hakkımızda sayfası
│   ├── hizmetler/         # Hizmetler sayfası
│   ├── galeri/            # Galeri sayfası
│   ├── iletisim/          # İletişim sayfası
│   └── randevu/           # Randevu sayfası
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── shared/            # Paylaşılan components
│   └── public/            # Public sayfa components
│       └── appointment/   # Randevu sistemi components
├── lib/                   # Utility functions
│   ├── utils.ts           # Helper functions
│   ├── prisma.ts          # Prisma client
│   └── mock-data.ts       # Mock data
├── types/                 # TypeScript interfaces
└── prisma/                # Database schema
    └── schema.prisma      # Prisma models
```

## 🚀 **Kurulum**

### 1. **Bağımlılıkları Yükleyin**
```bash
npm install
```

### 2. **Environment Dosyası Oluşturun**
`.env` dosyası oluşturun:
```env
# PostgreSQL (Development)
DATABASE_URL="postgresql://username:password@localhost:5432/barber_salon?schema=public"

# SQLite (Alternative)
# DATABASE_URL="file:./dev.db"

NODE_ENV="development"
```

### 3. **Veritabanını Hazırlayın**
```bash
# Prisma client oluşturun
npx prisma generate

# Veritabanı migration'ı çalıştırın
npx prisma migrate dev --name init

# (Opsiyonel) Seed data ekleyin
npx prisma db seed
```

### 4. **Geliştirme Sunucusunu Başlatın**
```bash
npm run dev
```

Proje `http://localhost:3000` adresinde çalışacaktır.

## 📱 **Özellikler**

### **Randevu Sistemi**
- **5 Adımlı Wizard**: Hizmet → Berber → Tarih/Saat → Bilgiler → Onay
- **Akıllı Filtreleme**: Hizmet bazlı berber seçimi
- **Tarih Limiti**: Sadece 30 gün sonrasına randevu
- **Saat Slotları**: XX:00-YY:00 formatında, 1 saat aralıklarla
- **Form Validation**: Türkçe telefon numarası, zorunlu alanlar

### **Responsive Tasarım**
- **Mobile-First**: Tüm cihazlarda optimize
- **Hamburger Menu**: Mobil navigasyon
- **Touch-Friendly**: Dokunmatik cihazlar için optimize
- **Modern UI**: Sade slate tema, smooth animasyonlar

### **SEO Optimizasyonu**
- **Meta Tags**: Türkçe açıklamalar
- **Semantic HTML**: Anlamlı markup
- **Performance**: Fast loading, optimized images
- **Accessibility**: Screen reader desteği

## 🎨 **Tema ve Renkler**

- **Ana Renk**: `slate-600`, `slate-700`, `slate-800`
- **Vurgu**: `slate-300`, `slate-400`, `slate-500`
- **Arka Plan**: `slate-50`, `slate-100`, `slate-200`
- **Metin**: `slate-600`, `slate-700`, `slate-800`, `slate-900`

## 🔧 **Geliştirme Komutları**

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

## 📊 **Veritabanı Modelleri**

### **Ana Modeller**
- **Service**: Hizmet bilgileri, fiyat, süre
- **Barber**: Berber profili, deneyim, uzmanlık
- **Appointment**: Randevu detayları, müşteri bilgileri
- **WorkingHour**: Çalışma saatleri, müsaitlik
- **GalleryImage**: Galeri görselleri, kategoriler
- **SiteSettings**: Site ayarları, iletişim bilgileri

## 🚧 **Sonraki Adımlar**

### **Faz 3: Admin Panel**
- [ ] Dashboard ve istatistikler
- [ ] Randevu yönetimi (CRUD)
- [ ] Berber yönetimi
- [ ] Galeri yönetimi
- [ ] Site ayarları

### **Faz 4: Gelişmiş Özellikler**
- [ ] WhatsApp entegrasyonu
- [ ] SMS/Email bildirimleri
- [ ] Online ödeme
- [ ] Müşteri yorumları
- [ ] Loyalty program

## 🤝 **Katkıda Bulunma**

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 **Lisans**

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 **İletişim**

Proje hakkında sorularınız için issue açabilir veya pull request gönderebilirsiniz.

---

**Elite Berber Salonu** - Modern ve profesyonel berber hizmetleri 🚀
