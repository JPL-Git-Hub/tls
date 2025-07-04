import { NextRequest, NextResponse } from 'next/server';
import { updatePortal } from '@/lib/firebase/firestore';
import { PortalData } from '@/types/schemas';

type UpdateRegistrationStatusRequest = Pick<PortalData, 'portalUuid'>;

export async function POST(request: NextRequest) {
  let portalUuid: string | undefined;
  
  try {
    const body: UpdateRegistrationStatusRequest = await request.json();
    portalUuid = body.portalUuid;
    
    if (!portalUuid) {
      return NextResponse.json(
        { error: 'Missing required field: portalUuid' },
        { status: 400 }
      );
    }

    // Update portal registration status to completed and set portal to active
    await updatePortal(portalUuid, {
      registrationStatus: 'completed',
      portalStatus: 'active'
    });

    return NextResponse.json({
      success: true,
      message: 'Registration status updated to completed',
    });

  } catch (error) {
    console.error('Update registration status failed:', JSON.stringify({
      error_code: 'PORTAL_STATUS_UPDATE_FAILED',
      message: 'Failed to update portal registration status',
      service: 'Firebase Firestore',
      operation: 'portal_status_update',
      context: { portalUuid },
      remediation: 'Check if portal document exists and updatePortal function is working',
      original_error: error.message
    }, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to update registration status',
        details: error.message,
        portalUuid 
      },
      { status: 500 }
    );
  }
}