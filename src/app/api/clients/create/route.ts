import { NextRequest, NextResponse } from 'next/server'
import { createClient, createCase } from '@/lib/firebase/firestore'
import { ClientData } from '@/types/schemas'

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
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(
      'Failed to create client and case:',
      JSON.stringify(
        {
          error_code: 'CLIENT_CASE_CREATION_FAILED',
          message: 'Failed to create client and case documents',
          service: 'Firebase Firestore',
          operation: 'client_case_creation',
          context: {
            clientData: clientData
              ? {
                  email: clientData.email,
                  firstName: clientData.firstName,
                  lastName: clientData.lastName,
                }
              : undefined,
          },
          remediation:
            'Verify Firebase Admin SDK permissions and client data format',
          original_error: errorMessage,
        },
        null,
        2
      )
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
