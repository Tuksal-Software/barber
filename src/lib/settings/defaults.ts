export const defaultSettings = {
  adminPhone: null as string | null,
  shopName: 'Berber',
  sms: {
    enabled: true,
    sender: 'DEGISIMDJTL',
  },
  customerCancel: {
    approvedMinHours: 2,
  },
  timezone: 'Europe/Istanbul',
} as const

