'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import {
  DocumentDuplicateIcon,
  FolderIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { onAuthStateChanged } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { logClientError } from '@/lib/client-error-logger'
import { CaseData, DocumentData } from '@/types/schemas'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

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
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage case documents and files
              </p>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Case Selector Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Select Case
                  </h3>
                  <div className="space-y-2">
                    {cases.map((caseData) => (
                      <button
                        key={caseData.caseId}
                        onClick={() => handleCaseSelect(caseData.caseId)}
                        className={classNames(
                          selectedCaseId === caseData.caseId
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-500'
                            : 'text-gray-700 hover:bg-gray-50 border-gray-300',
                          'w-full text-left px-3 py-2 border rounded-md text-sm font-medium transition-colors'
                        )}
                      >
                        <div className="flex items-center">
                          <FolderIcon className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{caseData.caseId}</div>
                            <div className="text-xs text-gray-500">{caseData.caseType}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Documents
                      {selectedCaseId && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({filteredDocuments.length})
                        </span>
                      )}
                    </h3>
                    
                    {selectedCaseId && (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {!selectedCaseId ? (
                    <div className="text-center py-12">
                      <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No case selected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a case from the sidebar to view documents
                      </p>
                    </div>
                  ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms' : 'Upload documents to get started'}
                      </p>
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
                              
                              <Menu as="div" className="relative inline-block text-left">
                                <div>
                                  <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                  </MenuButton>
                                </div>

                                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  <div className="py-1">
                                    <MenuItem>
                                      <button
                                        onClick={() => handleViewDocument(document)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        View
                                      </button>
                                    </MenuItem>
                                    <MenuItem>
                                      <button
                                        onClick={() => handleDownloadDocument(document)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                        Download
                                      </button>
                                    </MenuItem>
                                  </div>
                                </MenuItems>
                              </Menu>
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
      <Dialog open={isUploadOpen} onClose={setIsUploadOpen} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Upload Document
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Select a case and upload a document. Feature coming soon with drag-and-drop interface.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}