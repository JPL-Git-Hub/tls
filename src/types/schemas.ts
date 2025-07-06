import { Timestamp as ClientTimestamp } from 'firebase/firestore'

// Type definition compatible with both client and admin Timestamps
// Admin Timestamp has same structure as client Timestamp
export type TimestampType = ClientTimestamp | {
  seconds: number
  nanoseconds: number
  toDate(): Date
  toMillis(): number
}

// Portal Status Enums
export type PortalStatus = 'pending' | 'created' | 'active' | 'suspended'
export type RegistrationStatus = 'pending' | 'completed' | 'abandoned'

// Case Type and Status Enums
export type CaseType =
  | 'Condo Apartment'
  | 'Coop Apartment'
  | 'Single Family House'
  | 'Other'
export type CaseStatus =
  | 'intake'
  | 'active'
  | 'completed'
  | 'cancelled'

// Document Type Enum
export type DocumentType =
  | 'contract of sale'
  | 'term sheet'
  | 'title report'
  | 'board minutes'
  | 'offering plan'
  | 'financials'
  | 'by-laws'

// Client Role Type
export type ClientRole = 'primary' | 'co-buyer'

// External API Event Types
export type StripeEventType =
  | 'payment_intent.succeeded'
  | 'invoice.paid'
  | 'subscription.updated'
export type CalEventType =
  | 'booking.created'
  | 'booking.cancelled'
  | 'booking.rescheduled'

// Client Data Schema (attorney management, billing data)
export interface ClientData {
  clientId: string
  firstName: string
  lastName: string
  email: string
  mobilePhone: string
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Portal Data Schema (portalUuid as primary key)
export interface PortalData {
  portalUuid: string
  clientId: string
  clientName: string
  portalStatus: PortalStatus
  registrationStatus: RegistrationStatus
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Case Data Schema (legal matter tracking)
export interface CaseData {
  caseId: string
  clientNames: string
  caseType: CaseType
  status: CaseStatus
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Client Cases Junction Schema (client-case many-to-many relationships)
export interface ClientCases {
  participantId: string
  clientId: string
  caseId: string
  role: ClientRole
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Document Data Schema (file management with caseId reference)
export interface DocumentData {
  documentId: string
  caseId: string
  fileName: string
  fileUrl: string
  docType: DocumentType
  uploadedAt: TimestampType
  createdAt: TimestampType
  updatedAt: TimestampType
}

// Stripe Webhook Data Schema (payment event storage)
export interface StripeWebhookData {
  webhookId: string
  eventType: string
  payload: Record<string, unknown>
  processedAt: TimestampType
  createdAt: TimestampType
}

// Cal Webhook Data Schema (booking event storage)
export interface CalWebhookData {
  bookingId: string
  eventType: string
  payload: Record<string, unknown>
  processedAt: TimestampType
  createdAt: TimestampType
}

// Collection Names Constants
export const COLLECTIONS = {
  CLIENTS: 'clients',
  PORTALS: 'portals',
  CASES: 'cases',
  DOCUMENTS: 'documents',
  CLIENT_CASES: 'client_cases',
  STRIPE_WEBHOOKS: 'stripe_webhooks',
  CAL_WEBHOOKS: 'cal_webhooks',
} as const
