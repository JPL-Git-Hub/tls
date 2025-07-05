import { ClientData } from '@/types/schemas'

export async function submitClientLead(
  data: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    // Use server-side API endpoint instead of direct Firebase client SDK
    const response = await fetch('/api/clients/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create client')
    }

    const result = await response.json()
    return result.clientId
  } catch (error) {
    console.error('Client lead submission failed:', error)
    throw new Error('Failed to submit client information')
  }
}
