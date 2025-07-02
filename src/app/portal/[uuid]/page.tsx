"use client"

import { useParams, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PortalDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const uuid = params.uuid as string

  const handleSignOut = async () => {
    try {
      await signOut(clientAuth)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-8 max-w-md w-full">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Client Portal
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome to your client dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portal Information</CardTitle>
            <CardDescription>
              Your portal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Portal ID: {uuid}
            </p>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}