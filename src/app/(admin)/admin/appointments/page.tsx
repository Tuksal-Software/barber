import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getAppointments() {
  const items = await prisma.appointment.findMany({
    orderBy: { date: "desc" },
    include: { barber: true, service: true },
    take: 50,
  });
  return items;
}

export default async function AppointmentsPage() {
  const items = await getAppointments();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Randevular</h1>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 text-left text-muted-foreground">
              <th className="p-2">ID</th>
              <th className="p-2">Müşteri</th>
              <th className="p-2">Hizmet</th>
              <th className="p-2">Berber</th>
              <th className="p-2">Tarih</th>
              <th className="p-2">Saat</th>
              <th className="p-2">Durum</th>
              <th className="p-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2 align-top text-muted-foreground">{a.id.slice(0, 8)}</td>
                <td className="p-2">
                  <div className="font-medium">{a.customerName}</div>
                  <div className="text-muted-foreground">{a.customerPhone}</div>
                </td>
                <td className="p-2">{a.service?.name}</td>
                <td className="p-2">{a.barber?.name}</td>
                <td className="p-2">{new Date(a.date).toLocaleDateString("tr-TR")}</td>
                <td className="p-2">{a.timeSlot}</td>
                <td className="p-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                    a.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : a.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : a.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <Link className="text-primary hover:underline" href={`/(admin)/admin/appointments/${a.id}`}>Görüntüle</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

