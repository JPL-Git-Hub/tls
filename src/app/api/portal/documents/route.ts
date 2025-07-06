import { NextRequest, NextResponse } from 'next/server'
import { getDocumentsByCase, getClientCases, getPortal } from '@/lib/firebase/firestore'
import { logFirebaseError } from '@/lib/logging/structured-logger'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const portalUuid = searchParams.get('portalUuid')

  if (!portalUuid) {
    return NextResponse.json(
      { error: 'Missing portalUuid parameter' },
      { status: 400 }
    )
  }

  let clientId: string | undefined
  let caseCount: number | undefined

  try {
    // Get portal to find clientId
    const portal = await getPortal(portalUuid)
    if (!portal) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    clientId = portal.clientId

    // Get all cases for this client
    const caseIds = await getClientCases(clientId)
    caseCount = caseIds.length
    
    // Get all documents for all cases
    const allDocuments = []
    for (const caseId of caseIds) {
      const caseDocuments = await getDocumentsByCase(caseId)
      allDocuments.push(...caseDocuments)
    }

    // Sort by creation date descending
    allDocuments.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({
      success: true,
      documents: allDocuments
    })
  } catch (error) {
    logFirebaseError(
      'portal_documents_retrieval',
      error,
      { portalUuid, clientId, caseCount },
      'Failed to retrieve documents for portal from Firestore',
      'Verify portal exists, client has cases, and Firebase Admin SDK permissions'
    )
    
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}