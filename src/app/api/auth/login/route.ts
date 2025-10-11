import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre gerekli" },
        { status: 400 }
      );
    }

    // Berber kontrolü
    const barber = await prisma.barber.findUnique({
      where: { email },
    });

    if (!barber || !await bcrypt.compare(password, barber.password)) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı" },
        { status: 401 }
      );
    }

    if (!barber.isActive) {
      return NextResponse.json(
        { error: "Hesabınız deaktif durumda" },
        { status: 403 }
      );
    }

    // Başarılı giriş
    return NextResponse.json({
      success: true,
      barberId: barber.id,
      name: barber.name,
      email: barber.email,
      role: barber.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
