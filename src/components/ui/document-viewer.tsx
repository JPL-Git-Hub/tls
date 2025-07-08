'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import react-pdf to prevent SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Document })), { ssr: false })
const Page = dynamic(() => import('react-pdf').then(mod => ({ default: mod.Page })), { ssr: false })

// Import pdfjs only on client side
let pdfjs: any
if (typeof window !== 'undefined') {
  pdfjs = require('react-pdf').pdfjs
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye, X } from 'lucide-react'
import { DocumentData } from '@/types/schemas'
import { logClientError } from '@/lib/client-error-logger'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'


interface DocumentViewerProps {
  documents: DocumentData[]
}

export function DocumentViewer({ documents }: DocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)

  const handleViewDocument = (document: DocumentData) => {
    if (document.fileUrl) {
      setSelectedDocument(document)
      setPageNumber(1) // Reset to first page
    } else {
      logClientError(
        new Error('No fileUrl found in document metadata'),
        { documentId: document.documentId, operation: 'view_document' }
      )
      alert('Document URL not available. Please contact support.')
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const onDocumentLoadError = (error: Error) => {
    logClientError(
      error,
      { documentId: selectedDocument?.documentId, operation: 'load_pdf' }
    )
    alert('Failed to load document')
  }

  const handleDownload = async (document: DocumentData) => {
    try {
      // Use stored fileUrl for download too
      if (document.fileUrl) {
        const link = window.document.createElement('a')
        link.href = document.fileUrl
        link.download = document.fileName
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
      } else {
        alert('Document URL not available. Please contact support.')
      }
    } catch (error) {
      logClientError(
        error,
        { documentId: document.documentId, fileName: document.fileName, operation: 'download_document' }
      )
      alert('Failed to download document')
    }
  }

  const closeViewer = () => {
    setSelectedDocument(null)
    setNumPages(0)
    setPageNumber(1)
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">No documents available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.documentId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{document.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {document.docType} • {new Date(document.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleViewDocument(document)
                    }}
                    disabled={isLoading}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDownload(document)
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">{selectedDocument.fileName}</h3>
              <div className="flex items-center gap-2">
                {numPages > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {pageNumber} of {numPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber >= numPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={closeViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh]">
              {selectedDocument.fileName.toLowerCase().endsWith('.pdf') ? (
                <div className="flex justify-center">
                  <Document
                    file={selectedDocument.fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<div>Loading PDF...</div>}
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={Math.min(800, window.innerWidth - 100)}
                    />
                  </Document>
                </div>
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Preview not available for this file type
                  </p>
                  <Button onClick={() => handleDownload(selectedDocument)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}