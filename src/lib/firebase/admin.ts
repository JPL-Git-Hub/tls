import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { firebaseAdminConfig, useEmulator } from '@/lib/config/firebase-config'

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

// Set emulator environment variables if using emulators
if (useEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'
}

// Server-side ID token verification for middleware authentication
export const verifyIdToken = async (idToken: string): Promise<{ uid: string; email: string } | null> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Attorney route protection with authorization checking
export const requireAttorneyAuth = async (idToken: string): Promise<{ uid: string; email: string } | null> => {
  const user = await verifyIdToken(idToken)
  
  if (!user || !user.email) {
    return null
  }

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