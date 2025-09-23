import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfWeekWindow = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

  const [
    todayCount,
    weekCount,
    pendingCount,
    uniqueCustomers,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { date: { gte: startOfToday, lt: startOfTomorrow } },
    }),
    prisma.appointment.count({ where: { date: { gte: startOfWeekWindow, lte: now } } }),
    prisma.appointment.count({ where: { status: "pending" } }),
    prisma.appointment.groupBy({ by: ["customerPhone"], _count: { customerPhone: true } }),
    prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { barber: true, service: true },
    }),
  ]);

  return {
    todayCount,
    weekCount,
    pendingCount,
    totalCustomers: uniqueCustomers.length,
    recentAppointments,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Bugünkü Randevular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.todayCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bu Hafta Toplam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.weekCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Randevular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Toplam Müşteri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="p-2">Müşteri</th>
                  <th className="p-2">Telefon</th>
                  <th className="p-2">Berber</th>
                  <th className="p-2">Hizmet</th>
                  <th className="p-2">Tarih-Saat</th>
                  <th className="p-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAppointments.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{a.customerName}</td>
                    <td className="p-2">{a.customerPhone}</td>
                    <td className="p-2">{a.barber?.name}</td>
                    <td className="p-2">{a.service?.name}</td>
                    <td className="p-2">
                      {new Date(a.date).toLocaleDateString("tr-TR")} {" "}
                      {a.timeSlot}
                    </td>
                    <td className="p-2">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



