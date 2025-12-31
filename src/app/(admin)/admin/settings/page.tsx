'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { getSettings, updateSettings, type SettingsResponse } from '@/lib/actions/settings.actions'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsResponse>({
    adminPhone: null,
    shopName: 'Berber',
    smsEnabled: true,
    smsSender: 'DEGISIMDJTL',
    approvedCancelMinHours: 2,
    timezone: 'Europe/Istanbul',
    enableServiceSelection: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Ayarlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateSettings(settings)
      if (result.success) {
        toast.success('Ayarlar başarıyla kaydedildi')
      } else {
        toast.error(result.error || 'Ayarlar kaydedilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Ayarlar kaydedilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Ayarlar</CardTitle>
          <CardDescription>Sistem genelinde kullanılan ayarları yönetin</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="rounded-lg bg-muted/20 p-5">
              <h3 className="text-lg font-semibold mb-1">Genel Ayarlar</h3>
              <p className="text-sm text-muted-foreground mb-5">İşletme ve temel ayarlar</p>

              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="shopName" className="text-xs font-medium">İşletme Adı</Label>
                    <Input
                      id="shopName"
                      value={settings.shopName}
                      onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="timezone" className="text-xs font-medium">Zaman Dilimi</Label>
                    <Input id="timezone" value={settings.timezone} disabled />
                    <p className="text-xs text-muted-foreground mt-1">
                      Zaman dilimi şu anda değiştirilemez.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 py-3 rounded-md hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm font-medium">Ürün Seçimi</Label>
                    <p className="text-sm text-muted-foreground">
                      Müşteri randevu alırken hizmet (Saç / Sakal / Saç ve Sakal) seçimi yapılmasını sağlar.
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableServiceSelection}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableServiceSelection: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/20 p-5">
              <h3 className="text-lg font-semibold mb-1">SMS & Bildirimler</h3>
              <p className="text-sm text-muted-foreground mb-5">SMS gönderim ve bildirim ayarları</p>

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-6 py-3 rounded-md hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm font-medium">SMS Aktif</Label>
                    <p className="text-sm text-muted-foreground">
                      SMS gönderimlerini açıp kapatabilirsiniz.
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsEnabled}
                    disabled={true}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsEnabled: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="smsSender" className="text-xs font-medium">SMS Sender</Label>
                    <Input
                      id="smsSender"
                      value={settings.smsSender}
                      onChange={(e) => setSettings({ ...settings, smsSender: e.target.value })}
                      placeholder="DEGISIMDJTL"
                      disabled={true}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="adminPhone" className="text-xs font-medium">Admin Telefonu</Label>
                    <Input
                      id="adminPhone"
                      value={settings.adminPhone || ''}
                      onChange={(e) => {
                        const value = e.target.value.trim()
                        setSettings({ ...settings, adminPhone: value || null })
                      }}
                      placeholder="+905551234567"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Admin bildirimleri için telefon numarası. +90 ile başlamalı veya boş bırakılabilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/20 p-5">
              <h3 className="text-lg font-semibold mb-1">Kurallar</h3>
              <p className="text-sm text-muted-foreground mb-5">Randevu iptal kuralları</p>

              <div className="space-y-1.5">
                <Label htmlFor="approvedCancelMinHours" className="text-xs font-medium">
                  Onaylı randevu iptal süresi
                </Label>
                <Input
                  id="approvedCancelMinHours"
                  type="number"
                  min={1}
                  max={48}
                  value={settings.approvedCancelMinHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      approvedCancelMinHours: parseInt(e.target.value) || 2,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Müşteriler onaylı randevularını kaç saat öncesine kadar iptal edebilir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
