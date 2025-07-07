// Global error handler component for client-side error logging
// Follows existing component patterns and integrates with client-logger

'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandler } from '@/lib/logging/client-logger'

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Setup global error handlers for unhandled JavaScript errors
    setupGlobalErrorHandler()
  }, [])
  
  // This component renders nothing but sets up error handling
  return null
}