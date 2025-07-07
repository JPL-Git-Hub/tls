// Client-side structured logging utilities with browser-compatible error handling
// Follows structured-logger.ts patterns but designed for browser environment

import React from 'react'

interface ClientLogEntry {
  error_code: string
  message: string
  service: string
  operation: string
  context?: Record<string, unknown>
  remediation: string
  original_error?: string
  timestamp: string
  user_agent?: string
  url?: string
}

interface ErrorDefinition {
  message: string
  service: string
  operation: string
  remediation: string
}

// Client-side error definitions (subset of server-side definitions)
const CLIENT_ERROR_DEFINITIONS: Record<string, ErrorDefinition> = {
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
  
  // Browser-specific errors
  'JAVASCRIPT_RUNTIME_ERROR': {
    message: 'JavaScript runtime error occurred',
    service: 'Browser Runtime',
    operation: 'javascript_execution',
    remediation: 'Check browser console for detailed error information'
  },
  'REACT_COMPONENT_ERROR': {
    message: 'React component error occurred',
    service: 'React Framework',
    operation: 'component_render',
    remediation: 'Check component props and state, review error boundary logs'
  },
  'NETWORK_REQUEST_FAILED': {
    message: 'Network request failed',
    service: 'Browser Network',
    operation: 'network_request',
    remediation: 'Check network connectivity and API endpoint availability'
  },
  'FIREBASE_CLIENT_ERROR': {
    message: 'Firebase client SDK error',
    service: 'Firebase Client',
    operation: 'firebase_client_operation',
    remediation: 'Check Firebase client configuration and network connectivity'
  }
} as const

const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

const createClientLogEntry = (
  errorCode: string,
  error: unknown,
  context?: Record<string, unknown>
): ClientLogEntry => {
  const definition = CLIENT_ERROR_DEFINITIONS[errorCode]
  
  if (!definition) {
    throw new Error(`Unknown client error code: ${errorCode}. Please add to CLIENT_ERROR_DEFINITIONS.`)
  }
  
  return {
    error_code: errorCode,
    message: definition.message,
    service: definition.service,
    operation: definition.operation,
    context,
    remediation: definition.remediation,
    original_error: formatError(error),
    timestamp: new Date().toISOString(),
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }
}

// Send error to server for logging
const sendErrorToServer = async (logEntry: ClientLogEntry) => {
  try {
    await fetch('/api/errors/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    })
  } catch (serverError) {
    // Fallback to console if server logging fails
    console.error('Failed to send error to server:', serverError)
    console.error('Original error:', logEntry)
  }
}

// Firebase client-specific logging
export const logFirebaseClientError = (
  errorCode: keyof typeof CLIENT_ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createClientLogEntry(errorCode, error, context)
  console.error(`Firebase client error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Send to server for file logging
  sendErrorToServer(logEntry)
}

// Portal client-specific logging
export const logPortalClientError = (
  errorCode: keyof typeof CLIENT_ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createClientLogEntry(errorCode, error, context)
  console.error(`Portal client error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Send to server for file logging
  sendErrorToServer(logEntry)
}

// Form client-specific logging
export const logFormClientError = (
  errorCode: keyof typeof CLIENT_ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createClientLogEntry(errorCode, error, context)
  console.error(`Form client error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Send to server for file logging
  sendErrorToServer(logEntry)
}

// API client-specific logging
export const logApiClientError = (
  errorCode: keyof typeof CLIENT_ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createClientLogEntry(errorCode, error, context)
  console.error(`API client error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Send to server for file logging
  sendErrorToServer(logEntry)
}

// Auth client-specific logging
export const logAuthClientError = (
  errorCode: keyof typeof CLIENT_ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createClientLogEntry(errorCode, error, context)
  console.error(`Auth client error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Send to server for file logging
  sendErrorToServer(logEntry)
}

// Generic client error logging
export const logClientError = (
  errorCode: keyof typeof CLIENT_ERROR_DEFINITIONS,
  error: unknown,
  context?: Record<string, unknown>
) => {
  const logEntry = createClientLogEntry(errorCode, error, context)
  console.error(`${logEntry.service} client error - ${logEntry.operation}:`, JSON.stringify(logEntry, null, 2))
  
  // Send to server for file logging
  sendErrorToServer(logEntry)
}

// Success logging for important client operations
export const logClientSuccess = (
  service: string,
  operation: string,
  context?: Record<string, unknown>,
  customMessage?: string
) => {
  const message = customMessage || `${service} ${operation} completed successfully`
  
  console.log(`${service} client success - ${operation}:`, JSON.stringify({
    message,
    service,
    operation,
    context,
    timestamp: new Date().toISOString(),
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }, null, 2))
}

// Global error handler for unhandled JavaScript errors
export const setupGlobalErrorHandler = () => {
  if (typeof window === 'undefined') return
  
  window.addEventListener('error', (event) => {
    logClientError('JAVASCRIPT_RUNTIME_ERROR', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message
    })
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    logClientError('JAVASCRIPT_RUNTIME_ERROR', event.reason, {
      type: 'unhandled_promise_rejection',
      promise: 'Promise rejection was not handled'
    })
  })
}

// React error boundary helper
export const createReactErrorBoundary = (
  Component: React.ComponentType<Record<string, unknown>>
) => {
  class ErrorBoundary extends React.Component<
    React.PropsWithChildren<Record<string, never>>,
    { hasError: boolean }
  > {
    constructor(props: React.PropsWithChildren<Record<string, never>>) {
      super(props)
      this.state = { hasError: false }
    }
    
    static getDerivedStateFromError(_error: Error) {
      return { hasError: true }
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logClientError('REACT_COMPONENT_ERROR', error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: Component.name
      })
    }
    
    render() {
      if (this.state.hasError) {
        return React.createElement('div', { className: 'error-boundary' }, [
          React.createElement('h2', { key: 'title' }, 'Something went wrong.'),
          React.createElement('p', { key: 'description' }, 'An error has been logged and will be investigated.')
        ])
      }
      
      return this.props.children
    }
  }
  
  return ErrorBoundary
}

