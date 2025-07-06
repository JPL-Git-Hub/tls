import { NextRequest, NextResponse } from 'next/server'
import { updatePortal } from '@/lib/firebase/firestore'
import { PortalData } from '@/types/schemas'
import { logApiError } from '@/lib/logging/structured-logger'

type UpdateRegistrationStatusRequest = Pick<PortalData, 'portalUuid'>

export async function POST(request: NextRequest) {
  let portalUuid: string | undefined

  try {
    const body: UpdateRegistrationStatusRequest = await request.json()
    portalUuid = body.portalUuid

    if (!portalUuid) {
      return NextResponse.json(
        { error: 'Missing required field: portalUuid' },
        { status: 400 }
      )
    }

    // Update portal registration status to completed and set portal to active
    await updatePortal(portalUuid, {
      registrationStatus: 'completed' satisfies PortalData['registrationStatus'],
      portalStatus: 'active' satisfies PortalData['portalStatus'],
    })

    return NextResponse.json({
      success: true,
      message: 'Registration status updated to completed',
    })
  } catch (error) {
    logApiError('portal_status_update', error, { portalUuid }, 'Failed to update portal registration status', 'Check if portal document exists and updatePortal function is working')

    return NextResponse.json(
      {
        error: 'Failed to update registration status',
        details: error instanceof Error ? error.message : 'Unknown error',
        portalUuid,
      },
      { status: 500 }
    )
  }
}
