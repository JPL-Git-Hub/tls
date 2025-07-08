import { NextResponse } from 'next/server'
import { getCases } from '@/lib/firebase/firestore'
import { logApiError } from '@/lib/logging/structured-logger'

export async function GET() {
  try {
    const cases = await getCases()
    
    return NextResponse.json({
      success: true,
      cases
    })
    
  } catch (error) {
    logApiError('CASES_RETRIEVAL_FAILED', error, {
      endpoint: '/api/cases/list',
      method: 'GET'
    })
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}