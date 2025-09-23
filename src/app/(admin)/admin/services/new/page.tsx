import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function createAction(formData: FormData) {
  'use server'
  const name = String(formData.get('name') || '')
  const description = String(formData.get('description') || '')
  const duration = Number(formData.get('duration') || 0)
  const price = Number(formData.get('price') || 0)
  const category = String(formData.get('category') || '')
  const image = String(formData.get('image') || '')

  await prisma.service.create({
    data: {
      name,
      description,
      duration,
      price,
      category,
      image: image || null
    }
  })

  redirect('/admin/services')
}

export default function NewServicePage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold">Yeni Hizmet</h1>
      <form action={createAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Hizmet Adı</label>
          <input name="name" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Açıklama</label>
          <textarea name="description" rows={4} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Süre (dk)</label>
            <input type="number" name="duration" min={1} required className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Fiyat (₺)</label>
            <input type="number" step="0.01" name="price" min={0} required className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Kategori</label>
          <input name="category" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Görsel URL</label>
          <input name="image" className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">Kaydet</button>
        </div>
      </form>
    </div>
  )
}
