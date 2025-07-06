// Centralized structured logging utilities with predefined error codes
// Maps error codes to standardized messages and remediation steps

import fs from 'fs'

interface LogEntry {
  error_code: string
  message: string
  service: string
  operation: string
  context?: Record<string, unknown>
  remediation: string
  original_error?: string
}

interface ErrorDefinition {
  message: string
  service: string
  operation: string
  remediation: string
}

// Centralized error code definitions
const ERROR_DEFINITIONS: Record<string, ErrorDefinition> = {
  // Firebase errors
  'FIREBASE_CLIENT_CREATION_FAILED': {
    message: 'Failed to create client in Firebase',
    service: 'Firebase Firestore',
    operation: 'create_client',
    remediation: 'Check Firebase configuration and client data validation'
  },
  'FIREBASE_DOCUMENT_FETCH_FAILED': {
    message: 'Failed to fetch document from Firebase',
    service: 'Firebase Firestore', 
    operation: 'fetch_document',
    remediation: 'Check document permissions and network connectivity'
  },
  'FIREBASE_AUTH_TOKEN_VERIFICATION_FAILED': {
    message: 'Firebase authentication token verification failed',
    service: 'Firebase Auth',
    operation: 'verify_token',
    remediation: 'Check token validity and Firebase Auth configuration'
  },
  'FIREBASE_CUSTOM_CLAIMS_SET_FAILED': {
    message: 'Failed to set Firebase custom claims',
    service: 'Firebase Auth',
    operation: 'set_custom_claims',
    remediation: 'Check user permissions and Firebase Admin SDK configuration'
  },

  // Portal errors
  'PORTAL_DOCUMENTS_FETCH_FAILED': {
    message: 'Failed to fetch documents for portal',
    service: 'Portal System',
    operation: 'fetch_documents',
    remediation: 'Check portal UUID validity and document permissions'
  },
  'PORTAL_REGISTRATION_VALIDATION_FAILED': {
    message: 'Portal registration form validation failed',
    service: 'Portal System',
    operation: 'validate_registration',
    remediation: 'Ensure all required fields are properly filled'
  },
  'PORTAL_USER_CREATION_FAILED': {
    message: 'Failed to create user for portal',
    service: 'Portal System',
    operation: 'create_user',
    remediation: 'Check Firebase Auth configuration and network connectivity'
  },
  'PORTAL_STATUS_UPDATE_FAILED': {
    message: 'Failed to update portal status',
    service: 'Portal System',
    operation: 'update_status',
    remediation: 'Check portal document exists and update permissions'
  },

  // Form errors
  'FORM_CLIENT_LEAD_SUBMISSION_FAILED': {
    message: 'Client lead form submission failed',
    service: 'Form Processing',
    operation: 'submit_client_lead',
    remediation: 'Check form validation and API endpoint availability'
  },
  'FORM_VALIDATION_FAILED': {
    message: 'Form validation failed',
    service: 'Form Processing',
    operation: 'validate_form',
    remediation: 'Check form field requirements and validation rules'
  },

  // API errors
  'API_ENDPOINT_FAILED': {
    message: 'API endpoint request failed',
    service: 'API',
    operation: 'api_request',
    remediation: 'Check API endpoint availability and request parameters'
  },
  'API_AUTHENTICATION_FAILED': {
    message: 'API authentication failed',
    service: 'API',
    operation: 'authenticate_request',
    remediation: 'Check authentication credentials and permissions'
  },
  'CLIENT_CASE_CREATION_FAILED': {
    message: 'Failed to create client and case documents',
    service: 'Firebase Firestore',
    operation: 'client_case_creation_api',
    remediation: 'Verify Firebase Admin SDK permissions and request data validation'
  },
  'CASES_LIST_RETRIEVAL_FAILED': {
    message: 'Failed to retrieve cases collection from API endpoint',
    service: 'Firebase Firestore',
    operation: 'cases_list_api',
    remediation: 'Verify Firebase Admin SDK permissions and API authentication'
  },
  'DOCUMENT_METADATA_CREATION_FAILED': {
    message: 'Failed to create document metadata in Firestore',
    service: 'Firebase Firestore',
    operation: 'document_metadata_creation',
    remediation: 'Verify Firebase Admin SDK permissions and document data format'
  },
  'CUSTOM_CLAIMS_SET_FAILED': {
    message: 'Failed to set custom claims for client user',
    service: 'Firebase Admin Auth',
    operation: 'set_custom_user_claims',
    remediation: 'Verify Firebase Admin SDK permissions and user exists'
  },

  // UI component errors
  'DOCUMENTS_FETCH_FAILED': {
    message: 'Failed to fetch documents from API',
    service: 'UI Component',
    operation: 'fetch_documents',
    remediation: 'Check API endpoint availability and case ID validity'
  },
  'DOCUMENT_DOWNLOAD_URL_FAILED': {
    message: 'Failed to get document download URL from Firebase Storage',
    service: 'Firebase Storage',
    operation: 'get_download_url',
    remediation: 'Check document exists in Firebase Storage and permissions'
  },
  'DOCUMENT_DOWNLOAD_FAILED': {
    message: 'Failed to download document file',
    service: 'Firebase Storage',
    operation: 'download_document',
    remediation: 'Check document exists in Firebase Storage and network connectivity'
  },
  'CLIENT_LOGIN_FAILED': {
    message: 'Client authentication failed',
    service: 'Firebase Auth',
    operation: 'client_login',
    remediation: 'Check credentials and authentication configuration'
  },
  'GOOGLE_SIGNIN_FAILED': {
    message: 'Google sign-in authentication failed',
    service: 'Firebase Auth',
    operation: 'google_signin',
    remediation: 'Check Google OAuth configuration and network connectivity'
  },

  // Auth errors
  'AUTH_LOGIN_FAILED': {
    message: 'User login failed',
    service: 'Authentication',
    operation: 'login_user',
    remediation: 'Check credentials and authentication service availability'
  },
  'AUTH_TOKEN_EXPIRED': {
    message: 'Authentication token expired',
    service: 'Authentication', 
    operation: 'verify_token',
    remediation: 'Refresh authentication token or re-login'
  },
  'AUTH_CLAIMS_VERIFICATION_FAILED': {
    message: 'Custom claims verification failed',
    service: 'Authentication',
    operation: 'verify_claims',
    remediation: 'Check user permissions and custom claims configuration'
  },

  // Client operations
  'CLIENT_CREATION_FAILED': {
    message: 'Failed to create client document in Firestore',
    service: 'Firebase Firestore',
    operation: 'client_creation',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  },
  'CLIENT_RETRIEVAL_FAILED': {
    message: 'Failed to retrieve client document from Firestore',
    service: 'Firebase Firestore',
    operation: 'client_retrieval',
    remediation: 'Verify client exists and Firebase Admin SDK permissions'
  },
  'CLIENT_UPDATE_FAILED': {
    message: 'Failed to update client document in Firestore',
    service: 'Firebase Firestore',
    operation: 'client_update',
    remediation: 'Verify client exists and Firebase Admin SDK permissions'
  },

  // Portal operations
  'PORTAL_CREATION_FAILED': {
    message: 'Failed to create portal document in Firestore',
    service: 'Firebase Firestore',
    operation: 'portal_creation',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  },
  'PORTAL_RETRIEVAL_FAILED': {
    message: 'Failed to retrieve portal document from Firestore',
    service: 'Firebase Firestore',
    operation: 'portal_retrieval',
    remediation: 'Verify portal exists and Firebase Admin SDK permissions'
  },
  'PORTAL_UPDATE_FAILED': {
    message: 'Failed to update portal document in Firestore',
    service: 'Firebase Firestore',
    operation: 'portal_update',
    remediation: 'Verify portal exists and Firebase Admin SDK permissions'
  },

  // Case operations
  'CASE_CREATION_FAILED': {
    message: 'Failed to create case document in Firestore',
    service: 'Firebase Firestore',
    operation: 'case_creation',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  },
  'CLIENT_CASE_RELATIONSHIP_FAILED': {
    message: 'Failed to create client-case junction record',
    service: 'Firebase Firestore',
    operation: 'client_case_relationship_creation',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  },
  'CASES_RETRIEVAL_FAILED': {
    message: 'Failed to retrieve cases collection from Firestore',
    service: 'Firebase Firestore',
    operation: 'cases_list_retrieval',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  },
  'CLIENT_CASES_RETRIEVAL_FAILED': {
    message: 'Failed to retrieve cases for client from Firestore',
    service: 'Firebase Firestore',
    operation: 'client_cases_retrieval',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  },

  // Document operations
  'DOCUMENT_CREATION_FAILED': {
    message: 'Failed to create document metadata in Firestore',
    service: 'Firebase Firestore',
    operation: 'document_creation',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  },
  'DOCUMENTS_BY_CASE_RETRIEVAL_FAILED': {
    message: 'Failed to retrieve documents for case from Firestore',
    service: 'Firebase Firestore',
    operation: 'documents_by_case_retrieval',
    remediation: 'Verify Firebase Admin SDK permissions and Firestore rules'
  }
} as const

const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

const createLogEntry = (
  errorCode: string,
  error: unknown,
  context?: Record<string, unknown>
): LogEntry => {
  const definition = ERROR_DEFINITIONS[errorCode]
  
  if (!definition) {
    throw new Error(`Unknown error code: ${errorCode}. Please add to ERROR_DEFINITIONS.`)
  }
  
  return {
    error_code: errorCode,
    message: definition.message,
    service: definition.service,
    operation: definition.operation,
    context,
    remediation: definition.remediation,
    original_error: formatError(error)
  }
}

// Firebase-specific logging
export const logFirebaseError = (
  errorCode: keyof typeof ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createLogEntry(errorCode, error, context)
  console.error(`Firebase error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Automatic file logging in development
  if (process.env.NODE_ENV === 'development') {
    fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
  }
}

// Portal-specific logging
export const logPortalError = (
  errorCode: keyof typeof ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createLogEntry(errorCode, error, context)
  console.error(`Portal error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Automatic file logging in development
  if (process.env.NODE_ENV === 'development') {
    fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
  }
}

// Form-specific logging
export const logFormError = (
  errorCode: keyof typeof ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createLogEntry(errorCode, error, context)
  console.error(`Form error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Automatic file logging in development
  if (process.env.NODE_ENV === 'development') {
    fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
  }
}

// API-specific logging
export const logApiError = (
  errorCode: keyof typeof ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createLogEntry(errorCode, error, context)
  console.error(`API error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Automatic file logging in development
  if (process.env.NODE_ENV === 'development') {
    fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
  }
}

// Auth-specific logging
export const logAuthError = (
  errorCode: keyof typeof ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createLogEntry(errorCode, error, context)
  console.error(`Auth error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Automatic file logging in development
  if (process.env.NODE_ENV === 'development') {
    fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
  }
}

// Generic structured logging for cases not covered by specific services
export const logError = (
  errorCode: keyof typeof ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createLogEntry(errorCode, error, context)
  console.error(`${logEntry.service} error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Automatic file logging in development
  if (process.env.NODE_ENV === 'development') {
    fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
  }
}

// Success logging for important operations
export const logSuccess = (
  service: string,
  operation: string,
  context?: Record<string, unknown>,
  customMessage?: string
) => {
  const message = customMessage || `${service} ${operation} completed successfully`
  
  console.log(`${service} success - ${operation}:`, JSON.stringify({
    message,
    service,
    operation,
    context,
    timestamp: new Date().toISOString()
  }, null, 2))
}