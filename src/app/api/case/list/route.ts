import { NextResponse } from 'next/server'
import { getCases } from '@/lib/firebase/firestore'
import { logApiError } from '@/lib/logging/structured-logger'

export async function GET() {
  let caseCount: number | undefined

  try {
    // Fetch all cases from Firestore
    const cases = await getCases()
    caseCount = cases.length

    return NextResponse.json({
      success: true,
      cases,
    })
  } catch (error) {
    logApiError(
      'CASES_LIST_RETRIEVAL_FAILED',
      error,
      { endpoint: '/api/case/list', caseCount }
    )

    return NextResponse.json(
      {
        error: 'Failed to fetch cases',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
