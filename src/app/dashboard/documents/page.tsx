'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/catalyst/components/dialog'
import { Button } from '@/catalyst/components/button'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/catalyst/components/dropdown'
import { Input } from '@/catalyst/components/input'
import { Heading } from '@/catalyst/components/heading'
import { Text } from '@/catalyst/components/text'
import {
  DocumentDuplicateIcon,
  FolderIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { onAuthStateChanged } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { logClientError } from '@/lib/client-error-logger'
import { CaseData, DocumentData } from '@/types/schemas'

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [cases, setCases] = useState<CaseData[]>([])
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult()
          const claims = idTokenResult.claims as { role?: string }
          
          if (claims.role === 'attorney') {
            setUser(user)
            setIsAuthorized(true)
            fetchCases()
          } else {
            logClientError(
              new Error('Attorney role not found in claims'),
              { 
                userEmail: user.email,
                operation: 'documents_access_denied'
              }
            )
            router.push('/login')
          }
        } catch (error) {
          logClientError(
            error,
            { 
              userEmail: user.email,
              operation: 'documents_auth_check'
            }
          )
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases/list')
      const data = await response.json()
      
      if (data.success) {
        setCases(data.cases)
      } else {
        logClientError(
          new Error(data.error),
          { 
            operation: 'cases_fetch_failed',
            apiError: data.error
          }
        )
      }
    } catch (error) {
      logClientError(
        error,
        { operation: 'cases_fetch_failed' }
      )
    }
  }

  const fetchDocuments = async (caseId: string) => {
    try {
      const response = await fetch(`/api/documents/list?caseId=${caseId}`)
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.documents)
      } else {
        logClientError(
          new Error(data.error),
          { 
            operation: 'documents_fetch_failed',
            caseId,
            apiError: data.error
          }
        )
        setDocuments([])
      }
    } catch (error) {
      logClientError(
        error,
        { operation: 'documents_fetch_failed', caseId }
      )
      setDocuments([])
    }
  }

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId)
    fetchDocuments(caseId)
  }

  const handleViewDocument = (document: DocumentData) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }

  const handleDownloadDocument = (document: DocumentData) => {
    if (document.fileUrl) {
      const link = document.createElement('a')
      link.href = document.fileUrl
      link.download = document.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDeleteDocument = async (document: DocumentData) => {
    if (!confirm(`Are you sure you want to delete "${document.fileName}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId: document.documentId }),
      })

      if (response.ok) {
        // Refresh the document list
        if (selectedCaseId) {
          fetchDocuments(selectedCaseId)
        }
      } else {
        const error = await response.json()
        logClientError(
          new Error(error.message || 'Failed to delete document'),
          { documentId: document.documentId, operation: 'delete_document' }
        )
        alert('Failed to delete document')
      }
    } catch (error) {
      logClientError(
        error,
        { documentId: document.documentId, operation: 'delete_document' }
      )
      alert('Failed to delete document')
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.docType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Heading level={1}>Document Management</Heading>
              <Text className="mt-1">
                Manage case documents and files
              </Text>
            </div>
            <Button
              onClick={() => setIsUploadOpen(true)}
              color="indigo"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Case Selector Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Heading level={3} className="mb-4">
                    Select Case
                  </Heading>
                  <div className="space-y-2">
                    {cases.map((caseData) => (
                      <Button
                        key={caseData.caseId}
                        onClick={() => handleCaseSelect(caseData.caseId)}
                        color={selectedCaseId === caseData.caseId ? 'indigo' : 'white'}
                        className="w-full text-left"
                      >
                        <div className="flex items-center">
                          <FolderIcon className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{caseData.caseId}</div>
                            <div className="text-xs text-gray-500">{caseData.caseType}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow-sm rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <Heading level={3}>
                      Documents
                      {selectedCaseId && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({filteredDocuments.length})
                        </span>
                      )}
                    </Heading>
                    
                    {selectedCaseId && (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Search documents..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2"
                        />
                      </div>
                    )}
                  </div>

                  {!selectedCaseId ? (
                    <div className="text-center py-12">
                      <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <Heading level={3} className="mt-2">No case selected</Heading>
                      <Text className="mt-1">
                        Select a case from the sidebar to view documents
                      </Text>
                    </div>
                  ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <Heading level={3} className="mt-2">No documents found</Heading>
                      <Text className="mt-1">
                        {searchTerm ? 'Try adjusting your search terms' : 'Upload documents to get started'}
                      </Text>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {filteredDocuments.map((document) => (
                          <li key={document.documentId} className="py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <DocumentDuplicateIcon className="h-8 w-8 text-gray-400 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {document.fileName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {document.docType} • {new Date(document.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              <Dropdown>
                                <DropdownButton color="white" className="px-3 py-2">
                                  <EllipsisVerticalIcon className="h-5 w-5" />
                                </DropdownButton>
                                <DropdownMenu>
                                  <DropdownItem onClick={() => handleViewDocument(document)}>
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleDownloadDocument(document)}>
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleDeleteDocument(document)}>
                                    <TrashIcon className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onClose={setIsUploadOpen}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Select a case and upload a document. Feature coming soon with drag-and-drop interface.
        </DialogDescription>
        <DialogBody>
          <Text>
            Select a case and upload a document. Feature coming soon with drag-and-drop interface.
          </Text>
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsUploadOpen(false)} color="white">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}