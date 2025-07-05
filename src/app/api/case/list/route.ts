import { NextResponse } from 'next/server'
import { getCases } from '@/lib/firebase/firestore'

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
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(
      'Failed to fetch cases:',
      JSON.stringify(
        {
          error_code: 'CASES_LIST_RETRIEVAL_FAILED',
          message: 'Failed to retrieve cases collection from API endpoint',
          service: 'Firebase Firestore',
          operation: 'cases_list_api',
          context: { endpoint: '/api/case/list', caseCount },
          remediation:
            'Verify Firebase Admin SDK permissions and API authentication',
          original_error: errorMessage,
        },
        null,
        2
      )
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
