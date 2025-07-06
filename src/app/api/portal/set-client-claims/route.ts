import { NextRequest, NextResponse } from 'next/server'
import { setClientClaims } from '@/lib/firebase/custom-claims'
import { logApiError } from '@/lib/logging/structured-logger'

export async function POST(request: NextRequest) {
  let uid: string | undefined
  let portalUuid: string | undefined

  try {
    const body = await request.json()
    uid = body.uid
    portalUuid = body.portalUuid

    if (!uid || !portalUuid) {
      return NextResponse.json(
        { error: 'uid and portalUuid are required' },
        { status: 400 }
      )
    }

    // Set custom claims for the client user
    await setClientClaims(uid, portalUuid)

    return NextResponse.json({
      success: true,
      message: 'Client claims set successfully',
    })
  } catch (error) {
    logApiError(
      'CUSTOM_CLAIMS_SET_FAILED',
      error,
      { uid, portalUuid }
    )

    return NextResponse.json(
      {
        error: 'Failed to set client claims',
        details: error instanceof Error ? error.message : 'Unknown error',
        uid,
        portalUuid,
      },
      { status: 500 }
    )
  }
}
