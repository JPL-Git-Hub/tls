# CLAUDE.md - Development Guidelines for Claude Code

## Firebase Modular Architecture for Claude Code

### Import Pattern Requirements

**Use direct SDK imports for maximum Claude Code context:**
```typescript
// ✅ Required pattern
import { adminDb } from './firebase-admin'
import { clientAuth } from './firebase-client'

// ❌ Avoid abstractions  
import { getFirestoreDb, getAuth } from './firebase-utils'
```

### Server-Side vs Client-Side Separation

**Server-Side Module (`firebase-admin.ts`):**
- Admin SDK with service account credentials
- Environment variables: `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- Used exclusively in API routes (`/api/*`)
- Portal creation, user management, elevated privileges

**Client-Side Module (`firebase-client.ts`):**
- Public SDK configuration for browser operations
- Environment variables: `NEXT_PUBLIC_*` prefixed only
- Used in React components and client-side logic
- Authentication, real-time listeners, client queries

**Security Boundary:** Never import admin credentials in client-side code. Never use client SDK for service account operations.

### Claude Code Prompt Patterns

#### Reference specific modules in CC prompts:
- Create authentication flow using signIn from auth.ts. Follow existing auth patterns in codebase.
- Add case creation API using adminDb from admin.ts. Follow existing admin patterns in codebase.

### Module Responsibilities

- **auth.ts**: Client authentication, session management
- **firestore.ts**: Case data, client records, attorney queries  
- **storage.ts**: Document uploads, file security, storage rules
- **admin.ts**: Server operations, portal provisioning, elevated access

**Import Structure:** Clean unified imports via `index.ts` for streamlined Claude Code access to Firebase functionality.

## Third-Party Integration Configuration

### Planned Collections
- `stripe_webhook_events` 
- `cal_webhook_events`

## Attorney Configuration

### Hardcoded Attorney Authorization Pattern

**Use environment-based attorney configuration**: TLS operates with 1-2 attorneys plus potential paralegal. Hardcode authorization lists rather than database-driven user management.

**Skip Firestore for**: Attorney emails, static org config, system settings

**Authentication flow**: Google Workspace OAuth → Domain verification → Email allowlist → Firebase Auth integration

## Error Handling Strategy

### Development-First Error Handling

**All error handling follows this approach until production deployment:**

- **Fail-fast configuration validation on startup**
- **Complete debugging context required in all errors**
- **Service boundary error wrapping**: All external service initializations (Firebase, Stripe, Cal.com) must wrap SDK calls with try-catch blocks that provide TLS-specific context, even after centralized validation passes. Runtime failures should specify: service name, operation attempted, likely causes, and next debugging steps
- **Service-specific error handling for Firebase/Stripe/Cal.com**
- **Environment validation for live Firebase + ngrok development**
- **No graceful degradation - force immediate problem resolution**

**Error handling coverage pattern:**
```
Centralized validation (config problems) → Rich TLS context
+ Service boundary wrapping (runtime problems) → Rich TLS context
= Complete coverage for Claude Code debugging efficiency
```

## Development Environment Strategy

### Live Services Development Only

**Exclusive live Firebase + ngrok development approach:**

- **No Firebase emulators**: Develop directly against live Firebase project (tls-unified)
- **No local service mocking**: Use actual Stripe, Cal.com, and Firebase services during development
- **ngrok tunnel integration**: External webhooks point to ngrok URL for local development testing
- **Real service validation**: Catch integration issues early rather than discovering them at deployment

**Configuration validation**: All environment validation should expect live service credentials, not emulator settings.

**Rationale**: Eliminates emulator/production environment discrepancies that create deployment surprises. Legal services applications require reliable external service integration patterns that local mocking cannot accurately represent.

**Claude Code guidance**: Never generate emulator configuration or local service mocking code. Always implement direct integration with live services using proper environment variable validation.

## Service Configuration Architecture

### Centralized Configuration Validation

**Single source of truth for all external service configurations:**

- **Centralized validation**: All service configs (Firebase, Stripe, Cal.com) validated in single location
- **Shared configuration foundation**: Firebase modules import validated config rather than implementing duplicate validation
- **Fail-fast service validation**: Complete external service configuration verification at application startup
- **Uniform error context**: Consistent debugging information across all service integration failures

**Implementation patterns:**

```typescript
// src/lib/config/config-validator.ts
export const validateServiceConfig = () => {
  // Fail-fast validation with complete debugging context
}

// Service-specific configs
// src/lib/config/firebase-config.ts
// src/lib/config/stripe-config.ts
// src/lib/config/cal-config.ts
```

**Configuration naming convention**: Use `-config.ts` suffix for all service configuration files.

**Validation requirements**: 
- TypeScript fail-fast validation on startup
- Complete debugging context in error messages
- No configuration frameworks - direct environment variable validation

**Module responsibilities**: Service-specific modules (auth.ts, firestore.ts, storage.ts) focus on functionality, not configuration validation.

**Claude Code guidance**: Reference shared configuration validation when implementing service integrations. Avoid duplicate validation logic across modules.

## Document Storage Architecture

### Flat Storage + Metadata Pattern

**Use Firestore metadata for document workflows, not file path hierarchy:**
- Storage: `{clientId}-{docType}.pdf` flat naming
- Triggers: Query Firestore document metadata, not parse file paths
- Workflows: Database-driven actions based on docType fields

**Skip hierarchical folders**: `/contracts/`, `/correspondence/` create complexity without TLS benefits.

## Project Context

### TLS Business Model
- Fixed-fee home closing legal services (0.3% of purchase price)
- Scale: 1,000 client portals max, 10 concurrent users
- Tech Stack: Next.js, TypeScript, Firebase, Tailwind CSS
- Architecture: Single codebase, single domain (thelawshop.com)

### Development Approach
- Minimalism and simplicity focused
- Pattern-first development (reference existing code patterns)
- Single responsibility per module
- Clean unified imports for better Claude Code context