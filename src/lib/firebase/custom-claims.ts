import { adminAuth } from '@/lib/firebase/admin'
import { UserClaims } from '@/lib/utils/claims'
import { logAuthError, logSuccess } from '@/lib/logging/structured-logger'

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
  logSuccess('Authentication', 'set_attorney_claims', { uid, email }, `Attorney claims set for ${email}`)
}

// Set client role for portal users
export const setClientClaims = async (uid: string, portalUuid: string) => {
  const claims: UserClaims = {
    role: 'client',
    client: true,
    portalAccess: [portalUuid],
  }

  await adminAuth.setCustomUserClaims(uid, claims)
  logSuccess('Authentication', 'set_client_claims', { uid, portalUuid }, `Client claims set for portal ${portalUuid}`)
}

// Verify attorney role from token
export const verifyAttorneyToken = async (
  idToken: string
): Promise<boolean> => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken.role === 'attorney'
  } catch (error) {
    logAuthError('verify_attorney_token', error, { tokenProvided: !!idToken }, 'Attorney token verification failed', 'Check token validity and Firebase Auth configuration')
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
    logAuthError('verify_client_portal_access', error, { tokenProvided: !!idToken, portalUuid }, 'Client portal access verification failed', 'Check token validity and portal access permissions')
    return false
  }
}
