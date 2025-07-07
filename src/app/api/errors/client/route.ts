// API endpoint to receive client-side errors and log them server-side
// Follows existing API route patterns and uses server-side structured logger

import { NextRequest, NextResponse } from 'next/server'
import { logError } from '@/lib/logging/structured-logger'

interface ClientErrorPayload {
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

export async function POST(request: NextRequest) {
  try {
    const clientError: ClientErrorPayload = await request.json()
    
    // Validate required fields
    if (!clientError.error_code || !clientError.message) {
      return NextResponse.json(
        { error: 'Missing required fields: error_code and message' },
        { status: 400 }
      )
    }
    
    // Add server-side context to client error
    const serverContext = {
      ...clientError.context,
      client_timestamp: clientError.timestamp,
      client_user_agent: clientError.user_agent,
      client_url: clientError.url,
      server_timestamp: new Date().toISOString(),
      request_ip: request.ip || 'unknown',
      request_headers: {
        'user-agent': request.headers.get('user-agent'),
        'referer': request.headers.get('referer'),
        'x-forwarded-for': request.headers.get('x-forwarded-for')
      }
    }
    
    // Log client error using server-side structured logger
    // This will write to error.log file in development
    console.error(`Client error received - ${clientError.operation}:`, JSON.stringify({
      error_code: clientError.error_code,
      message: `CLIENT: ${clientError.message}`,
      service: clientError.service,
      operation: clientError.operation,
      context: serverContext,
      remediation: clientError.remediation,
      original_error: clientError.original_error
    }, null, 2))
    
    // Also use server-side logger for file writing
    if (process.env.NODE_ENV === 'development') {
      const fs = await import('fs')
      const logEntry = {
        error_code: clientError.error_code,
        message: `CLIENT: ${clientError.message}`,
        service: clientError.service,
        operation: clientError.operation,
        context: serverContext,
        remediation: clientError.remediation,
        original_error: clientError.original_error,
        timestamp: new Date().toISOString()
      }
      
      fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Client error logged successfully' 
    })
    
  } catch (error) {
    // Log server error in processing client error
    logError('API_ENDPOINT_FAILED', error, {
      endpoint: '/api/errors/client',
      method: 'POST'
    })
    
    return NextResponse.json(
      { error: 'Failed to process client error' },
      { status: 500 }
    )
  }
}