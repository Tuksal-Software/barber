import jwt from 'jsonwebtoken'
import { env } from '@/lib/config/env'

const JWT_SECRET = env.jwtSecret

export interface JWTPayload {
  userId: string
  role: 'admin' | 'barber'
}

const JWT_EXPIRES_IN = '7d'

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch {
    return null
  }
}

