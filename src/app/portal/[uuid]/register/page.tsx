'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { logPortalError, logAuthError, logSuccess } from '@/lib/logging/structured-logger'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function PortalRegisterPage() {
  const params = useParams()
  const router = useRouter()
  const uuid = params.uuid as string
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      logPortalError('validate_registration_form', 'Missing email or password', { portalUuid: uuid, hasEmail: !!email, hasPassword: !!password }, 'Email and password are required for registration', 'Ensure both email and password fields are filled')
      return
    }

    if (password.length < 6) {
      logPortalError('validate_password_length', 'Password too short', { portalUuid: uuid, passwordLength: password.length }, 'Password must be at least 6 characters long', 'Use a password with at least 6 characters')
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        clientAuth,
        email,
        password
      )
      logSuccess('Portal Registration', 'create_user', { portalUuid: uuid, userId: userCredential.user.uid }, 'New user successfully created for portal')

      // Update portal registration status to completed
      const response = await fetch('/api/portal/update-registration-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portalUuid: uuid,
        }),
      })

      if (!response.ok) {
        logPortalError('update_registration_status', 'API response not ok', { portalUuid: uuid, responseStatus: response.status }, 'Failed to update portal registration status to completed', 'Check API endpoint and portal UUID validity')
      }

      // Set custom claims for the new client user
      const claimsResponse = await fetch('/api/portal/set-client-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          portalUuid: uuid,
        }),
      })

      if (!claimsResponse.ok) {
        logAuthError('set_client_claims', 'API response not ok', { portalUuid: uuid, userId: userCredential.user.uid, responseStatus: claimsResponse.status }, 'Failed to set custom claims for new client user', 'Check custom claims API and user permissions')
      }

      router.push(`/portal/${uuid}`)
    } catch (error) {
      logPortalError('register_client_user', error, { portalUuid: uuid, email }, 'Portal registration process failed', 'Check network connectivity and Firebase Auth configuration')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Portal Registration</CardTitle>
          <CardDescription>Portal ID: {uuid}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
