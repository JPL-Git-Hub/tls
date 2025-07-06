import { NextRequest, NextResponse } from 'next/server'
import { createDocument } from '@/lib/firebase/firestore'
import { DocumentData, DocumentType } from '@/types/schemas'
import { logApiError } from '@/lib/logging/structured-logger'

type CreateDocumentRequest = {
  caseId: string
  fileName: string
  fileUrl: string
  docType: DocumentType
  uploadedAt: string
}

export async function POST(request: NextRequest) {
  let documentData: CreateDocumentRequest | undefined

  try {
    const body = await request.json()
    documentData = body

    // Validate required fields
    if (
      !documentData?.caseId ||
      !documentData?.fileName ||
      !documentData?.fileUrl ||
      !documentData?.docType ||
      !documentData?.uploadedAt
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields: caseId, fileName, fileUrl, docType, uploadedAt',
        },
        { status: 400 }
      )
    }

    // Create document metadata using established firestore.ts function
    const documentId = await createDocument({
      caseId: documentData.caseId,
      fileName: documentData.fileName,
      fileUrl: documentData.fileUrl,
      docType: documentData.docType,
      uploadedAt: new Date(documentData.uploadedAt),
    })

    return NextResponse.json({
      success: true,
      documentId,
      message: 'Document metadata created successfully',
    })
  } catch (error) {
    logApiError(
      'DOCUMENT_METADATA_CREATION_FAILED',
      error,
      {
        documentData: documentData
          ? {
              caseId: documentData.caseId,
              fileName: documentData.fileName,
              docType: documentData.docType,
            }
          : undefined,
      }
    )

    return NextResponse.json(
      {
        error: 'Failed to create document metadata',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}