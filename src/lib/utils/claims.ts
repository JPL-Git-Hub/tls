// Client-safe custom claims utilities
// No Firebase Admin SDK imports - safe for browser use

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