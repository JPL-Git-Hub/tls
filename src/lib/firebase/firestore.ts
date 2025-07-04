import { adminDb } from '@/lib/firebase/admin'
import { Timestamp } from 'firebase-admin/firestore'
import { ClientData, PortalData, CaseData, COLLECTIONS } from '@/types/schemas'

// Server-side Firestore operations using Firebase Admin SDK
// Used exclusively in API routes for elevated privileges

// Client operations
export const createClient = async (clientData: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>) => {
  let clientId: string | undefined;
  
  try {
    const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc()
    clientId = clientRef.id
    
    const fullClientData: ClientData = {
      ...clientData,
      clientId,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    }
    
    await clientRef.set(fullClientData)
    return clientId
  } catch (error) {
    console.error('Failed to create client:', JSON.stringify({
      error_code: 'CLIENT_CREATION_FAILED',
      message: 'Failed to create client document in Firestore',
      service: 'Firebase Firestore',
      operation: 'client_creation',
      context: { clientId, clientData: { email: clientData.email, firstName: clientData.firstName, lastName: clientData.lastName } },
      remediation: 'Verify Firebase Admin SDK permissions and Firestore rules',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}

export const getClient = async (clientId: string): Promise<ClientData | null> => {
  try {
    const clientDoc = await adminDb.collection(COLLECTIONS.CLIENTS).doc(clientId).get()
    return clientDoc.exists ? clientDoc.data() as ClientData : null
  } catch (error) {
    console.error('Failed to get client:', JSON.stringify({
      error_code: 'CLIENT_RETRIEVAL_FAILED',
      message: 'Failed to retrieve client document from Firestore',
      service: 'Firebase Firestore',
      operation: 'client_retrieval',
      context: { clientId },
      remediation: 'Verify client exists and Firebase Admin SDK permissions',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}

export const updateClient = async (clientId: string, updates: Partial<Omit<ClientData, 'clientId' | 'createdAt'>>) => {
  try {
    const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc(clientId)
    await clientRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Failed to update client:', JSON.stringify({
      error_code: 'CLIENT_UPDATE_FAILED',
      message: 'Failed to update client document in Firestore',
      service: 'Firebase Firestore',
      operation: 'client_update',
      context: { clientId, updates },
      remediation: 'Verify client exists and Firebase Admin SDK permissions',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}

// Portal operations
export const createPortal = async (portalData: Omit<PortalData, 'createdAt' | 'updatedAt'>) => {
  let portalUuid: string | undefined;
  
  try {
    portalUuid = portalData.portalUuid;
    const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)
    
    const fullPortalData: PortalData = {
      ...portalData,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    }
    
    await portalRef.set(fullPortalData)
    return portalUuid
  } catch (error) {
    console.error('Failed to create portal:', JSON.stringify({
      error_code: 'PORTAL_CREATION_FAILED',
      message: 'Failed to create portal document in Firestore',
      service: 'Firebase Firestore',
      operation: 'portal_creation',
      context: { portalUuid, clientId: portalData.clientId, clientName: portalData.clientName },
      remediation: 'Verify Firebase Admin SDK permissions and Firestore rules',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}

export const getPortal = async (portalUuid: string): Promise<PortalData | null> => {
  try {
    const portalDoc = await adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid).get()
    return portalDoc.exists ? portalDoc.data() as PortalData : null
  } catch (error) {
    console.error('Failed to get portal:', JSON.stringify({
      error_code: 'PORTAL_RETRIEVAL_FAILED',
      message: 'Failed to retrieve portal document from Firestore',
      service: 'Firebase Firestore',
      operation: 'portal_retrieval',
      context: { portalUuid },
      remediation: 'Verify portal exists and Firebase Admin SDK permissions',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}

export const updatePortal = async (portalUuid: string, updates: Partial<Omit<PortalData, 'portalUuid' | 'createdAt'>>) => {
  try {
    const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)
    await portalRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Failed to update portal:', JSON.stringify({
      error_code: 'PORTAL_UPDATE_FAILED',
      message: 'Failed to update portal document in Firestore',
      service: 'Firebase Firestore',
      operation: 'portal_update',
      context: { portalUuid, updates },
      remediation: 'Verify portal exists and Firebase Admin SDK permissions',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}

// Case operations
export const getCases = async (): Promise<CaseData[]> => {
  let caseCount: number | undefined;
  
  try {
    const casesSnapshot = await adminDb.collection(COLLECTIONS.CASES).get()
    caseCount = casesSnapshot.size;
    return casesSnapshot.docs.map(doc => doc.data() as CaseData)
  } catch (error) {
    console.error('Failed to get cases:', JSON.stringify({
      error_code: 'CASES_RETRIEVAL_FAILED',
      message: 'Failed to retrieve cases collection from Firestore',
      service: 'Firebase Firestore',
      operation: 'cases_list_retrieval',
      context: { caseCount },
      remediation: 'Verify Firebase Admin SDK permissions and Firestore rules',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}