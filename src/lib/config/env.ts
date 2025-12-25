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

function getEnvVarOptionalWithWarning(key: string): string | undefined {
  const value = process.env[key]
  if (!value) {
    console.error(`[ENV] Warning: ${key} is not set`)
  }
  return value
}

export const env = {
  jwtSecret: getEnvVarOptional('JWT_SECRET'),
  smsProvider: getEnvVar('SMS_PROVIDER', 'console'),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  databaseUrl: getEnvVar('DATABASE_URL'),
  adminPhone: getEnvVarOptionalWithWarning('ADMIN_PHONE'),
  smsApiId: getEnvVarOptionalWithWarning('SMS_API_ID'),
  smsApiKey: getEnvVarOptionalWithWarning('SMS_API_KEY'),
} as const

