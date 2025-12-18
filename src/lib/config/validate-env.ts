import { env } from './env'

export function validateEnv() {
  try {
    const _ = env
  } catch (error) {
    if (error instanceof Error) {
      console.error('Environment validation failed:', error.message)
      if (process.env.NODE_ENV === 'production' && typeof process !== 'undefined' && process.exit) {
        process.exit(1)
      }
    }
    throw error
  }
}

export function validateProductionEnv() {
  if (env.nodeEnv === 'production' && typeof window === 'undefined') {
    if (env.jwtSecret.length < 32) {
      console.warn('⚠️  JWT_SECRET should be at least 32 characters long in production for security')
    }
    const weakSecrets = ['your-secret-key', 'change-me', 'secret', 'password', 'example']
    if (weakSecrets.some(weak => env.jwtSecret.toLowerCase().includes(weak))) {
      console.warn('⚠️  JWT_SECRET appears to be a default/weak value. Please use a strong, random secret in production')
    }
  }
}

