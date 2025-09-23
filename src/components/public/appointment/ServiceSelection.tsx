'use client'
import { useState } from 'react'
import { Service } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Scissors, Clock, Star, CheckCircle } from 'lucide-react'

interface ServiceSelectionProps {
  services: Service[]
  selectedService?: Service
  onServiceSelect: (service: Service) => void
}

export default function ServiceSelection({ services, selectedService, onServiceSelect }: ServiceSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü')
  
  // Kategorileri al
  const categories = ['Tümü', ...Array.from(new Set(services.map(service => service.category)))]
  
  // Seçilen kategoriye göre hizmetleri filtrele
  const filteredServices = services.filter(service => 
    selectedCategory === 'Tümü' || service.category === selectedCategory
  )

  return (
    <div className="space-y-8">
      {/* Kategori Filtreleri */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hizmet Kategorisi</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Hizmet Listesi */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hizmet Seçin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedService?.id === service.id
                  ? 'border-slate-600 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{service.name}</h4>
                    <p className="text-sm text-slate-600">{service.category}</p>
                  </div>
                </div>
                {selectedService?.id === service.id && (
                  <CheckCircle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} dakika</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-slate-400 fill-current" />
                    <span>4.9</span>
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-600">
                  {formatPrice(service.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seçim Bilgisi */}
      {selectedService && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-slate-900">
                Seçilen Hizmet
              </p>
              <p className="text-sm text-slate-600">
                {selectedService.name} • {formatPrice(selectedService.price)} • {selectedService.duration} dakika
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Not */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Not:</strong> Hizmet seçiminizi yaptıktan sonra, 
          bu hizmeti sunan berberler arasından seçim yapabileceksiniz.
        </p>
      </div>
    </div>
  )
}
