'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { UserClaims, isAttorneyRole } from '@/lib/utils/claims'
import { logAuthError } from '@/lib/logging/structured-logger'

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
          const claims = idTokenResult.claims as UserClaims
          setIsAttorney(isAttorneyRole(claims))
        } catch (error) {
          logAuthError(
            'AUTH_CLAIMS_VERIFICATION_FAILED',
            error,
            { userEmail, userId }
          )
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

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAttorney,
      isLoading,
      signOut: handleSignOut,
    }),
    [user, isAttorney, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
