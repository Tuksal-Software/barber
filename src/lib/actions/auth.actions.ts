'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, verifyToken, type JWTPayload } from '@/lib/auth/jwt'
import { setAuthCookie, getAuthCookie, deleteAuthCookie } from '@/lib/auth/cookies'
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit'

export interface LoginInput {
  email: string
  password: string
}

export interface Session {
  userId: string
  role: 'admin' | 'barber'
  email: string
  name: string
}

export async function login(input: LoginInput): Promise<{ success: boolean; error?: string }> {
  const { email, password } = input

  const rateLimit = checkRateLimit(email)
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    }
  }

  const barber = await prisma.barber.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true,
      isActive: true,
    },
  })

  if (!barber) {
    return {
      success: false,
      error: 'E-posta veya şifre hatalı',
    }
  }

  if (!barber.isActive) {
    return {
      success: false,
      error: 'Hesabınız aktif değil',
    }
  }

  const isValidPassword = await bcrypt.compare(password, barber.password)
  if (!isValidPassword) {
    return {
      success: false,
      error: 'E-posta veya şifre hatalı',
    }
  }

  resetRateLimit(email)

  const token = signToken({
    userId: barber.id,
    role: barber.role,
  })

  await setAuthCookie(token)

  return { success: true }
}

export async function logout(): Promise<void> {
  await deleteAuthCookie()
}

export async function getSession(): Promise<Session | null> {
  const token = await getAuthCookie()
  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    await deleteAuthCookie()
    return null
  }

  const barber = await prisma.barber.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      isActive: true,
    },
  })

  if (!barber || !barber.isActive) {
    await deleteAuthCookie()
    return null
  }

  return {
    userId: barber.id,
    role: barber.role,
    email: barber.email,
    name: barber.name,
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return session
}





