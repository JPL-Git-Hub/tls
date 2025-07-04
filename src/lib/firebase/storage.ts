import { clientStorage } from '@/lib/firebase/client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Client-side Storage operations using Firebase SDK
// Used in React components and client-side logic

export const uploadDocument = async (file: File, caseId: string): Promise<string> => {
  let fileName: string | undefined;
  let filePath: string | undefined;
  
  try {
    fileName = file.name;
    filePath = `documents/${caseId}/${Date.now()}_${fileName}`;
    const storageRef = ref(clientStorage, filePath)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Failed to upload document:', JSON.stringify({
      error_code: 'DOCUMENT_UPLOAD_FAILED',
      message: 'Failed to upload document to Firebase Storage',
      service: 'Firebase Storage',
      operation: 'document_upload',
      context: { caseId, fileName, filePath, fileSize: file?.size, fileType: file?.type },
      remediation: 'Verify Firebase Storage rules, file permissions, and storage bucket configuration',
      original_error: error.message
    }, null, 2));
    throw error;
  }
}