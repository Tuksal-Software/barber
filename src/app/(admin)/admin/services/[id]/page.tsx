import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

async function updateAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "");
  const description = String(formData.get("description") || "");
  const duration = Number(formData.get("duration") || 0);
  const price = Number(formData.get("price") || 0);
  const category = String(formData.get("category") || "");
  const image = String(formData.get("image") || "");

  if (!id || !name || !category || !duration || !price) {
    throw new Error("Zorunlu alanları doldurun");
  }

  await prisma.service.update({
    where: { id },
    data: { name, description, duration, price, category, image: image || null },
  });

  redirect("/(admin)/admin/services");
}

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) return notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold">Hizmeti Düzenle</h1>
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="id" defaultValue={service.id} />
        <div>
          <label className="block text-sm font-medium">Hizmet Adı</label>
          <input name="name" required defaultValue={service.name} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Açıklama</label>
          <textarea name="description" rows={4} defaultValue={service.description || ''} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Süre (dk)</label>
            <input type="number" name="duration" min={1} required defaultValue={service.duration} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Fiyat (₺)</label>
            <input type="number" step="0.01" name="price" min={0} required defaultValue={service.price} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Kategori</label>
          <input name="category" required defaultValue={service.category} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Görsel URL</label>
          <input name="image" defaultValue={service.image || ''} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">Güncelle</button>
        </div>
      </form>
    </div>
  );
}



