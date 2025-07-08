import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/schemas'
import { logApiError } from '@/lib/logging/structured-logger'

export async function GET(request: NextRequest) {
  try {
    // Get counts from all collections
    const [casesSnapshot, clientsSnapshot, documentsSnapshot] = await Promise.all([
      adminDb.collection(COLLECTIONS.CASES).get(),
      adminDb.collection(COLLECTIONS.CLIENTS).get(),
      adminDb.collection(COLLECTIONS.DOCUMENTS).get(),
    ])

    const stats = {
      totalCases: casesSnapshot.size,
      totalClients: clientsSnapshot.size,
      totalDocuments: documentsSnapshot.size,
    }

    return NextResponse.json(stats)
  } catch (error) {
    logApiError(
      'DASHBOARD_STATS_FAILED',
      error,
      { operation: 'dashboard_stats_fetch' }
    )
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}