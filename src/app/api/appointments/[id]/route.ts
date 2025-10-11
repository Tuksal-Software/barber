import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, startTime, endTime, status } = body;

    const updateData: any = {};

    if (date) {
      updateData.date = new Date(date + 'T00:00:00.000Z');
    }

    if (startTime) {
      updateData.startTime = startTime;
    }

    if (endTime) {
      updateData.endTime = endTime;
    }

    if (status) {
      updateData.status = status;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        barber: true,
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Randevu güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Randevu silinemedi' },
      { status: 500 }
    );
  }
}

