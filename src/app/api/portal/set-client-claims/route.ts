import { NextRequest, NextResponse } from 'next/server';
import { setClientClaims } from '@/lib/firebase/custom-claims';

export async function POST(request: NextRequest) {
  let uid: string | undefined;
  let portalUuid: string | undefined;
  
  try {
    const body = await request.json();
    uid = body.uid;
    portalUuid = body.portalUuid;

    if (!uid || !portalUuid) {
      return NextResponse.json(
        { error: 'uid and portalUuid are required' },
        { status: 400 }
      );
    }

    // Set custom claims for the client user
    await setClientClaims(uid, portalUuid);

    return NextResponse.json({
      success: true,
      message: 'Client claims set successfully'
    });

  } catch (error) {
    console.error('Failed to set client claims:', JSON.stringify({
      error_code: 'CUSTOM_CLAIMS_SET_FAILED',
      message: 'Failed to set custom claims for client user',
      service: 'Firebase Admin Auth',
      operation: 'set_custom_user_claims',
      context: { uid, portalUuid },
      remediation: 'Verify Firebase Admin SDK permissions and user exists',
      original_error: error.message
    }, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to set client claims', 
        details: error.message,
        uid,
        portalUuid 
      },
      { status: 500 }
    );
  }
}