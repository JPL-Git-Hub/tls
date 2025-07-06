// Simple client-side error logger that sends errors to server
// Does not interfere with existing server-side structured logging

interface ClientError {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  context?: Record<string, unknown>
}

// Send error to server for logging
const sendErrorToServer = async (error: ClientError) => {
  try {
    await fetch('/api/client-errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error),
    })
  } catch (serverError) {
    // Fallback to console if server logging fails
    console.error('Failed to send error to server:', serverError)
    console.error('Original error:', error)
  }
}

// Log client error
export const logClientError = (
  error: unknown,
  context?: Record<string, unknown>
) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  const clientError: ClientError = {
    message: errorMessage,
    stack: errorStack,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    context
  }
  
  console.error('Client error:', clientError)
  sendErrorToServer(clientError)
}

// Setup global error handlers
export const setupGlobalErrorHandlers = () => {
  if (typeof window === 'undefined') return
  
  window.addEventListener('error', (event) => {
    logClientError(event.error, {
      type: 'javascript_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    logClientError(event.reason, {
      type: 'unhandled_promise_rejection'
    })
  })
}