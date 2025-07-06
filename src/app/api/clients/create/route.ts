import { NextRequest, NextResponse } from 'next/server'
import { createClient, createCase } from '@/lib/firebase/firestore'
import { ClientData } from '@/types/schemas'
import { logApiError } from '@/lib/logging/structured-logger'

type CreateClientRequest = Omit<
  ClientData,
  'clientId' | 'createdAt' | 'updatedAt'
>

export async function POST(request: NextRequest) {
  let clientData: CreateClientRequest | undefined

  try {
    const body = await request.json()
    clientData = body

    // Validate required fields
    if (
      !clientData?.firstName ||
      !clientData?.lastName ||
      !clientData?.email ||
      !clientData?.mobilePhone
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: firstName, lastName, email, mobilePhone',
        },
        { status: 400 }
      )
    }

    // Create client using established firestore.ts function
    const clientId = await createClient(clientData)

    // Create default case for the client
    const caseId = await createCase(
      {
        clientNames: `${clientData.firstName} ${clientData.lastName}`,
        caseType: 'Other',
        status: 'intake',
      },
      [{ clientId, role: 'primary' }]
    )

    return NextResponse.json({
      success: true,
      clientId,
      caseId,
      message: 'Client and case created successfully',
    })
  } catch (error) {
    logApiError(
      'CLIENT_CASE_CREATION_FAILED',
      error,
      {
        clientData: clientData
          ? {
              email: clientData.email,
              firstName: clientData.firstName,
              lastName: clientData.lastName,
            }
          : undefined,
      }
    )

    return NextResponse.json(
      {
        error: 'Failed to create client and case',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
