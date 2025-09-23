'use client'
import { Service, Barber } from '@/types'
import { Star, Award, CheckCircle } from 'lucide-react'

interface BarberSelectionProps {
  selectedService?: Service
  barbers: Barber[]
  selectedBarber?: Barber
  onBarberSelect: (barber: Barber) => void
}

export default function BarberSelection({ selectedService, barbers, selectedBarber, onBarberSelect }: BarberSelectionProps) {
  // Seçilen hizmeti sunan berberleri filtrele
  const availableBarbers = barbers.filter(barber => {
    if (!selectedService) return false
    
    // Berber'in bu hizmeti sunup sunmadığını kontrol et
    // Şimdilik tüm berberleri göster, sonra barber_services tablosu ile kontrol edilecek
    return true
  })

  if (!selectedService) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Önce bir hizmet seçmelisiniz.</p>
      </div>
    )
  }

  if (availableBarbers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">
          Bu hizmeti sunan berber bulunamadı. Lütfen başka bir hizmet seçin.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hizmet Bilgisi */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Seçilen Hizmet</h3>
        <p className="text-slate-600">
          <strong>{selectedService.name}</strong> • {selectedService.duration} dakika
        </p>
      </div>

      {/* Berber Seçimi */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Berber Seçin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableBarbers.map((barber) => {
            const specialties = Array.isArray(barber.specialties)
              ? barber.specialties
              : (() => {
                  try {
                    return JSON.parse((barber as any).specialties || '[]')
                  } catch {
                    return []
                  }
                })()
            
            return (
              <div
                key={barber.id}
                onClick={() => onBarberSelect(barber)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedBarber?.id === barber.id
                    ? 'border-slate-600 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {barber.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{barber.name}</h4>
                      <p className="text-sm text-slate-600">{barber.experience} yıl deneyim</p>
                    </div>
                  </div>
                  {selectedBarber?.id === barber.id && (
                    <CheckCircle className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(barber.rating)
                          ? 'text-slate-400 fill-current'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-slate-600 ml-2">
                    ({barber.rating})
                  </span>
                </div>

                {/* Specialties */}
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-2">Uzmanlık Alanları:</p>
                  <div className="flex flex-wrap gap-1">
                    {specialties.slice(0, 3).map((specialty: string, index: number) => (
                      <span
                        key={index}
                        className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Award className="w-4 h-4" />
                  <span>{barber.experience} yıl profesyonel deneyim</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Seçim Bilgisi */}
      {selectedBarber && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-slate-900">
                Seçilen Berber
              </p>
              <p className="text-sm text-slate-600">
                {selectedBarber.name} • {selectedBarber.experience} yıl deneyim • ⭐ {selectedBarber.rating}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Not */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Not:</strong> Berber seçiminizi yaptıktan sonra, 
          uygun tarih ve saat seçebileceksiniz.
        </p>
      </div>
    </div>
  )
}
