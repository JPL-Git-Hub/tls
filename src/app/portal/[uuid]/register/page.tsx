'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { logClientError } from '@/lib/client-error-logger'
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
      logClientError(new Error('Missing email or password'), { operation: 'validate_registration_form', portalUuid: uuid, hasEmail: !!email, hasPassword: !!password })
      return
    }

    if (password.length < 6) {
      logClientError(new Error('Password too short'), { operation: 'validate_password_length', portalUuid: uuid, passwordLength: password.length })
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        clientAuth,
        email,
        password
      )
      console.log('Portal registration success:', { operation: 'create_user', portalUuid: uuid, userId: userCredential.user.uid })

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
        logClientError(new Error('API response not ok'), { operation: 'update_registration_status', portalUuid: uuid, responseStatus: response.status })
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
        logClientError(new Error('API response not ok'), { operation: 'set_client_claims', portalUuid: uuid, userId: userCredential.user.uid, responseStatus: claimsResponse.status })
      }

      router.push(`/portal/${uuid}`)
    } catch (error) {
      logClientError(error, { operation: 'register_client_user', portalUuid: uuid, email })
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
