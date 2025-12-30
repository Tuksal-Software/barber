'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getActiveBarbers } from '@/lib/actions/barber.actions'
import {
  getWorkingHours,
  updateWorkingHours,
  getOverrides,
  createOverride,
  deleteOverride,
  sendSmsForOverride,
  type WorkingHour,
  type WorkingHourOverride,
} from '@/lib/actions/working-hours.actions'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { BarberFilter } from '@/components/admin/BarberFilter'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Pazar' },
  { value: 1, label: 'Pazartesi' },
  { value: 2, label: 'Salı' },
  { value: 3, label: 'Çarşamba' },
  { value: 4, label: 'Perşembe' },
  { value: 5, label: 'Cuma' },
  { value: 6, label: 'Cumartesi' },
]

interface WorkingHourDayItemProps {
  day: string
  dayOfWeek: number
  isWorking: boolean
  startTime: string
  endTime: string
  onUpdate: (dayOfWeek: number, startTime: string, endTime: string, isWorking: boolean) => void
  saving: boolean
  timeOptions: string[]
}

function WorkingHourDayItem({
  day,
  dayOfWeek,
  isWorking,
  startTime,
  endTime,
  onUpdate,
  saving,
  timeOptions,
}: WorkingHourDayItemProps) {
  const [localStartTime, setLocalStartTime] = useState(startTime)
  const [localEndTime, setLocalEndTime] = useState(endTime)
  const [localIsWorking, setLocalIsWorking] = useState(isWorking)

  useEffect(() => {
    setLocalStartTime(startTime)
    setLocalEndTime(endTime)
    setLocalIsWorking(isWorking)
  }, [startTime, endTime, isWorking])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center space-x-2">
          <Switch
            checked={localIsWorking}
            onCheckedChange={(checked) => {
              setLocalIsWorking(checked)
              onUpdate(dayOfWeek, localStartTime, localEndTime, checked)
            }}
            disabled={saving}
          />
          <Label className="font-medium min-w-[100px]">{day}</Label>
        </div>

        {localIsWorking && (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor={`start-${dayOfWeek}`} className="text-sm">Başlangıç</Label>
              <Select
                value={localStartTime}
                onValueChange={(value) => {
                  setLocalStartTime(value)
                  onUpdate(dayOfWeek, value, localEndTime, localIsWorking)
                }}
                disabled={saving}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-muted-foreground">-</span>

            <div className="flex items-center gap-2">
              <Label htmlFor={`end-${dayOfWeek}`} className="text-sm">Bitiş</Label>
              <Select
                value={localEndTime}
                onValueChange={(value) => {
                  setLocalEndTime(value)
                  onUpdate(dayOfWeek, localStartTime, value, localIsWorking)
                }}
                disabled={saving}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WorkingHoursPage() {
  const [barbers, setBarbers] = useState<Array<{ id: string; name: string }>>([])
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const [workingHours, setWorkingHours] = useState<Map<number, WorkingHour>>(new Map())
  const [overrides, setOverrides] = useState<WorkingHourOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [overrideDate, setOverrideDate] = useState('')
  const [overrideStartTime, setOverrideStartTime] = useState('09:00')
  const [overrideEndTime, setOverrideEndTime] = useState('17:00')
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideSaving, setOverrideSaving] = useState(false)
  const [sendSms, setSendSms] = useState(true)

  useEffect(() => {
    loadBarbers()
  }, [])

  useEffect(() => {
    if (selectedBarberId) {
      loadData()
    }
  }, [selectedBarberId])

  const loadBarbers = async () => {
    try {
      const barbersList = await getActiveBarbers()
      setBarbers(barbersList.map(b => ({ id: b.id, name: b.name })))
    } catch (error) {
      console.error('Error loading barbers:', error)
      toast.error('Berberler yüklenirken hata oluştu')
    }
  }

  const loadData = async () => {
    if (!selectedBarberId) return

    setLoading(true)
    try {
      const [hours, overrideList] = await Promise.all([
        getWorkingHours(selectedBarberId),
        getOverrides(selectedBarberId),
      ])

      const hoursMap = new Map<number, WorkingHour>()
      for (const hour of hours) {
        hoursMap.set(hour.dayOfWeek, hour)
      }

      setWorkingHours(hoursMap)
      setOverrides(overrideList)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateWorkingHour = async (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isWorking: boolean
  ) => {
    if (!selectedBarberId) return

    setSaving(true)
    try {
      await updateWorkingHours(selectedBarberId, dayOfWeek, startTime, endTime, isWorking)
      toast.success('Çalışma saatleri güncellendi')
      await loadData()
    } catch (error: any) {
      console.error('Error updating working hours:', error)
      toast.error(error.message || 'Çalışma saatleri güncellenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateOverride = async () => {
    if (!selectedBarberId || !overrideDate) {
      toast.error('Tarih seçilmelidir')
      return
    }

    if (!overrideStartTime || !overrideEndTime) {
      toast.error('Başlangıç ve bitiş saatleri seçilmelidir')
      return
    }

    setOverrideSaving(true)
    try {
      const result = await createOverride(
        selectedBarberId,
        overrideDate,
        overrideStartTime,
        overrideEndTime,
        overrideReason || undefined,
        sendSms
      )

      if (!result.success) {
        toast.error(result.error || 'Override oluşturulamadı')
        setOverrideSaving(false)
        return
      }

      if (result.success && result.overrideId) {
        if (result.cancelledCount && result.cancelledCount > 0) {
          const smsMessage = result.smsSentCount && result.smsSentCount > 0
            ? `${result.cancelledCount} randevu iptal edildi ve müşterilere SMS gönderildi.`
            : `${result.cancelledCount} randevu iptal edildi. SMS gönderilmedi.`
          toast.success(smsMessage)
        } else {
          toast.success('Saatler kapatıldı')
        }
        setOverrideDate('')
        setOverrideStartTime('09:00')
        setOverrideEndTime('17:00')
        setOverrideReason('')
        await loadData()
        setOverrideSaving(false)
      } else {
        toast.error(result.error || 'Override oluşturulamadı')
        setOverrideSaving(false)
      }
    } catch (error: any) {
      console.error('Error creating override:', error)
      toast.error(error.message || 'Override oluşturulurken hata oluştu')
      setOverrideSaving(false)
    }
  }


  const handleDeleteOverride = async (overrideId: string) => {
    try {
      await deleteOverride(overrideId)
      toast.success('Kapatma silindi')
      await loadData()
    } catch (error: any) {
      console.error('Error deleting override:', error)
      toast.error(error.message || 'Kapatma silinirken hata oluştu')
    }
  }

  const getWorkingHour = (dayOfWeek: number): WorkingHour | null => {
    return workingHours.get(dayOfWeek) || null
  }

  const generateTimeOptions = (): string[] => {
    const options: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeStr)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Çalışma Saatleri</h1>
        <p className="text-muted-foreground">Haftalık program ve özel gün/saat yönetimi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Berber Seçimi</CardTitle>
          <CardDescription>Çalışma saatlerini yönetmek istediğiniz berberi seçin</CardDescription>
          <BarberFilter
            barbers={barbers}
            selectedBarberId={selectedBarberId}
            onBarberChange={setSelectedBarberId}
          />
        </CardHeader>
      </Card>

      {selectedBarberId && (
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="weekly">Haftalık Program</TabsTrigger>
            <TabsTrigger value="overrides">Özel Gün / Saat Kapatma</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Haftalık Çalışma Saatleri</CardTitle>
                <CardDescription>Her gün için çalışma saatlerini ayarlayın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {DAYS_OF_WEEK.map(day => {
                  const workingHour = getWorkingHour(day.value)
                  const isWorking = workingHour?.isWorking ?? false
                  const startTime = workingHour?.startTime ?? '09:00'
                  const endTime = workingHour?.endTime ?? '17:00'

                  return (
                    <WorkingHourDayItem
                      key={day.value}
                      day={day.label}
                      dayOfWeek={day.value}
                      isWorking={isWorking}
                      startTime={startTime}
                      endTime={endTime}
                      onUpdate={handleUpdateWorkingHour}
                      saving={saving}
                      timeOptions={timeOptions}
                    />
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overrides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Özel Gün / Saat Kapatma</CardTitle>
                <CardDescription>Belirli tarih ve saatleri kapatın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="override-date">Tarih</Label>
                  <Input
                    id="override-date"
                    type="date"
                    value={overrideDate}
                    onChange={(e) => setOverrideDate(e.target.value)}
                    min={today}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="override-start">Başlangıç Saati</Label>
                    <Select value={overrideStartTime} onValueChange={setOverrideStartTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="override-end">Bitiş Saati</Label>
                    <Select value={overrideEndTime} onValueChange={setOverrideEndTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="override-reason">Neden (Opsiyonel)</Label>
                  <Textarea
                    id="override-reason"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="İşletme tarafından kapatılan saatler"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Neden girilmezse müşteriye "İşletme tarafından kapatılan saatler" mesajı gönderilecektir.
                  </p>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id="send-sms-checkbox"
                    checked={sendSms}
                    onCheckedChange={(checked) => setSendSms(checked as boolean)}
                  />
                  <Label htmlFor="send-sms-checkbox" className="cursor-pointer">
                    Müşterilere SMS gönder
                  </Label>
                </div>
                <Button onClick={handleCreateOverride} disabled={overrideSaving || !overrideDate}>
                  {overrideSaving ? 'Kaydediliyor...' : 'Bu Saatleri Kapat'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kapatılan Saatler</CardTitle>
                <CardDescription>Daha önce kapatılan saatlerin listesi</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Yükleniyor...</div>
                ) : overrides.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Henüz kapatılan saat yok</div>
                ) : (
                  <div className="space-y-2">
                    {overrides.map(override => (
                      <div
                        key={override.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{override.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {override.startTime} - {override.endTime}
                          </div>
                          {override.reason && (
                            <div className="text-sm text-muted-foreground mt-1">{override.reason}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteOverride(override.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

    </div>
  )
}

