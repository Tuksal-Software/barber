'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getActiveBarbers } from '@/lib/actions/barber.actions';
import { Star, User, Award } from 'lucide-react';

interface Barber {
  id: string;
  name: string;
  image?: string;
  specialties?: string;
  experience: number;
  rating: number;
  slotDuration: number;
}

interface BarberSelectionProps {
  onSelect: (barberId: string) => void;
  selectedId?: string;
}

export function BarberSelection({ onSelect, selectedId }: BarberSelectionProps) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBarbers = async () => {
      try {
        setLoading(true);
        const result = await getActiveBarbers();
        
        if (result.success && result.data) {
          setBarbers(result.data as any);
        } else {
          setError(result.error || 'Berberler yüklenemedi');
        }
      } catch (err) {
        setError('Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadBarbers();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Berberinizi Seçin</h2>
          <p className="text-gray-600">Size en uygun berberi seçerek devam edin</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (barbers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💇‍♂️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Berber Bulunamadı</h3>
        <p className="text-gray-600">Şu anda müsait berber bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Berberinizi Seçin</h2>
        <p className="text-gray-600">Size en uygun berberi seçerek devam edin</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber, index) => (
          <div 
            key={barber.id} 
            className="group relative animate-in fade-in-50 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
            <Card className={cn(
              "relative cursor-pointer transition-all duration-300 hover:shadow-xl",
              selectedId === barber.id 
                ? "ring-4 ring-teal-500 shadow-lg scale-105" 
                : "hover:scale-105"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={barber.image} alt={barber.name} />
                    <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-lg font-semibold">
                      {barber.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {barber.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {renderStars(barber.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {barber.rating.toFixed(1)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      {barber.experience} yıl deneyim
                    </Badge>
                  </div>
                </div>

                {barber.specialties && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Uzmanlık Alanları:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {barber.specialties.split(',').map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Slot süresi: {barber.slotDuration} dk
                  </div>
                  <Button
                    onClick={() => onSelect(barber.id)}
                    className={cn(
                      "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105",
                      selectedId === barber.id && "ring-2 ring-teal-300"
                    )}
                  >
                    {selectedId === barber.id ? 'Seçildi ✓' : 'Seç'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
