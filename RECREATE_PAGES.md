# Pages Marked for Recreation

The following pages used shadcn/radix components and need to be recreated from scratch using Catalyst components:

## Admin Pages
- **`src/app/admin/page.tsx`** - Attorney admin dashboard
  - **Critical functions**: Document upload, case selection, attorney auth verification
  - **APIs used**: `/api/case/list`, `/api/documents/create`, `uploadDocument()`
  - **Auth**: `isAttorneyRole()` verification

## Portal Pages  
- **`src/app/portal/login/page.tsx`** - Client portal login
  - **Critical functions**: Client role validation, portal access from claims
  - **Auth**: `isClientRole()`, extracts `portalAccess` array from claims
  - **Redirects**: To `/portal/${portalAccess[0]}` on success

- **`src/app/portal/[uuid]/register/page.tsx`** - Portal user registration
  - **Critical functions**: User creation, portal registration status update
  - **APIs used**: `/api/portal/update-registration-status`, `/api/portal/set-client-claims`
  - **Auth**: `createUserWithEmailAndPassword()`

- **`src/app/portal/[uuid]/page.tsx`** - Portal dashboard
  - **Critical functions**: Document fetching by portal UUID
  - **APIs used**: `/api/portal/documents?portalUuid=${uuid}`
  - **Parameters**: Uses `params.uuid` from URL

## Removed Components
- **`src/components/auth/AttorneyLogin.tsx`** - Simple Google OAuth wrapper
  - **Props**: `onSuccess`, `onError` callbacks
  - **Function**: Wraps `signInWithGoogle()` with loading state

## Cleanup Completed
- ✅ Removed 26 @radix-ui dependencies from package.json
- ✅ Removed shadcn utility packages (class-variance-authority, clsx, cmdk)  
- ✅ Deleted `src/components/ui/` directory entirely
- ✅ Deleted `src/components/auth/` directory

## Recreation Guidelines
- Use **Catalyst components** only (`@/catalyst/components/*`)
- Follow **home page patterns** for styling (latest Tailwind template)
- Preserve all **critical authentication flows** and **API integrations**
- Use **minimal theme** from `src/catalyst/theme.ts` (only `brandColors`)