export async function getActiveServices(): Promise<{ success: boolean; data: any[]; error?: string }> {
  return { success: true, data: [] }
}

export async function getServices(): Promise<{ success: boolean; data: any[]; error?: string }> {
  return { success: true, data: [] }
}

export async function createService(_: any): Promise<{ success: boolean; data?: any; error?: string }> {
  return { success: false, error: 'Not implemented' }
}

export async function updateService(_: string, __: any): Promise<{ success: boolean; data?: any; error?: string }> {
  return { success: false, error: 'Not implemented' }
}

export async function reorderServices(_: string[]): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Not implemented' }
}

export async function deleteService(_: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Not implemented' }
}


