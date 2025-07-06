// Simple API endpoint to receive client errors and append to error.log
// Does not interfere with existing structured logging system

import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync } from 'fs'

interface ClientError {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  context?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const clientError: ClientError = await request.json()
    
    // Create log entry with client prefix
    const logEntry = {
      type: 'CLIENT_ERROR',
      timestamp: new Date().toISOString(),
      message: clientError.message,
      stack: clientError.stack,
      url: clientError.url,
      userAgent: clientError.userAgent,
      context: clientError.context,
      clientTimestamp: clientError.timestamp
    }
    
    // Console log for immediate visibility
    console.error('Client error received:', JSON.stringify(logEntry, null, 2))
    
    // Append to error.log file in development
    if (process.env.NODE_ENV === 'development') {
      appendFileSync('error.log', JSON.stringify(logEntry) + '\n')
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Failed to process client error:', error)
    return NextResponse.json(
      { error: 'Failed to process client error' },
      { status: 500 }
    )
  }
}