import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const dateStr = searchParams.get('date')

  if (!dateStr) {
    return Response.json({ success: false, error: 'Date parameter required' }, { status: 400 })
  }

  const date = new Date(dateStr)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayOfWeek = date.getDay()

  console.log('Checking availability for:', { barberId: id, date: dateStr, dayOfWeek })

  // Berber o gün çalışıyor mu?
  const workingHour = await prisma.workingHour.findUnique({
    where: { barberId_dayOfWeek: { barberId: id, dayOfWeek } }
  })

  console.log('Working hour found:', workingHour)

  if (!workingHour || !workingHour.isWorking) {
    return Response.json({ success: true, timeSlots: [] })
  }

  // O günün başlangıç/bitiş saatleri
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

  const existingAppointments = await prisma.appointment.findMany({
    where: { barberId: id, date: { gte: startOfDay, lt: endOfDay } }
  })

  console.log('Existing appointments:', existingAppointments.length)

  const slots = generateTimeSlots(workingHour.startTime, workingHour.endTime, existingAppointments)

  return Response.json({ success: true, timeSlots: slots })
}

function generateTimeSlots(startTime: string, endTime: string, existingAppointments: any[]) {
  const slots: { time: string; isAvailable: boolean }[] = []
  const startHour = parseInt(startTime.split(':')[0])
  const endHour = parseInt(endTime.split(':')[0])

  for (let hour = startHour; hour < endHour; hour++) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`
    const isBooked = existingAppointments.some((apt) => apt.timeSlot === timeSlot)
    slots.push({ time: timeSlot, isAvailable: !isBooked })
  }

  return slots
}



