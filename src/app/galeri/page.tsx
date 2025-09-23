'use client'

import { useState } from 'react'
import { mockGalleryImages } from '@/lib/mock-data'
import { Search, Filter, Image as ImageIcon } from 'lucide-react'

export default function GaleriPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü')
  const [searchTerm, setSearchTerm] = useState('')

  // Kategorileri al
  const categories = ['Tümü', ...Array.from(new Set(mockGalleryImages.map(img => img.category)))]

  // Filtreleme
  const filteredImages = mockGalleryImages.filter(img => {
    const matchesCategory = selectedCategory === 'Tümü' || img.category === selectedCategory
    const matchesSearch = img.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         img.alt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Galeri
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
            Salonumuzdan ve çalışmalarımızdan örnekler. 
            Kalitemizi gözler önüne seriyoruz.
          </p>
        </div>
      </section>

      {/* Filtreler ve Arama */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Kategori Filtreleri */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Fotoğraf ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Galeri Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          {filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-24 h-24 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                Fotoğraf Bulunamadı
              </h3>
              <p className="text-slate-500">
                Arama kriterlerinize uygun fotoğraf bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Image Placeholder */}
                  <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {image.category}
                    </div>

                    {/* Date Badge */}
                    <div className="absolute top-4 right-4 bg-white text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {new Date(image.createdAt).toLocaleDateString('tr-TR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-slate-600 transition-colors">
                      {image.title || image.alt}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {image.alt}
                    </p>
                    
                    {/* Category */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                        {image.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(image.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      Büyüt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Galeri İstatistikleri
            </h2>
            <p className="text-xl text-slate-600">
              Salonumuzun zengin görsel içeriği
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {mockGalleryImages.length}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Toplam Fotoğraf</h3>
              <p className="text-slate-600">Kaliteli görseller</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {categories.length - 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Kategori</h3>
              <p className="text-slate-600">Farklı alanlar</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {Math.floor(mockGalleryImages.length / 2)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Çalışma</h3>
              <p className="text-slate-600">Profesyonel işler</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {Math.floor(mockGalleryImages.length / 3)}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Salon</h3>
              <p className="text-slate-600">Ortam görselleri</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Tarzınızı Yansıtın
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Galerimizdeki örneklerden ilham alın ve 
            kendi tarzınızı oluşturun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-slate-600 hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Randevu Al
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-slate-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              İletişime Geç
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
