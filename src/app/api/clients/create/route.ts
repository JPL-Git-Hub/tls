import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/firebase/firestore';
import { ClientData } from '@/types/schemas';

type CreateClientRequest = Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>;

export async function POST(request: NextRequest) {
  let clientData: CreateClientRequest | undefined;
  
  try {
    const body = await request.json();
    clientData = body;

    // Validate required fields
    if (!clientData.firstName || !clientData.lastName || !clientData.email || !clientData.mobilePhone) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, mobilePhone' },
        { status: 400 }
      );
    }

    // Create client using established firestore.ts function
    const clientId = await createClient(clientData);

    return NextResponse.json({
      success: true,
      clientId,
      message: 'Client created successfully'
    });

  } catch (error) {
    console.error('Failed to create client:', JSON.stringify({
      error_code: 'CLIENT_CREATION_FAILED',
      message: 'Failed to create client document',
      service: 'Firebase Firestore',
      operation: 'client_creation',
      context: { clientData: clientData ? { email: clientData.email, firstName: clientData.firstName, lastName: clientData.lastName } : undefined },
      remediation: 'Verify Firebase Admin SDK permissions and client data format',
      original_error: error.message
    }, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to create client',
        details: error.message
      },
      { status: 500 }
    );
  }
}