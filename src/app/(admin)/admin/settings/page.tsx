'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">
          Sistem genelinde kullanılan ayarları buradan yönetebilirsiniz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Genel</CardTitle>
          <CardDescription>İşletme ve temel ayarlar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shopName">İşletme Adı</Label>
            <Input
              id="shopName"
              value={settings.shopName}
              onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Zaman Dilimi</Label>
            <Input id="timezone" value={settings.timezone} disabled />
            <p className="text-sm text-muted-foreground">
              Zaman dilimi şu anda değiştirilemez.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS</CardTitle>
          <CardDescription>SMS gönderim ayarları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Aktif</Label>
              <p className="text-sm text-muted-foreground">
                SMS gönderimlerini açıp kapatabilirsiniz.
              </p>
            </div>
            <Switch
              checked={settings.smsEnabled} disabled={true}
              onCheckedChange={(checked) => setSettings({ ...settings, smsEnabled: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="smsSender">SMS Sender</Label>
            <Input
              id="smsSender"
              value={settings.smsSender}
              onChange={(e) => setSettings({ ...settings, smsSender: e.target.value })}
              placeholder="DEGISIMDJTL" disabled={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhone">Admin Telefonu</Label>
            <Input
              id="adminPhone"
              value={settings.adminPhone || ''}
              onChange={(e) => {
                const value = e.target.value.trim()
                setSettings({ ...settings, adminPhone: value || null })
              }}
              placeholder="+905551234567"
            />
            <p className="text-sm text-muted-foreground">
              Admin bildirimleri için telefon numarası. +90 ile başlamalı veya boş bırakılabilir.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İptal Kuralları</CardTitle>
          <CardDescription>Müşteri iptal kuralları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approvedCancelMinHours">
              Onaylı randevu müşteri iptal limiti (saat)
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
            <p className="text-sm text-muted-foreground">
              Müşteriler onaylı randevularını kaç saat öncesine kadar iptal edebilir.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
