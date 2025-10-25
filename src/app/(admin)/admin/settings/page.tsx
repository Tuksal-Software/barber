'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
// import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { getAppointmentSettings, updateAppointmentSettings } from '@/lib/actions/settings'

const schema = z.object({
  maxAdvanceDays: z
    .number({ invalid_type_error: 'Lütfen sayı girin' })
    .min(1, 'En az 1 gün')
    .max(365, 'En fazla 365 gün'),
  slotDuration: z
    .number({ invalid_type_error: 'Lütfen sayı girin' })
    .min(5, 'En az 5 dk')
    .max(240, 'En fazla 240 dk'),
  serviceBasedDuration: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      maxAdvanceDays: 30,
      slotDuration: 30,
      serviceBasedDuration: false,
    },
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getAppointmentSettings()
        if (res.success && res.data) {
          form.reset({
            maxAdvanceDays: res.data.maxAdvanceDays,
            slotDuration: res.data.slotDuration,
            serviceBasedDuration: res.data.serviceBasedDuration,
          })
        }
      } catch (e) {
        toast.error('Ayarlar yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await updateAppointmentSettings(data)
      if (res.success) {
        toast.success('Ayarlar kaydedildi')
      } else {
        toast.error(res.error || 'Kayıt başarısız')
      }
    } catch (e) {
      toast.error('Kayıt sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Randevu Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAdvanceDays">Maksimum ileri tarih (gün)</Label>
                  <Input
                    id="maxAdvanceDays"
                    type="number"
                    inputMode="numeric"
                    {...form.register('maxAdvanceDays', { valueAsNumber: true })}
                  />
                  {form.formState.errors.maxAdvanceDays && (
                    <p className="text-sm text-red-600">{form.formState.errors.maxAdvanceDays.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slotDuration">Varsayılan slot süresi (dakika)</Label>
                  <Input
                    id="slotDuration"
                    type="number"
                    inputMode="numeric"
                    disabled={form.watch('serviceBasedDuration')}
                    {...form.register('slotDuration', { valueAsNumber: true })}
                  />
                  {form.watch('serviceBasedDuration') && (
                    <p className="text-xs text-gray-500">Hizmet bazlı sistem açıkken bu değer kullanılmaz.</p>
                  )}
                  {form.formState.errors.slotDuration && (
                    <p className="text-sm text-red-600">{form.formState.errors.slotDuration.message}</p>
                  )}
                </div>

                <hr />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block">Hizmet Bazlı Süre</Label>
                    <p className="text-sm text-gray-500 max-w-md">
                      Aktif olduğunda, müşteriler berber seçiminden sonra hizmet(ler)i seçer ve randevu süresi seçilen hizmetlerin toplam süresine göre belirlenir.
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('serviceBasedDuration')}
                    onCheckedChange={(v) => form.setValue('serviceBasedDuration', v, { shouldDirty: true })}
                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={!form.formState.isValid || saving}>
                    {saving ? 'Kaydediliyor…' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


