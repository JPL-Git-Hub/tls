'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentViewer } from '@/components/ui/document-viewer'
import { DocumentData } from '@/types/schemas'
import { logPortalError } from '@/lib/client-error-logger'

export default function PortalDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const uuid = params.uuid as string
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/portal/documents?portalUuid=${uuid}`)
        const data = await response.json()
        
        if (data.success) {
          setDocuments(data.documents)
        } else {
          logClientError('fetch_documents', data.error, { portalUuid: uuid }, 'Failed to fetch documents for portal', 'Check portal UUID validity and document permissions')
          setDocuments([])
        }
      } catch (error) {
        logClientError('fetch_documents_network', error, { portalUuid: uuid }, 'Network error while fetching portal documents', 'Check network connectivity and API endpoint availability')
        setDocuments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [uuid])

  const handleSignOut = async () => {
    try {
      await signOut(clientAuth)
      router.push('/')
    } catch (error) {
      logClientError('sign_out', error, { portalUuid: uuid }, 'Portal sign out failed', 'Check Firebase Auth configuration and network connectivity')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Client Portal
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome to your client dashboard
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Portal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Portal Information</CardTitle>
            <CardDescription>Your portal details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Portal ID: {uuid}</p>
          </CardContent>
        </Card>

        {/* Document Viewer */}
        <DocumentViewer documents={documents} />
      </div>
    </div>
  )
}
