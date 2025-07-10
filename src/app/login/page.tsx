'use client'

import { useState } from 'react'
import { Button } from '@/catalyst/components/button'
import { Heading } from '@/catalyst/components/heading'
import { Text } from '@/catalyst/components/text'
import { signInWithGoogle } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { logClientError } from '@/lib/client-error-logger'
import { theme } from '@/catalyst/theme'

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
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <main className="flex min-h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-sm">
          <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <Heading level={2} className="text-2xl font-bold">
              Attorney Login
            </Heading>
            <Text className="mt-2 text-sm text-gray-600">
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
          <Text className="mt-4 text-center text-sm text-gray-500">
            Access the attorney dashboard and case management system
          </Text>
        </div>
      </main>
    </div>
  )
}
