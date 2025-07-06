import { ClientData } from '@/types/schemas'
import { logFormError } from '@/lib/logging/structured-logger'

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
    logFormError(
      'FORM_CLIENT_LEAD_SUBMISSION_FAILED',
      error,
      { email: data.email }
    )
    throw new Error('Failed to submit client information')
  }
}
