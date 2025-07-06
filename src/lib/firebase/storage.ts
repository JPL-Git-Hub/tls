import { clientStorage } from '@/lib/firebase/client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { logFirebaseError } from '@/lib/logging/structured-logger'

// Client-side Storage operations using Firebase SDK
// Used in React components and client-side logic

export const uploadDocument = async (
  file: File,
  caseId: string
): Promise<string> => {
  let fileName: string | undefined
  let filePath: string | undefined

  try {
    fileName = file.name
    filePath = `documents/${caseId}/${Date.now()}_${fileName}`
    const storageRef = ref(clientStorage, filePath)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    logFirebaseError(
      'document_upload',
      error,
      {
        caseId,
        fileName,
        filePath,
        fileSize: file?.size,
        fileType: file?.type,
      },
      'Failed to upload document to Firebase Storage',
      'Verify Firebase Storage rules, file permissions, and storage bucket configuration'
    )
    throw error
  }
}
