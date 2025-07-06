import { NextRequest, NextResponse } from 'next/server'
import { getClient, createPortal } from '@/lib/firebase/firestore'
import {
  PortalData,
  PortalStatus,
  RegistrationStatus,
} from '@/types/schemas'
import { randomUUID } from 'crypto'
import { logPortalError } from '@/lib/logging/structured-logger'

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
    logPortalError(
      'PORTAL_CREATION_FAILED',
      error,
      { clientId, portalUuid }
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
