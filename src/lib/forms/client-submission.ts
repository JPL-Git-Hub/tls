import { ClientData } from '@/types/schemas'
import { logClientError } from '@/lib/client-error-logger'

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
    logClientError(error, { 
      operation: 'FORM_CLIENT_LEAD_SUBMISSION_FAILED', 
      email: data.email 
    })
    throw new Error('Failed to submit client information')
  }
}
