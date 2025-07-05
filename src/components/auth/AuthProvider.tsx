'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'

interface AuthContextType {
  user: User | null
  isAttorney: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAttorney, setIsAttorney] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async firebaseUser => {
      setUser(firebaseUser)

      if (firebaseUser) {
        let userEmail: string | undefined
        let userId: string | undefined
        
        try {
          userEmail = firebaseUser.email || undefined
          userId = firebaseUser.uid
          
          // Use Firebase custom claims for authorization instead of server-side config
          const idTokenResult = await firebaseUser.getIdTokenResult()
          const claims = idTokenResult.claims as { role?: string }
          setIsAttorney(claims.role === 'attorney')
        } catch (error) {
          console.error('Failed to get user claims:', JSON.stringify({
            error_code: 'USER_CLAIMS_RETRIEVAL_FAILED',
            message: 'Failed to retrieve custom claims from Firebase token',
            service: 'Firebase Auth',
            operation: 'get_id_token_result',
            context: { userEmail, userId },
            remediation: 'Check Firebase custom claims configuration and token validity',
            original_error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2))
          setIsAttorney(false)
        }
      } else {
        setIsAttorney(false)
      }

      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    await signOut(clientAuth)
  }

  const value: AuthContextType = {
    user,
    isAttorney,
    isLoading,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
