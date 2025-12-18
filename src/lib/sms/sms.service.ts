import type { SmsProvider } from './sms.provider'
import { ConsoleSmsProvider } from './console.provider'
import { env } from '@/lib/config/env'

let providerInstance: SmsProvider | null = null

function getProvider(): SmsProvider {
  if (providerInstance) {
    return providerInstance
  }

  const providerType = env.smsProvider

  switch (providerType) {
    case 'console':
      providerInstance = new ConsoleSmsProvider()
      break
    default:
      providerInstance = new ConsoleSmsProvider()
  }

  return providerInstance
}

export async function sendSms(to: string, message: string): Promise<void> {
  const provider = getProvider()
  await provider.sendSms(to, message)
}

