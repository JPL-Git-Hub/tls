'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signInWithGoogle } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { logAuthError } from '@/lib/logging/structured-logger'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    let userEmail: string | undefined

    try {
      const userCredential = await signInWithGoogle()
      const user = userCredential.user
      userEmail = user.email || undefined

      // Check custom claims for attorney authorization
      const idTokenResult = await user.getIdTokenResult()
      const claims = idTokenResult.claims as { role?: string }

      if (claims.role !== 'attorney') {
        logAuthError('attorney_authorization', 'Attorney claims not found', { userEmail }, 'Attorney authorization failed - custom claims check', 'Check custom claims configuration for attorney role')
        return
      }

      router.push('/admin')
    } catch (error) {
      logAuthError(
        'attorney_login',
        error,
        { 
          email: userEmail,
          domain_check: userEmail?.endsWith('@thelawshop.com')
        },
        'Failed to authenticate attorney via Google OAuth',
        'Verify Google OAuth configuration and domain restrictions'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Attorney Login</CardTitle>
          <CardDescription>
            Sign in with your @thelawshop.com Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
