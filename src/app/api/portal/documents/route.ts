import { NextRequest, NextResponse } from 'next/server'
import { getDocumentsByCase, getClientCases, getPortal } from '@/lib/firebase/firestore'

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
    console.log('1. Fetching portal for UUID:', portalUuid)
    // Get portal to find clientId
    const portal = await getPortal(portalUuid)
    if (!portal) {
      console.log('Portal not found')
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 })
    }

    clientId = portal.clientId
    console.log('2. Found clientId:', clientId)

    // Get all cases for this client
    const caseIds = await getClientCases(clientId)
    caseCount = caseIds.length
    console.log('3. Found caseIds:', caseIds)
    
    // Get all documents for all cases
    const allDocuments = []
    for (const caseId of caseIds) {
      const caseDocuments = await getDocumentsByCase(caseId)
      console.log(`4. Documents for case ${caseId}:`, caseDocuments.length)
      allDocuments.push(...caseDocuments)
    }
    console.log('5. Total documents found:', allDocuments.length)

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(
      'Failed to fetch portal documents:',
      JSON.stringify(
        {
          error_code: 'PORTAL_DOCUMENTS_RETRIEVAL_FAILED',
          message: 'Failed to retrieve documents for portal from Firestore',
          service: 'Firebase Firestore',
          operation: 'portal_documents_retrieval',
          context: { portalUuid, clientId, caseCount },
          remediation:
            'Verify portal exists, client has cases, and Firebase Admin SDK permissions',
          original_error: errorMessage,
        },
        null,
        2
      )
    )
    
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: errorMessage },
      { status: 500 }
    )
  }
}