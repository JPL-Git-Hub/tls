'use client'

import { useState } from 'react'
import { Button } from '@/catalyst/components/button'
import { Heading } from '@/catalyst/components/heading'
import { Text } from '@/catalyst/components/text'
import { signInWithGoogle } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { logClientError } from '@/lib/client-error-logger'

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
        logClientError(
          new Error('Attorney claims not found'),
          { userEmail, operation: 'attorney_authorization' }
        )
        return
      }

      router.push('/dashboard')
    } catch (error) {
      logClientError(
        error,
        { 
          email: userEmail,
          domain_check: userEmail?.endsWith('@thelawshop.com'),
          operation: 'attorney_login'
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-sm ring-1 ring-gray-950/5 p-8">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Heading level={2} className="text-2xl font-bold text-indigo-600">
              Attorney Login
            </Heading>
            <Text className="text-gray-600">
              Sign in with your @thelawshop.com Google account
            </Text>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            color="indigo"
            className="w-full h-12 text-base"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Footer */}
          <Text className="text-sm text-gray-500">
            Access the attorney dashboard and case management system
          </Text>
        </div>
      </div>
    </div>
  )
}
