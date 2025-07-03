import { Timestamp } from 'firebase/firestore';

// Portal Status Enums
export type PortalStatus = 'pending' | 'created' | 'active' | 'suspended';
export type RegistrationStatus = 'pending' | 'completed' | 'abandoned';

// Case Type and Status Enums
export type CaseType = 'Condo Apartment' | 'Coop Apartment' | 'Single Family House' | 'Other/Don\'t Know';
export type CaseStatus = 'intake' | 'active' | 'closing' | 'completed' | 'cancelled';

// Document Type Enum
export type DocumentType = 'contract' | 'disclosure' | 'inspection' | 'mortgage' | 'title' | 'closing';

// Client Role Type
export type ClientRole = 'primary' | 'co-buyer';

// External API Event Types
export type StripeEventType = 'payment_intent.succeeded' | 'invoice.paid' | 'subscription.updated';
export type CalEventType = 'booking.created' | 'booking.cancelled' | 'booking.rescheduled';

// Client Data Schema (attorney management, billing data)
export interface ClientData {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Portal Data Schema (portalUuid as primary key)
export interface PortalData {
  portalUuid: string;
  clientId: string;
  clientName: string;
  portalStatus: PortalStatus;
  registrationStatus: RegistrationStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Case Data Schema (legal matter tracking)
export interface CaseData {
  caseId: string;
  clientId: string;
  caseType: CaseType;
  status: CaseStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Client Cases Junction Schema (client-case many-to-many relationships)
export interface ClientCases {
  participantId: string;
  clientId: string;
  caseId: string;
  role: ClientRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Document Data Schema (file management with caseId reference)
export interface DocumentData {
  documentId: string;
  caseId: string;
  fileName: string;
  fileUrl: string;
  docType: DocumentType;
  uploadedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Stripe Webhook Data Schema (payment event storage)
export interface StripeWebhookData {
  webhookId: string;
  eventType: string;
  payload: Record<string, any>;
  processedAt: Timestamp;
  createdAt: Timestamp;
}

// Cal Webhook Data Schema (booking event storage)
export interface CalWebhookData {
  bookingId: string;
  eventType: string;
  payload: Record<string, any>;
  processedAt: Timestamp;
  createdAt: Timestamp;
}

// Collection Names Constants
export const COLLECTIONS = {
  CLIENTS: 'clients',
  PORTALS: 'portals',
  CASES: 'cases', 
  DOCUMENTS: 'documents',
  CLIENT_CASES: 'client_cases',
  STRIPE_WEBHOOKS: 'stripe_webhooks',
  CAL_WEBHOOKS: 'cal_webhooks'
} as const;