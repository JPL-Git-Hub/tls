'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DocumentUpload } from '@/components/ui/document-upload'
import { DocumentViewer } from '@/components/ui/document-viewer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { uploadDocument } from '@/lib/firebase/storage'
import { CaseData, DocumentData } from '@/types/schemas'
import { isAttorneyRole } from '@/lib/utils/claims'
import { logClientError } from '@/lib/client-error-logger'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [cases, setCases] = useState<CaseData[]>([])
  const [casesLoading, setCasesLoading] = useState(true)
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async user => {
      setUser(user)
      setIsLoading(false)

      if (!user) {
        router.push('/login')
        return
      }

      try {
        // Check custom claims for attorney authorization
        const idTokenResult = await user.getIdTokenResult()

        if (!isAttorneyRole(idTokenResult.claims)) {
          logClientError(new Error('Attorney claims not found'), { operation: 'verify_attorney_claims', userEmail: user.email })
          router.push('/login')
          return
        }
      } catch (error) {
        logClientError(error, { operation: 'verify_attorney_claims', userEmail: user.email })
        router.push('/login')
        return
      }
    })

    return () => unsubscribe()
  }, [router])

  // Fetch cases
  useEffect(() => {
    const fetchCases = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/case/list')
        const data = await response.json()

        if (data.success) {
          setCases(data.cases)
        } else {
          logClientError(new Error(data.error), { operation: 'fetch_cases' })
        }
      } catch (error) {
        logClientError(error, { operation: 'fetch_cases' })
      } finally {
        setCasesLoading(false)
      }
    }

    fetchCases()
  }, [user])

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
      logClientError(error, { operation: 'sign_out', userEmail: user?.email })
    }
  }

  const handleDocumentUpload = async (file: File, caseId: string) => {
    setIsUploading(true)
    try {
      const downloadURL = await uploadDocument(file, caseId)
      
      // Create document metadata in Firestore
      const metadataResponse = await fetch('/api/documents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          fileName: file.name,
          fileUrl: downloadURL,
          docType: 'contract of sale', // Default document type
          uploadedAt: new Date().toISOString(),
        }),
      })

      const metadataResult = await metadataResponse.json()
      
      if (metadataResult.success) {
        console.log('Document upload success:', { operation: 'document_upload', caseId, fileName: file.name, documentId: metadataResult.documentId })
        alert('Document uploaded successfully!')
      } else {
        throw new Error(metadataResult.error || 'Failed to create document metadata')
      }
    } catch (error) {
      logClientError(error, { operation: 'document_upload', caseId, fileName: file.name })
      alert('Failed to upload document: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsUploading(false)
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

        {/* Document Upload Section */}
        <div className="w-full space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Case</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                onValueChange={setSelectedCaseId}
                value={selectedCaseId}
                disabled={casesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      casesLoading
                        ? 'Loading cases...'
                        : 'Choose a case for document upload'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cases.map(caseData => (
                    <SelectItem key={caseData.caseId} value={caseData.caseId}>
                      {caseData.caseId}
                    </SelectItem>
                  ))}
                  {cases.length === 0 && !casesLoading && (
                    <SelectItem value="no-cases" disabled>
                      No cases found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <DocumentUpload
            onUpload={handleDocumentUpload}
            selectedCaseId={selectedCaseId}
            isUploading={isUploading}
          />
        </div>

        {/* Document Viewer Section */}
        <DocumentViewer documents={documents} />
      </div>
    </div>
  )
}
