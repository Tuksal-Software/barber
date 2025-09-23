import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

async function getBarbers() {
  return await prisma.barber.findMany({
    include: {
      barberServices: {
        include: { service: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export default async function BarbersPage() {
  const barbers = await getBarbers()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Berberler</h1>
        <Link href="/admin/barbers/new">
          <Button>Yeni Berber Ekle</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => {
          let specialties: string[] = []
          try {
            specialties = Array.isArray((barber as any).specialties)
              ? (barber as any).specialties
              : JSON.parse((barber as any).specialties || '[]')
          } catch {
            specialties = []
          }

          return (
            <Card key={barber.id}>
              <CardHeader>
                {barber.image && (
                  <img 
                    src={barber.image} 
                    alt={barber.name}
                    className="w-20 h-20 rounded-full mx-auto object-cover"
                  />
                )}
                <CardTitle className="text-center">{barber.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-center text-sm text-gray-600">
                  {barber.experience} yıl deneyim • ⭐ {barber.rating}
                </p>
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {specialties.map((spec, index) => (
                      <span key={index} className="rounded-full border px-2 py-0.5 text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
                {barber.barberServices.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Hizmetleri:</p>
                    <div className="flex flex-wrap gap-1">
                      {barber.barberServices.map((bs) => (
                        <span key={bs.id} className="rounded-full bg-accent px-2 py-0.5 text-xs">
                          {bs.service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-3">
                  <Link href={`/admin/barbers/${barber.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Düzenle</Button>
                  </Link>
                  <Link href={`/admin/barbers/${barber.id}/schedule`} className="flex-1">
                    <Button size="sm" className="w-full">Takvim</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {barbers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz berber eklenmemiş.</p>
          <Link href="/admin/barbers/new">
            <Button className="mt-4">İlk Berberi Ekle</Button>
          </Link>
        </div>
      )}
    </div>
  )
}



