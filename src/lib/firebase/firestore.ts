import { adminDb } from '@/lib/firebase/admin'
import { Timestamp } from 'firebase-admin/firestore'
import { ClientData, PortalData, CaseData, ClientCases, ClientRole, DocumentData, DocumentType, COLLECTIONS } from '@/types/schemas'

// Server-side Firestore operations using Firebase Admin SDK
// Used exclusively in API routes for elevated privileges

// Client operations
export const createClient = async (
  clientData: Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>
) => {
  let clientId: string | undefined

  try {
    const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc()
    clientId = clientRef.id

    const fullClientData: ClientData = {
      ...clientData,
      clientId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await clientRef.set(fullClientData)
    return clientId
  } catch (error) {
    console.error(
      'Failed to create client:',
      JSON.stringify(
        {
          error_code: 'CLIENT_CREATION_FAILED',
          message: 'Failed to create client document in Firestore',
          service: 'Firebase Firestore',
          operation: 'client_creation',
          context: {
            clientId,
            clientData: {
              email: clientData.email,
              firstName: clientData.firstName,
              lastName: clientData.lastName,
            },
          },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

export const getClient = async (
  clientId: string
): Promise<ClientData | null> => {
  try {
    const clientDoc = await adminDb
      .collection(COLLECTIONS.CLIENTS)
      .doc(clientId)
      .get()
    return clientDoc.exists ? (clientDoc.data() as ClientData) : null
  } catch (error) {
    console.error(
      'Failed to get client:',
      JSON.stringify(
        {
          error_code: 'CLIENT_RETRIEVAL_FAILED',
          message: 'Failed to retrieve client document from Firestore',
          service: 'Firebase Firestore',
          operation: 'client_retrieval',
          context: { clientId },
          remediation:
            'Verify client exists and Firebase Admin SDK permissions',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

export const updateClient = async (
  clientId: string,
  updates: Partial<Omit<ClientData, 'clientId' | 'createdAt'>>
) => {
  try {
    const clientRef = adminDb.collection(COLLECTIONS.CLIENTS).doc(clientId)
    await clientRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error(
      'Failed to update client:',
      JSON.stringify(
        {
          error_code: 'CLIENT_UPDATE_FAILED',
          message: 'Failed to update client document in Firestore',
          service: 'Firebase Firestore',
          operation: 'client_update',
          context: { clientId, updates },
          remediation:
            'Verify client exists and Firebase Admin SDK permissions',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

// Portal operations
export const createPortal = async (
  portalData: Omit<PortalData, 'createdAt' | 'updatedAt'>
) => {
  let portalUuid: string | undefined

  try {
    portalUuid = portalData.portalUuid
    const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)

    const fullPortalData: PortalData = {
      ...portalData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await portalRef.set(fullPortalData)
    return portalUuid
  } catch (error) {
    console.error(
      'Failed to create portal:',
      JSON.stringify(
        {
          error_code: 'PORTAL_CREATION_FAILED',
          message: 'Failed to create portal document in Firestore',
          service: 'Firebase Firestore',
          operation: 'portal_creation',
          context: {
            portalUuid,
            clientId: portalData.clientId,
            clientName: portalData.clientName,
          },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

export const getPortal = async (
  portalUuid: string
): Promise<PortalData | null> => {
  try {
    const portalDoc = await adminDb
      .collection(COLLECTIONS.PORTALS)
      .doc(portalUuid)
      .get()
    return portalDoc.exists ? (portalDoc.data() as PortalData) : null
  } catch (error) {
    console.error(
      'Failed to get portal:',
      JSON.stringify(
        {
          error_code: 'PORTAL_RETRIEVAL_FAILED',
          message: 'Failed to retrieve portal document from Firestore',
          service: 'Firebase Firestore',
          operation: 'portal_retrieval',
          context: { portalUuid },
          remediation:
            'Verify portal exists and Firebase Admin SDK permissions',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

export const updatePortal = async (
  portalUuid: string,
  updates: Partial<Omit<PortalData, 'portalUuid' | 'createdAt'>>
) => {
  try {
    const portalRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid)
    await portalRef.update({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error(
      'Failed to update portal:',
      JSON.stringify(
        {
          error_code: 'PORTAL_UPDATE_FAILED',
          message: 'Failed to update portal document in Firestore',
          service: 'Firebase Firestore',
          operation: 'portal_update',
          context: { portalUuid, updates },
          remediation:
            'Verify portal exists and Firebase Admin SDK permissions',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

// Case operations
export const createCase = async (
  caseData: Omit<CaseData, 'caseId' | 'createdAt' | 'updatedAt'>,
  clients: Array<{ clientId: string; role: ClientRole }>
) => {
  let caseId: string | undefined

  try {
    const caseRef = adminDb.collection(COLLECTIONS.CASES).doc()
    caseId = caseRef.id

    const fullCaseData: CaseData = {
      ...caseData,
      caseId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await caseRef.set(fullCaseData)

    // Create ClientCases junction records for each client
    for (const client of clients) {
      await createClientCaseRelationship(client.clientId, caseId, client.role)
    }

    return caseId
  } catch (error) {
    console.error(
      'Failed to create case:',
      JSON.stringify(
        {
          error_code: 'CASE_CREATION_FAILED',
          message: 'Failed to create case document in Firestore',
          service: 'Firebase Firestore',
          operation: 'case_creation',
          context: {
            caseId,
            clients: clients.map(c => ({ clientId: c.clientId, role: c.role })),
            caseType: caseData.caseType,
            status: caseData.status,
          },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

// ClientCases junction table operations
export const createClientCaseRelationship = async (
  clientId: string,
  caseId: string,
  role: ClientRole
) => {
  let participantId: string | undefined

  try {
    const participantRef = adminDb.collection(COLLECTIONS.CLIENT_CASES).doc()
    participantId = participantRef.id

    const clientCaseData: ClientCases = {
      participantId,
      clientId,
      caseId,
      role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await participantRef.set(clientCaseData)
    return participantId
  } catch (error) {
    console.error(
      'Failed to create client-case relationship:',
      JSON.stringify(
        {
          error_code: 'CLIENT_CASE_RELATIONSHIP_FAILED',
          message: 'Failed to create client-case junction record',
          service: 'Firebase Firestore',
          operation: 'client_case_relationship_creation',
          context: {
            participantId,
            clientId,
            caseId,
            role,
          },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

export const getCases = async (): Promise<CaseData[]> => {
  let caseCount: number | undefined

  try {
    const casesSnapshot = await adminDb.collection(COLLECTIONS.CASES).get()
    caseCount = casesSnapshot.size
    return casesSnapshot.docs.map(doc => doc.data() as CaseData)
  } catch (error) {
    console.error(
      'Failed to get cases:',
      JSON.stringify(
        {
          error_code: 'CASES_RETRIEVAL_FAILED',
          message: 'Failed to retrieve cases collection from Firestore',
          service: 'Firebase Firestore',
          operation: 'cases_list_retrieval',
          context: { caseCount },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}


// Document operations
export const createDocument = async (
  documentData: Omit<DocumentData, 'documentId' | 'createdAt' | 'updatedAt'>
) => {
  let documentId: string | undefined

  try {
    const documentRef = adminDb.collection(COLLECTIONS.DOCUMENTS).doc()
    documentId = documentRef.id

    const fullDocumentData: DocumentData = {
      ...documentData,
      documentId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await documentRef.set(fullDocumentData)
    return documentId
  } catch (error) {
    console.error(
      'Failed to create document:',
      JSON.stringify(
        {
          error_code: 'DOCUMENT_CREATION_FAILED',
          message: 'Failed to create document metadata in Firestore',
          service: 'Firebase Firestore',
          operation: 'document_creation',
          context: {
            documentId,
            caseId: documentData.caseId,
            fileName: documentData.fileName,
            docType: documentData.docType,
          },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

export const getDocumentsByCase = async (caseId: string): Promise<DocumentData[]> => {
  let documentCount: number | undefined

  try {
    const documentsSnapshot = await adminDb
      .collection(COLLECTIONS.DOCUMENTS)
      .where('caseId', '==', caseId)
      .get()
    
    documentCount = documentsSnapshot.size
    return documentsSnapshot.docs.map(doc => doc.data() as DocumentData)
  } catch (error) {
    console.error(
      'Failed to get documents by case:',
      JSON.stringify(
        {
          error_code: 'DOCUMENTS_BY_CASE_RETRIEVAL_FAILED',
          message: 'Failed to retrieve documents for case from Firestore',
          service: 'Firebase Firestore',
          operation: 'documents_by_case_retrieval',
          context: { caseId, documentCount },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}

export const getClientCases = async (clientId: string): Promise<string[]> => {
  let caseCount: number | undefined

  try {
    const clientCasesSnapshot = await adminDb
      .collection(COLLECTIONS.CLIENT_CASES)
      .where('clientId', '==', clientId)
      .get()
    
    caseCount = clientCasesSnapshot.size
    return clientCasesSnapshot.docs.map(doc => (doc.data() as ClientCases).caseId)
  } catch (error) {
    console.error(
      'Failed to get client cases:',
      JSON.stringify(
        {
          error_code: 'CLIENT_CASES_RETRIEVAL_FAILED',
          message: 'Failed to retrieve cases for client from Firestore',
          service: 'Firebase Firestore',
          operation: 'client_cases_retrieval',
          context: { clientId, caseCount },
          remediation:
            'Verify Firebase Admin SDK permissions and Firestore rules',
          original_error:
            error instanceof Error ? error.message : 'Unknown error',
        },
        null,
        2
      )
    )
    throw error
  }
}
