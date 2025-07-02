import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { clientDb } from '@/lib/firebase/client'
import { ClientData, COLLECTIONS } from '@/types/schemas'

export async function submitClientLead(data: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const clientData: Omit<ClientData, 'clientId'> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobilePhone: data.mobilePhone,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    const docRef = await addDoc(collection(clientDb, COLLECTIONS.CLIENTS), clientData)
    return docRef.id
  } catch (error) {
    console.error('Client lead submission failed:', error)
    throw new Error('Failed to submit client information')
  }
}