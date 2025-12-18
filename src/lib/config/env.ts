function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value
}

export const env = {
  jwtSecret: getEnvVar('JWT_SECRET'),
  smsProvider: getEnvVar('SMS_PROVIDER', 'console'),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  databaseUrl: getEnvVar('DATABASE_URL'),
} as const

