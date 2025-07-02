import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { PortalData, PortalStatus, RegistrationStatus, COLLECTIONS } from '@/types/schemas';
import { randomUUID } from 'crypto';

interface CreatePortalRequest {
  clientId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePortalRequest = await request.json();

    // Validate required fields
    const { clientId } = body;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing required field: clientId' },
        { status: 400 }
      );
    }

    // Generate portal UUID
    const portalUuid = randomUUID();
    
    // Create portal data
    const portalData: PortalData = {
      portalUuid,
      clientId,
      portalStatus: 'created' as PortalStatus,
      registrationStatus: 'pending' as RegistrationStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Save to Firestore using portalUuid as document ID
    const docRef = adminDb.collection(COLLECTIONS.PORTALS).doc(portalUuid);
    await docRef.set(portalData);

    return NextResponse.json({
      success: true,
      portalUuid,
      message: 'Portal created successfully',
    });

  } catch (error) {
    console.error('Portal creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create portal' },
      { status: 500 }
    );
  }
}