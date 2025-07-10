# Cubone React File Manager - Architecture Integration

## Cubone's Role in TLS Architecture

**Current Status:**
- ✅ **Installed**: `@cubone/react-file-manager": "^1.24.0"` in package.json
- ❌ **Not implemented**: No imports or usage found in codebase yet
- 🔄 **Planned**: Intended for document management functionality

## Architecture Layer Position

**Four-Layer Architecture:**

```
UI Blocks (Layout Patterns)
    ↓
Catalyst (General UI) + Cubone (File Management)
    ↓
Minimal TLS Theme (Brand Colors)
    ↓
Base Tailwind CSS
```

**Cubone as Specialized Component Library:**
- **Catalyst**: General UI components (Button, Heading, Text, Forms)
- **Cubone**: Specialized file management components
- **Together**: Complete UI component ecosystem

## Current Document Management Implementation

**Current State** in `/src/app/dashboard/documents/page.tsx`:
- Custom file list with Catalyst Dropdown menus
- Manual view/download/delete actions
- Headless UI Dialog components for confirmations
- Custom upload interfaces
- Manual file grid layouts

**Issues with Current Approach:**
- Duplicate file management logic
- Custom implementations vs proven library
- Maintenance overhead for file operations
- Inconsistent UX patterns

## Cubone Integration Strategy

### 1. Document Management Page Replacement

**Current Custom Implementation:**
```jsx
// Custom file list with dropdowns
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {documents.map(doc => (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <Dropdown>
        <DropdownButton>
          <EllipsisVerticalIcon />
        </DropdownButton>
        <DropdownMenu>
          <DropdownItem onClick={() => viewDocument(doc)}>
            <EyeIcon /> View
          </DropdownItem>
          <DropdownItem onClick={() => downloadDocument(doc)}>
            <ArrowDownTrayIcon /> Download
          </DropdownItem>
          <DropdownItem onClick={() => deleteDocument(doc)}>
            <TrashIcon /> Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ))}
</div>
```

**Cubone Replacement:**
```jsx
// UI Block container + Cubone component
<div className="bg-white rounded-lg shadow-sm p-5">
  <CuboneFileManager 
    files={documents}
    onView={viewDocument}
    onDownload={downloadDocument}
    onDelete={deleteDocument}
    theme="catalyst"
    primaryColor="indigo"
  />
</div>
```

### 2. Portal Document Views

**Use Case**: Client portal file access at `/src/app/portal/[uuid]/page.tsx`

**Integration Pattern:**
```jsx
<div className="max-w-4xl mx-auto space-y-8">
  {/* UI Block header */}
  <div className="flex justify-between items-center">
    <Heading level={1}>Your Documents</Heading>
  </div>
  
  {/* Cubone file manager */}
  <div className="bg-white rounded-lg shadow-sm">
    <CuboneFileManager 
      files={clientDocuments}
      mode="client-view"
      allowedActions={['view', 'download']}
      theme="catalyst"
      primaryColor="indigo"
    />
  </div>
</div>
```

### 3. File Upload Integration

**Lead Form File Uploads:**
```jsx
<Fieldset>
  <FieldGroup>
    <Field>
      <Label>Supporting Documents</Label>
      <CuboneUploader 
        onUpload={handleFileUpload}
        acceptedTypes={['.pdf', '.doc', '.docx']}
        maxSize="10MB"
        theme="catalyst"
      />
    </Field>
  </FieldGroup>
</Fieldset>
```

## Theme Integration Patterns

### 1. Catalyst-Styled File Manager

**Primary Integration:**
```jsx
<CuboneFileManager 
  theme="catalyst"  // Match Catalyst design system
  primaryColor="indigo"  // TLS brand color
  components={{
    Button: CatalystButton,  // Use Catalyst Button component
    Dialog: CatalystDialog,  // Use Catalyst Dialog component
  }}
/>
```

### 2. Brand Color Application

**Using Minimal Theme:**
```jsx
import { theme } from '@/catalyst/theme'

<CuboneFileManager 
  customTheme={{
    primaryColor: theme.brandColors.primaryBg,  // bg-indigo-600
    textColor: theme.brandColors.primary,       // text-indigo-600
    borderColor: 'border-gray-200',
    backgroundColor: 'bg-white',
  }}
/>
```

### 3. UI Block Container Integration

**Consistent Layout Patterns:**
```jsx
{/* UI Block: Form container pattern */}
<div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-5">
  <div className="space-y-6">
    {/* Catalyst header */}
    <Heading level={2}>Document Management</Heading>
    
    {/* Cubone file manager */}
    <CuboneFileManager {...props} />
  </div>
</div>
```

## Implementation Phases

### Phase 1: Document Management Page
**Target**: `/src/app/dashboard/documents/page.tsx`
1. **Replace custom file grid** with Cubone file manager
2. **Keep UI Block container** layout patterns
3. **Integrate Catalyst dialogs** for confirmations
4. **Apply TLS brand colors** via theme integration

### Phase 2: Portal Integration
**Target**: `/src/app/portal/[uuid]/page.tsx`
1. **Add client document view** with Cubone
2. **Restrict actions** to view/download only
3. **Maintain portal branding** consistency

### Phase 3: Upload Integration
**Target**: Form components
1. **Replace custom upload** implementations
2. **Integrate with existing forms** (lead form, portal registration)
3. **Maintain form validation** patterns

## Benefits of Cubone Integration

### 1. Proven File Management UX
- **Tested patterns**: Drag & drop, bulk operations, file previews
- **Accessibility**: Built-in keyboard navigation and screen reader support
- **Mobile responsive**: Touch-friendly interfaces

### 2. Reduced Custom Code
- **Eliminate custom file grids**: Use Cubone's tested layouts
- **Remove manual operations**: Built-in view/download/delete actions
- **Consistent UX**: Same patterns across all file interfaces

### 3. Architecture Consistency
- **Component boundaries**: Cubone handles files, Catalyst handles general UI
- **Theme integration**: Brand colors applied consistently
- **Layout patterns**: UI Blocks contain both Catalyst and Cubone

## Configuration Requirements

### 1. Theme Configuration
```javascript
// cubone.config.js
export default {
  theme: 'catalyst',
  colors: {
    primary: '#4f46e5',      // indigo-600
    secondary: '#6b7280',    // gray-500
    background: '#ffffff',   // white
    border: '#e5e7eb',       // gray-200
  },
  components: {
    button: 'catalyst',      // Use Catalyst Button
    dialog: 'catalyst',      // Use Catalyst Dialog
    input: 'catalyst',       // Use Catalyst Input
  }
}
```

### 2. Firebase Storage Integration
```javascript
// File upload to Firebase Storage
const cuboneConfig = {
  storage: {
    provider: 'firebase',
    bucket: process.env.FIREBASE_STORAGE_BUCKET,
    path: 'documents/{userId}/{caseId}/',
  },
  permissions: {
    upload: ['attorney', 'client'],
    delete: ['attorney'],
    view: ['attorney', 'client'],
  }
}
```

## File Structure After Integration

```
src/
├── catalyst/
│   ├── components/        # Catalyst UI components
│   └── theme.ts          # Minimal brand colors
├── lib/
│   └── cubone/
│       ├── config.ts     # Cubone configuration
│       └── firebase.ts   # Firebase Storage integration
├── app/
│   ├── dashboard/
│   │   └── documents/
│   │       └── page.tsx  # Cubone file manager
│   └── portal/
│       └── [uuid]/
│           └── page.tsx  # Cubone client view
└── components/
    └── forms/
        └── FileUploader.tsx # Cubone upload component
```

## Success Criteria

- ✅ **Consistent file UX**: Same patterns across dashboard and portal
- ✅ **Brand consistency**: Cubone matches TLS indigo branding
- ✅ **Architecture alignment**: Cubone + Catalyst + UI Blocks + Theme
- ✅ **Reduced custom code**: Eliminate manual file management implementations
- ✅ **Accessibility maintained**: Built-in Cubone accessibility features
- ✅ **Performance**: Optimized file operations and previews

---

**Document Status**: Architecture planning phase  
**Last Updated**: 2025-01-08  
**Implementation**: Pending Catalyst migration completion