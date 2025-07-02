"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signInWithGoogle } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    
    try {
      const userCredential = await signInWithGoogle()
      const user = userCredential.user
      
      // Check domain restriction
      if (!user.email?.endsWith('@thelawshop.com')) {
        console.error('Domain verification failed:', user.email)
        return
      }
      
      // Check authorized attorney list
      const authorizedAttorneys = process.env.NEXT_PUBLIC_AUTHORIZED_ATTORNEYS?.split(',').map(email => email.trim()) || []
      
      if (!authorizedAttorneys.includes(user.email)) {
        console.error('Attorney authorization failed:', user.email)
        return
      }
      
      router.push('/admin')
    } catch (error) {
      console.error('Login error:', error)
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