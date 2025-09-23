import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const item = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { barber: true, service: true },
  });

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Randevu bulunamadı.</div>
        <Link className="text-primary hover:underline" href="/(admin)/admin/appointments">
          Randevu listesine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Randevu Detayı</h1>
        <Link className="text-sm text-primary hover:underline" href={`/(admin)/admin/appointments`}>
          Listeye Dön
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border p-4">
          <div className="text-xs text-muted-foreground">Müşteri</div>
          <div className="font-medium">{item.customerName}</div>
          <div className="text-muted-foreground">{item.customerPhone}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-xs text-muted-foreground">Berber</div>
          <div className="font-medium">{item.barber?.name}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-xs text-muted-foreground">Hizmet</div>
          <div className="font-medium">{item.service?.name}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-xs text-muted-foreground">Tarih-Saat</div>
          <div className="font-medium">
            {new Date(item.date).toLocaleDateString("tr-TR")} {item.timeSlot}
          </div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-xs text-muted-foreground">Durum</div>
          <div className="font-medium">{item.status}</div>
        </div>
        {item.notes ? (
          <div className="rounded-md border p-4 sm:col-span-2 lg:col-span-3">
            <div className="text-xs text-muted-foreground">Notlar</div>
            <div className="whitespace-pre-wrap">{item.notes}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}



