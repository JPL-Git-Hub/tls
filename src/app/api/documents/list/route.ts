// API endpoint to list documents for a specific case
// Used by admin document selector component

import { NextRequest, NextResponse } from 'next/server'
import { getDocumentsByCase } from '@/lib/firebase/firestore'
import { logApiError } from '@/lib/logging/structured-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')
    
    if (!caseId) {
      return NextResponse.json(
        { success: false, error: 'Case ID is required' },
        { status: 400 }
      )
    }
    
    const documents = await getDocumentsByCase(caseId)
    
    return NextResponse.json({
      success: true,
      documents
    })
    
  } catch (error) {
    logApiError('DOCUMENTS_BY_CASE_RETRIEVAL_FAILED', error, {
      endpoint: '/api/documents/list',
      method: 'GET'
    })
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}