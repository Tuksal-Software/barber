import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidatePath } from "next/cache";

async function getServices() {
  return prisma.service.findMany({ orderBy: { name: "asc" } });
}

export default async function ServicesPage() {
  const services = await getServices();

  async function deleteAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/services");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Hizmetler</h1>
        <Link
          href="/admin/services/new"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Yeni Hizmet
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hizmet Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="p-2">Ad</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Süre</th>
                  <th className="p-2">Fiyat</th>
                  <th className="p-2">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.category}</td>
                    <td className="p-2">{s.duration} dakika</td>
                    <td className="p-2">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(s.price)}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/services/${s.id}`} className="text-primary hover:underline">
                          Düzenle
                        </Link>
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="text-red-600 hover:underline">Sil</button>
                        </form>
                      </div>
                    </td>
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


