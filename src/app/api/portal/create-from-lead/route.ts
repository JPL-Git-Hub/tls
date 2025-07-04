import { NextRequest, NextResponse } from 'next/server'
import { getClient, createPortal } from '@/lib/firebase/firestore'
import {
  PortalData,
  PortalStatus,
  RegistrationStatus,
} from '@/types/schemas'
import { randomUUID } from 'crypto'

type CreatePortalRequest = Pick<PortalData, 'clientId'>

export async function POST(request: NextRequest) {
  let clientId: string | undefined
  let portalUuid: string | undefined

  try {
    const body: CreatePortalRequest = await request.json()

    // Validate required fields
    clientId = body.clientId

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing required field: clientId' },
        { status: 400 }
      )
    }

    // Fetch client data using established firestore function
    const clientData = await getClient(clientId)

    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const clientName = `${clientData.firstName} ${clientData.lastName}`

    // Generate portal UUID
    portalUuid = randomUUID()

    // Create portal data
    const portalData = {
      portalUuid,
      clientId,
      clientName,
      portalStatus: 'created' as PortalStatus,
      registrationStatus: 'pending' as RegistrationStatus,
    }

    // Create portal using established firestore function
    await createPortal(portalData)

    return NextResponse.json({
      success: true,
      portalUuid,
      message: 'Portal created successfully',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(
      'Failed to create portal from lead:',
      JSON.stringify(
        {
          error_code: 'PORTAL_CREATION_FAILED',
          message: 'Failed to create portal from client lead',
          service: 'Firebase Firestore',
          operation: 'portal_creation',
          context: { clientId, portalUuid },
          remediation:
            'Verify client exists and Firebase Admin SDK permissions',
          original_error: errorMessage,
        },
        null,
        2
      )
    )

    return NextResponse.json(
      {
        error: 'Failed to create portal',
        details: errorMessage,
        clientId,
        portalUuid,
      },
      { status: 500 }
    )
  }
}
