import { NextRequest, NextResponse } from 'next/server';
import { adminDb, requireAttorneyAuth } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { PortalData, PortalStatus, RegistrationStatus, COLLECTIONS } from '@/types/schemas';
import { randomUUID } from 'crypto';

interface CreatePortalRequest {
  caseId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify attorney authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const attorney = await requireAttorneyAuth(idToken);
    
    if (!attorney) {
      return NextResponse.json(
        { error: 'Unauthorized: Attorney access required' },
        { status: 403 }
      );
    }

    const body: CreatePortalRequest = await request.json();

    // Validate required fields
    const { caseId } = body;
    
    if (!caseId) {
      return NextResponse.json(
        { error: 'Missing required field: caseId' },
        { status: 400 }
      );
    }

    // Generate portal UUID
    const portalUuid = randomUUID();
    
    // Create portal data
    const portalData: PortalData = {
      portalUuid,
      caseId,
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