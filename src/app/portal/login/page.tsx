'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { signInWithGoogle } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { isClientRole } from '@/lib/utils/claims'
import Link from 'next/link'
import { logAuthError } from '@/lib/logging/structured-logger'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const authenticateUser = async (user: any) => {
    // Check custom claims for client authorization
    const idTokenResult = await user.getIdTokenResult()
    // Note: User claims logged for debugging - consider removing in production
    
    if (!isClientRole(idTokenResult.claims)) {
      setError('Access denied. This login is for client portal users only.')
      await clientAuth.signOut()
      return false
    }

    // Get portal access from claims
    const portalAccess = idTokenResult.claims.portalAccess as string[]
    if (!portalAccess || portalAccess.length === 0) {
      setError('No portal access found. Please contact your attorney.')
      await clientAuth.signOut()
      return false
    }

    // Redirect to first available portal
    router.push(`/portal/${portalAccess[0]}`)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password)
      await authenticateUser(userCredential.user)
    } catch (error) {
      logAuthError(
        'CLIENT_LOGIN_FAILED',
        error,
        { email, loginMethod: 'email_password' }
      )
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          setError('No account found with this email address.')
        } else if (error.message.includes('wrong-password')) {
          setError('Incorrect password.')
        } else if (error.message.includes('too-many-requests')) {
          setError('Too many failed attempts. Please try again later.')
        } else {
          setError('Login failed. Please check your credentials.')
        }
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const userCredential = await signInWithGoogle()
      await authenticateUser(userCredential.user)
    } catch (error) {
      logAuthError(
        'GOOGLE_SIGNIN_FAILED',
        error,
        { loginMethod: 'google_oauth' }
      )
      setError('Google sign-in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Client Portal Login</CardTitle>
          <CardDescription>
            Sign in to access your case documents and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}