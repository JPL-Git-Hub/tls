import { adminAuth } from '@/lib/firebase/admin'

// Custom claims types - Firebase claims are always primitives or arrays of primitives
export interface UserClaims {
  role?: 'attorney' | 'client'
  attorney?: boolean
  client?: boolean
  portalAccess?: string[]
}

// Type guard for checking if claims contain attorney role
export const isAttorneyRole = (
  claims: unknown
): claims is UserClaims & { role: 'attorney' } => {
  return typeof claims === 'object' && claims !== null && 
         'role' in claims && (claims as UserClaims).role === 'attorney'
}

// Type guard for checking if claims contain client role
export const isClientRole = (
  claims: unknown
): claims is UserClaims & { role: 'client' } => {
  return typeof claims === 'object' && claims !== null && 
         'role' in claims && (claims as UserClaims).role === 'client'
}

// Set attorney role for @thelawshop.com users
export const setAttorneyClaims = async (uid: string, email: string) => {
  if (!email.endsWith('@thelawshop.com')) {
    throw new Error(
      'Attorney claims can only be set for @thelawshop.com emails'
    )
  }

  const claims: UserClaims = {
    role: 'attorney',
    attorney: true,
  }

  await adminAuth.setCustomUserClaims(uid, claims)
  console.log(`Attorney claims set for ${email}`)
}

// Set client role for portal users
export const setClientClaims = async (uid: string, portalUuid: string) => {
  const claims: UserClaims = {
    role: 'client',
    client: true,
    portalAccess: [portalUuid],
  }

  await adminAuth.setCustomUserClaims(uid, claims)
  console.log(`Client claims set for portal ${portalUuid}`)
}

// Verify attorney role from token
export const verifyAttorneyToken = async (
  idToken: string
): Promise<boolean> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken.role === 'attorney'
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}

// Verify client role and portal access
export const verifyClientPortalAccess = async (
  idToken: string,
  portalUuid: string
): Promise<boolean> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return (
      decodedToken.role === 'client' &&
      Array.isArray(decodedToken.portalAccess) &&
      decodedToken.portalAccess.includes(portalUuid)
    )
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}
