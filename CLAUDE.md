NEVER ADD A DATA OBJECT WITHOUT MY PERMISSION.

# CLAUDE.md - Development Guidelines for Claude Code

## Core Development Constraints

- **Schema modifications**: Never add/modify data objects in schemas.ts without explicit permission
- **Authentication boundaries**: Maintain strict admin/client separation per auth flow patterns
- **File structure**: Follow server/client module separation - no cross-contamination

## Code Quality Standards

- **TypeScript**: Zero compilation errors enforced across all files
- **ESLint**: Next.js strict rules with zero warnings/errors  
- **Prettier**: Consistent formatting, independent from ESLint (no integration that blocks development)
- **Error Handling**: Structured JSON logging with error codes and remediation guidance
- **Type Safety**: Zero `any` types, proper error handling with type guards
- **Schema Compliance**: Reference actual field names from `schemas.ts`, not assumptions

## Technical Debt Prevention

- **Root cause resolution**: Fix import paths, environment loading, and module resolution - never duplicate code
- **Single source of truth**: Use existing schemas, collections, and Firebase modules - never hardcode or recreate
- **Reject shortcuts**: All code must import from established patterns or properly extend them
- **Right tool for the job**: Use jq for JSON, yq for YAML, xmllint for XML, Firebase CLI for Firebase - service tools over REST hacks
- **Schema field compliance**: Reference actual schema field names from schemas.ts, not assumed field names
- **Error handling scope**: Declare variables outside try-catch blocks when error handlers need access for logging/context

## Project Functionality and Scale

Single codebase, single domain (thelawshop.com).
**Scale Constraints**: 1,000 portals maximum, 10 concurrent users across all portals.
**Business Flow**: Lead generation → consultation → client acquisition → case management.

A public website built for:

- lead generation (forms),
- scheduling consults (cal.com API booking), and
- client acquisition upon payment (Stripe API payment).

Also a private portal system built for case management for retained clients at a scale of 1,000 portals with a maximum of 10 concurrent users.

## Firebase Modular Architecture for Claude Code

### Firebase Import Pattern Requirements

**Configuration modules** (`*-config.ts`):

- **Centralized validation**: All configs validated in single `/config/` directory with fail-fast startup validation
- **Service modules import shared validated config** rather than implementing duplicate validation
- Import shared validated config objects from centralized validation
- No direct Firebase SDK imports in config files

**Functional modules** (`firebase-*.ts`, API routes, components):

- **Instance imports**: Use `adminDb`, `clientAuth`, `clientDb`, `adminAuth` from `@/lib/firebase/admin`, `@/lib/firebase/client`
- **SDK function imports**: Import directly from SDK packages at point of use
  - ✅ Correct: `import { doc, setDoc } from 'firebase/firestore'`
  - ✅ Correct: `import { signInWithEmailAndPassword } from 'firebase/auth'`
  - ❌ Forbidden: Creating files that just re-export SDK functions
- Avoid abstracted utilities like `getFirestoreDb()`, `getAuth()` wrappers to prevent shadow APIs

### Server-Side vs Client-Side Separation

**Server-Side Modules:**

- **`admin.ts`**: Admin SDK with service account credentials, API route operations
- **`firestore.ts`**: Server-side database operations, elevated data access
- Environment variables: `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- Used exclusively in API routes (`/api/*`)
- Portal creation, user management, elevated privileges

**Client-Side Modules:**

- **`auth.ts`**: Dual authentication flows (attorney Google OAuth + client email/password)
- **`storage.ts`**: Client-side file operations, document uploads
- Environment variables: `NEXT_PUBLIC_*` prefixed only
- Used in React components and client-side logic
- Real-time listeners, client queries, user authentication

**Security Boundary:** Maintain separation between admin credentials and client-side code.

**Client data isolation**: Firebase Security Rules must enforce strict client-to-client data separation. Each client can only access their own case data; attorneys can access all cases via role-based permissions.

### Runtime Constraints and Implementation Patterns

**Browser Compatibility Requirements:**

- **Client-side files**: Must use `NEXT_PUBLIC_*` environment variables only
- **Runtime Constraints**: Edge vs Node.js limitations documented and enforced
- **Middleware limitations**: Cannot import Firebase Admin SDK (Edge Runtime constraint)
- **File naming**: `firebase-client-config.ts` for browser-safe configuration
- **Import restriction**: No `node:process` or server-only modules in client files

**Edge Runtime vs Node.js Constraints:**

- **Middleware (`middleware.ts`)**: Cannot import Firebase Admin SDK (Edge Runtime limitation)
- **API routes (`/api/*`)**: Use Firebase Admin SDK (Node.js runtime)
- **Route protection**: Server-side verification functions in API routes, not middleware

**File Structure Guardrails:**

- **`firebase-admin-config.ts`**: Server environment variables, service account credentials
- **`firebase-client-config.ts`**: Public environment variables, browser-safe configuration
- **`admin.ts`**: Admin SDK initialization, server-only functions
- **`auth.ts`**: Authentication flows for both attorney and client users
- **`firestore.ts`**: Database operations, case data management
- **`storage.ts`**: File uploads, document management
- **No cross-contamination**: Server files never imported by client components

**Route Pages Pattern:**

- **Route pages**: Server components by default. Only use "use client" for pages requiring React hooks or browser APIs
- **Layout components**: Server components unless managing client state
- **Interactive components**: Use "use client" only when necessary for user interactions

**Emulator Configuration Pattern:**

- USE_EMULATOR=true flag controls Firebase SDK initialization
- Demo configuration values bypass validation in emulator mode
- Conditional SDK connections: connectAuthEmulator, connectFirestoreEmulator, connectStorageEmulator

**Security Rules Pattern:**

- Same firestore.rules and storage.rules files used by live project and emulators
- Development-permissive rules: authenticated access for testing

### Authentication Flow Separation

**Admin vs Client Authentication Boundary:**

- **Attorney authentication**: Google OAuth + environment variable validation in `/login` route
- **Client authentication**: Portal UUID access via `/portal/[uuid]` route (future: email/password + Google OAuth)
- **Security pattern**: Separate authentication systems prevent client access to admin functions
- **Firebase implications**: Different security rules for admin operations vs client portal access
- **Development workflow**: Test attorney auth via `/login`, test client access via portal UUID links

### Module Responsibilities

Follow single responsibility per module pattern established in codebase.

- **auth.ts**: Client authentication only. No admin operations, no case data queries
- **firestore.ts**: Case/client CRUD operations. Import from admin.ts for server routes, client.ts for components
- **storage.ts**: Document uploads with case association. Must validate file types and sizes
- **admin.ts**: Portal creation, user management. API routes only - never import in client components

### TypeScript Interface Patterns

**Never duplicate interfaces** across components and utilities - derive from existing schema types using utility types (`Omit`, `Pick`, `Partial`)
**Schema-Derived Types**: Use utility types vs duplicate interfaces for form handling
**Type Safety**: Zero `any` types, proper error handling with type guards

- **Separate user input from database records** - form interfaces should omit system-generated fields (IDs, timestamps) from schema types
- **Use schema-derived types** - `Omit<ClientData, 'clientId' | 'createdAt' | 'updatedAt'>` instead of duplicate interface definitions
- **Form-to-schema alignment** - all form submissions must map cleanly to database schema without field mismatches

**Pattern violations:**

- Defining same interface in multiple files
- Form interfaces including database-only fields
- Manual interface creation when schema types exist

## Integration Boundaries

**External APIs**: Cal.com booking, Stripe payments, Google Maps property display, pdf.js document viewing
**Integration Points**: Service boundary error wrapping required for all external service calls
**File handling**: PDF upload/download with client-side viewing and signing capabilities  
**Data relationships**: Many-to-many client-case relationships via junction collections

## Error Handling Strategy

### Development-First Error Handling

**All error handling follows this approach until production deployment:**

### Startup vs Runtime Error Handling

**Startup errors** (application initialization):

- **Fail-fast configuration validation**: Missing environment variables, invalid Firebase config
- **Crash immediately**: Configuration problems prevent app start
- **No user interaction**: Errors occur before user requests

**Runtime errors** (user requests, API calls):

- **Complete debugging context required in all errors**
- **Service boundary error wrapping**: All external service initializations (Firebase, Stripe, Cal.com) must wrap SDK calls with try-catch blocks that provide TLS-specific context, even after centralized validation passes

**JSON Structured Logging Format:**
```json
{
  "error_code": "ATTORNEY_LOGIN_FAILED",
  "message": "Google OAuth signin failed",
  "service": "Firebase Auth",
  "operation": "google_oauth_signin",
  "context": {
    "email": "user@example.com",
    "domain": "example.com",
    "userId": "user_id_if_available"
  },
  "remediation": "Check domain restrictions and network connectivity"
}
```

**Error Code Patterns**: `ATTORNEY_LOGIN_FAILED`, `USER_CLAIMS_RETRIEVAL_FAILED`, `PORTAL_CREATION_FAILED`
- **Service-specific error handling for Firebase/Stripe/Cal.com**
- **Environment validation for live Firebase + ngrok development**
- **No graceful degradation - force immediate problem resolution**

**Error handling coverage pattern:**
Centralized validation handles config problems, service boundary wrapping handles runtime problems.

## Development Environment Strategy

### Development vs Testing Environment Strategy

**Development workflow:**

- Live Firebase (tls-unified), Stripe, and Cal.com services with ngrok tunnels
- No emulators during active development - test against real service integrations
- Environment validation for live Firebase + ngrok development
- Use `local-dev-real.sh` for development iteration

**Testing environment:**

- Firebase emulators available for automated testing and CI/CD
- Emulator usage: Testing-only, not for development iteration
- Use `local-dev-emulator.sh` for test automation
- Maintains separation: live services for development, emulators for test automation

### External Service Integration Patterns

**Internal Feature Development:**

- Use existing Firestore patterns and schema objects
- Reference established component structures
- Focus on business logic within current architecture

**External Service Integration:**

- Cal.com: Booking webhook integration with case creation
- Stripe: Payment webhook integration with case lifecycle
- Google Maps: Property display integration with case data
- Require additional validation, error handling, and testing approaches

## Service Configuration Architecture

All external service configs (Firebase, Stripe, Cal.com) validated in single centralized location. Service modules import shared validated config rather than implementing duplicate validation. Use `-config.ts` suffix for configuration files. No configuration frameworks - direct environment variable validation with fail-fast startup validation.

## Incremental Implementation Approach

### Single-Objective Implementation

**Interpret all prompts as single-objective requests** and implement only the specific deliverable requested.

**✅ Implementation patterns:**

- **Single deliverable focus** - Complete one clear objective per response
- **Build on existing foundation** - Reference and extend previously created components
- **Follow established patterns** - Use existing codebase patterns and conventions
- **Minimal scope changes** - Avoid expanding beyond the specific request

**❌ Avoid over-implementation:**

- Multiple objectives in single response
- Comprehensive solutions beyond request scope
- Implementing multiple architectural layers simultaneously
- Front-loading enhancements not requested

### Incremental Development Sequence

**When complexity emerges, break into logical steps:**

1. **Foundation**: Implement core requirement only
2. **Function**: Add specific functionality to existing foundation
3. **Integration**: Connect with existing systems
4. **Enhancement**: Add requested improvements to working implementation

### Implementation Control

**Recognize when to limit scope:**

- Task involves multiple architectural concerns - focus on primary objective
- Multiple responsibilities emerge - address foundation first
- Complete system implementation requested - deliver core functionality

**Response approach:**

- Deliver focused implementation
- Note logical next steps for future prompts
- Reference existing codebase patterns consistently

## Development Tooling Pattern

**Prettier**: Configure for formatting without linting errors. Install as dev dependency with separate format scripts (`format`, `format:check`). Keep ESLint and Prettier as independent tools - no integration that blocks development.

**Concurrently**: Use for simultaneous dev processes. Standard pattern: `"dev": "concurrently \"next dev\" \"ngrok start my-app\""` for local development with permanent ngrok tunnel.

**Standard Port Allocation:**

- Next.js: 3000
- Emulator UI: 4000
- Auth emulator: 9099
- Firestore emulator: 8080
- Storage emulator: 9199

**Development Scripts:**

- local-dev-real.sh: Live Firebase + ngrok
- local-dev-emulator.sh: Firebase emulators + dev server
- Synchronized cleanup prevents process conflicts

## Architecture

- **Frontend**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: react-hook-form + Zod validation
- **Database**: Firebase (Firestore + Storage + Auth)
- **State**: React built-ins + Firebase (native optimistic behavior)
- **Auth**: Firebase Auth with custom useAuth hook
- **Data**: Native fetch API + Firebase SDK

## Dependency Alignment Validation

**Package.json principle**: Dependencies must align with stated architecture. Acceptable additions: implementation utilities (date-fns, lucide-react, sonner) that support core architecture without contradicting it. No alternative frameworks that duplicate architectural choices (no Redux with React built-ins, no Axios with native fetch).
