# CLAUDE.md - Development Guidelines for Claude Code

## Project Functionality and Scale
Single codebase, single domain (thelawshop.com).

A public website built for:
- lead generation (forms), 
- scheduling consults (cal.com API booking), and 
- client acquisition upon payment (Stripe API payment). 

Also a private portal system built for case management for retained clients at a scale of 1,000 portals with a maximum of 10 concurrent users.

## Firebase Modular Architecture for Claude Code

### Import Pattern Requirements

Use direct SDK imports (adminDb, clientAuth) rather than abstracted utilities (getFirestoreDb, getAuth).

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

**Security Boundary:** Maintain separation between admin credentials and client-side code.

**Client data isolation**: Firebase Security Rules must enforce strict client-to-client data separation. Each client can only access their own case data; attorneys can access all cases via role-based permissions.

### Module Responsibilities

Follow single responsibility per module pattern established in codebase.
- **auth.ts**: Client authentication, session management
- **firestore.ts**: Case data, client records, attorney queries  
- **storage.ts**: Document uploads, file security, storage rules
- **admin.ts**: Server operations, portal provisioning, elevated access

**Import Structure:** Clean unified imports via `index.ts` for streamlined Claude Code access to Firebase functionality.

## Integration Boundaries
**External APIs**: Cal.com booking, Stripe payments, Google Maps property display, pdf.js document viewing
**File handling**: PDF upload/download with client-side viewing and signing capabilities  
**Data relationships**: Many-to-many client-case relationships via junction collections

## Error Handling Strategy

### Development-First Error Handling

**All error handling follows this approach until production deployment:**

-  **Fail-fast configuration validation on startup**
- **Complete debugging context required in all errors**
- **Service boundary error wrapping**: All external service initializations (Firebase, Stripe, Cal.com) must wrap SDK calls with try-catch blocks that provide TLS-specific context, even after centralized validation passes. Runtime failures should specify: service name, operation attempted, likely causes, and next debugging steps
- **Service-specific error handling for Firebase/Stripe/Cal.com**
- **Environment validation for live Firebase + ngrok development**
- **No graceful degradation - force immediate problem resolution**

**Error handling coverage pattern:**
Centralized validation handles config problems, service boundary wrapping handles runtime problems.

**Error format for AI debugging optimization:**
Structure service boundary errors as JSON objects with error_code, message, service, operation, remediation, and context fields.

## Development Environment Strategy

### Live Services Development Only
Use live Firebase (tls-unified), Stripe, and Cal.com services with ngrok tunnels. No emulators or local mocking.

## Service Configuration Architecture
All external service configs (Firebase, Stripe, Cal.com) validated in single centralized location. Service modules import shared validated config rather than implementing duplicate validation. Use `-config.ts` suffix for configuration files. No configuration frameworks - direct environment variable validation with fail-fast startup validation.

### Configuration Layer Pattern
- Central validation in `/config/` directory with fail-fast startup validation
- Service modules import shared validated config rather than duplicate validation
- Service-specific functions focus exclusively on functionality (3-5 lines after centralization)
- Use `-config.ts` suffix for configuration files