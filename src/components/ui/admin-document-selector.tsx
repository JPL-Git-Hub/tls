'use client'

import { useState, useEffect } from 'react'
import { getDownloadURL, ref } from 'firebase/storage'
import { clientStorage } from '@/lib/firebase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Download, Eye, Folder } from 'lucide-react'
import { CaseData, DocumentData } from '@/types/schemas'
import { logApiError, logError } from '@/lib/logging/structured-logger'

interface AdminDocumentSelectorProps {
  cases: CaseData[]
}

export function AdminDocumentSelector({ cases }: AdminDocumentSelectorProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedCaseId) {
      fetchDocuments(selectedCaseId)
    } else {
      setDocuments([])
    }
  }, [selectedCaseId])

  const fetchDocuments = async (caseId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/documents/list?caseId=${caseId}`)
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.documents)
      } else {
        logApiError(
          'DOCUMENTS_FETCH_FAILED',
          new Error(data.error),
          { caseId, apiError: data.error }
        )
        setDocuments([])
      }
    } catch (error) {
      logApiError(
        'DOCUMENTS_FETCH_FAILED',
        error,
        { caseId }
      )
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDocument = async (document: DocumentData) => {
    try {
      const filePath = `documents/${document.caseId}/${Date.now()}_${document.fileName}`
      const storageRef = ref(clientStorage, filePath)
      const downloadURL = await getDownloadURL(storageRef)
      
      // Open document in new tab
      window.open(downloadURL, '_blank')
    } catch (error) {
      logError(
        'DOCUMENT_DOWNLOAD_URL_FAILED',
        error,
        {
          documentId: document.documentId,
          fileName: document.fileName,
          caseId: document.caseId
        }
      )
      alert('Failed to load document')
    }
  }

  const handleDownload = async (document: DocumentData) => {
    try {
      const filePath = `documents/${document.caseId}/${Date.now()}_${document.fileName}`
      const storageRef = ref(clientStorage, filePath)
      const downloadURL = await getDownloadURL(storageRef)
      
      const link = document.createElement('a')
      link.href = downloadURL
      link.download = document.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      logError(
        'DOCUMENT_DOWNLOAD_FAILED',
        error,
        {
          documentId: document.documentId,
          fileName: document.fileName,
          caseId: document.caseId
        }
      )
      alert('Failed to download document')
    }
  }

  return (
    <div className="space-y-4">
      {/* Case Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedCaseId} value={selectedCaseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a case to view documents" />
            </SelectTrigger>
            <SelectContent>
              {cases.map(caseData => (
                <SelectItem key={caseData.caseId} value={caseData.caseId}>
                  {caseData.caseId} - {caseData.caseType}
                </SelectItem>
              ))}
              {cases.length === 0 && (
                <SelectItem value="no-cases" disabled>
                  No cases found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Documents List */}
      {selectedCaseId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No documents found for this case</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.documentId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{document.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.docType} • Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}