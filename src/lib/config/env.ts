function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value
}

function getEnvVarOptional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

export const env = {
  jwtSecret: getEnvVarOptional('JWT_SECRET'),
  smsProvider: getEnvVar('SMS_PROVIDER', 'console'),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  databaseUrl: getEnvVar('DATABASE_URL'),
} as const

