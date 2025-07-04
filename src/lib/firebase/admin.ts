import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { firebaseAdminConfig, useEmulator } from '@/lib/config/firebase-config'
import { verifyAttorneyToken } from '@/lib/firebase/custom-claims'

// Initialize Firebase Admin app with singleton pattern
const getAdminApp = (): App => {
  if (getApps().length === 0) {
    if (useEmulator) {
      return initializeApp({
        projectId: firebaseAdminConfig.projectId,
      })
    }
    
    return initializeApp({
      credential: cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getApps()[0]
}

const adminApp = getAdminApp()

// Initialize Firebase Admin services
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

// Configure emulators using centralized pattern
const configureEmulators = () => {
  if (useEmulator) {
    const emulatorConfig = {
      FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080',
      FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
    };
    
    Object.entries(emulatorConfig).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
};

configureEmulators();

// Server-side ID token verification for middleware authentication
export const verifyIdToken = async (idToken: string): Promise<{ uid: string; email: string } | null> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    }
  } catch (error) {
    console.error('Firebase token verification failed:', JSON.stringify({
      error_code: 'TOKEN_VERIFICATION_FAILED',
      message: 'Failed to verify Firebase ID token',
      service: 'Firebase Admin Auth',
      operation: 'verify_id_token',
      context: { token_provided: !!idToken, token_length: idToken?.length },
      remediation: 'Check token format, expiration, and Firebase project configuration',
      original_error: error.message
    }, null, 2));
    return null
  }
}

// Attorney route protection with authorization checking (enhanced with custom claims)
export const requireAttorneyAuth = async (idToken: string): Promise<{ uid: string; email: string } | null> => {
  const user = await verifyIdToken(idToken)
  
  if (!user || !user.email) {
    return null
  }

  // Check custom claims first (new method)
  const hasAttorneyClaims = await verifyAttorneyToken(idToken)
  if (hasAttorneyClaims) {
    return user
  }

  // Fallback to legacy domain/email checking for existing users
  const { isAuthorizedAttorney } = await import('@/lib/config/auth-config')
  
  if (!isAuthorizedAttorney(user.email)) {
    return null
  }

  return user
}

// Client route protection for non-attorney users
export const requireClientAuth = async (idToken: string): Promise<{ uid: string; email: string } | null> => {
  const user = await verifyIdToken(idToken)
  
  if (!user || !user.email) {
    return null
  }

  return user
}

export default adminApp