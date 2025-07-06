// Global client error handler component
// Sets up error handlers without interfering with existing systems

'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandlers } from '@/lib/client-error-logger'

export default function ClientErrorHandler() {
  useEffect(() => {
    setupGlobalErrorHandlers()
  }, [])
  
  return null
}