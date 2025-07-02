"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/auth'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, (user) => {
      setUser(user)
      setIsLoading(false)
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check domain restriction
      if (!user.email?.endsWith('@thelawshop.com')) {
        console.error('Admin access denied - domain verification failed:', user.email)
        router.push('/login')
        return
      }

      // Check authorized attorney list
      const authorizedAttorneys = process.env.NEXT_PUBLIC_AUTHORIZED_ATTORNEYS?.split(',').map(email => email.trim()) || []
      
      if (!authorizedAttorneys.includes(user.email)) {
        console.error('Admin access denied - attorney authorization failed:', user.email)
        router.push('/login')
        return
      }
    })

    return () => unsubscribe()
  }, [router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut(clientAuth)
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Welcome Message */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome back, {user.displayName || user.email}
          </p>
        </div>

        {/* Sign Out Button */}
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleSignOut}
          className="w-full"
        >
          Sign Out
        </Button>

        {/* Portal Management Card */}
        <Link href="/admin/portals" className="w-full">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle>Portal Management</CardTitle>
              <CardDescription>
                Create and manage client portals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up new client portals and manage existing ones
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}