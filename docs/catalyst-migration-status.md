# Catalyst UI Migration Status - Current Architecture & Rebuild Plan

## Page Design Architecture

**Three-Layer Architecture:**
- **Tailwind UI Blocks (Layout)**: Tailwind UI responsive layout patterns for containers, grids, spacing
- **Catalyst Components**: Button, Heading, Text with built-in variants and accessibility
- **Minimal TLS Theme**: Brand colors only (`theme.brandColors.primary: 'text-indigo-600'`)

## Current Theme Configuration

**Minimal theme at `/src/catalyst/theme.ts`:**
```typescript
export const theme = {
  brandColors: {
    primary: 'text-indigo-600',
    primaryBg: 'bg-indigo-600',
  }
}
```

**What was removed:** All layout, typography, and component styling (moved to UI Blocks + Catalyst)

## Current Page Structure & Status

### 1. Homepage (`/src/app/page.tsx`)
**Status:** ❌ needs UI Block patterns  
**Current Issues:** Still uses removed theme properties, causing runtime errors  
**Structure Needed:**
- Hero section for "The Law Shop" title
- CTA button grid for 6 action buttons (Fill Out Form, Book Consult, Make Payment, Register Portal, Client Login, Attorney Login)
- Responsive layout with proper spacing

**Components Used:**
- `<Button color="indigo">` (Catalyst) ✅
- `<Heading>` (Catalyst) ✅
- Direct Tailwind classes for layout (needs UI Block patterns)

**Required UI Blocks:**
- Marketing Hero section
- CTA button grid (6 buttons, responsive)

### 2. Lead Form Page (`/src/app/lead/page.tsx` + `/src/components/forms/ClientLeadForm.tsx`)
**Status:** ❌ Uses removed theme properties, needs refactoring  
**Current Issues:** Errors from missing `theme.components.form` properties  
**Structure Needed:**
- Form container layout (UI Block)
- Professional header section
- Form fields with proper spacing and validation states

**Components Used:**
- `<Button>` (needs `color="indigo"` added) ⚠️
- `<Heading>`, `<Text>` (Catalyst) ✅
- `<Input>`, `<Field>`, `<Fieldset>`, `<Label>` (Catalyst form components) ✅

**Form Fields:**
- First Name, Last Name, Email, Phone Number
- Success state with portal registration flow
- Error handling with validation messages

### 3. Login Page (`/src/app/login/page.tsx`)
**Status:** ❌ Uses removed theme properties, needs refactoring  
**Current Issues:** Errors from missing theme layout properties  
**Structure Needed:**
- Centered login form layout
- Professional card styling
- Single CTA button for Google OAuth

**Components Used:**
- `<Button color="indigo">` (Catalyst) ✅
- `<Heading>`, `<Text>` (Catalyst) ✅
- Attorney-specific messaging and styling

**Authentication Flow:**
- Google OAuth for @thelawshop.com accounts
- Role verification for attorney access
- Redirect to dashboard on success

### 4. Dashboard Page (`/src/app/dashboard/page.tsx`)
**Status:** ✅ Unchanged - remains as Tailwind template reference  
**Note:** Do not modify - serves as design system reference  
**Contains:** Sidebar navigation, stats cards, responsive layout patterns

## Rebuild Plan & Implementation Steps

### Phase 1: Homepage Rebuild (In Progress)
1. **Get UI Block patterns** from user (Hero + CTA grid)
2. **Replace layout** with UI Block HTML structure
3. **Keep Catalyst components** (`<Button color="indigo">`, `<Heading>`)
4. **Add brand colors** from minimal theme (`theme.brandColors.primary`)
5. **Test responsive behavior** across devices

### Phase 2: Lead Form Rebuild  
1. **Find form UI Block** pattern for centered form layout
2. **Replace `theme.components.form` usage** with UI Block classes
3. **Add `color="indigo"`** to submit button for brand consistency
4. **Keep Catalyst form components** (Fieldset, Field, Input, Label)
5. **Maintain form validation and error states**

### Phase 3: Login Page Rebuild
1. **Use form UI Block** pattern for login layout
2. **Replace theme layout** usage with UI Block classes  
3. **Keep existing** `<Button color="indigo">` and `<Heading>`
4. **Maintain Google OAuth integration**

### Phase 4: Portal Pages (Future Scope)
- Admin page (`/src/app/admin/page.tsx`)
- Portal login/registration pages (`/src/app/portal/*`)
- Apply same architecture: UI Blocks + Catalyst + minimal theme

## Component Usage Guidelines

### Catalyst Button Component
```jsx
// ✅ Correct usage
<Button color="indigo" className="w-full h-16 text-lg">
  Action Text
</Button>

// ❌ Avoid custom theme overrides
<Button className={theme.components.button.homepage}>
```

### Catalyst Form Components
```jsx
// ✅ Correct usage
<Fieldset>
  <FieldGroup>
    <Field>
      <Label>Field Name</Label>
      <Input type="text" placeholder="Enter value" />
    </Field>
  </FieldGroup>
</Fieldset>
```

### Brand Color Application
```jsx
// ✅ Correct usage
<Heading className={`text-8xl font-bold ${theme.brandColors.primary}`}>
  The Law Shop
</Heading>
```

## Key Principles Going Forward

1. **No custom theme abstractions** - use UI Blocks for layout patterns
2. **Catalyst color props only** - `color="indigo"` for brand consistency
3. **Minimal theme for brand colors** - only TLS-specific styling needs
4. **Proven patterns over custom** - leverage Tailwind UI expertise and testing
5. **Component boundaries respected** - don't override Catalyst internals
6. **Accessibility maintained** - rely on Catalyst's built-in accessibility features

## Current Blockers & Next Steps

### Immediate Blocker
**Waiting for:** UI Block patterns from user for:
- Hero section pattern (marketing/heroes)
- CTA button grid pattern (6 buttons, responsive layout)

### Error Resolution Required
**Runtime Errors:** Pages currently reference removed theme properties
- Homepage: `theme.layout.page.container` undefined
- Lead form: `theme.components.form.container` undefined  
- Login: `theme.layout.page.padding` undefined

### Success Criteria
- ✅ All pages load without errors
- ✅ Consistent indigo branding across buttons
- ✅ Responsive layouts work on all devices
- ✅ Accessibility maintained through Catalyst components
- ✅ Clean separation between UI Blocks, Catalyst, and theme

## File Structure After Migration

```
src/
├── catalyst/
│   ├── components/        # Catalyst UI components (unchanged)
│   └── theme.ts          # Minimal brand colors only
├── app/
│   ├── page.tsx          # Homepage with UI Blocks + Catalyst
│   ├── lead/page.tsx     # Lead form with UI Blocks + Catalyst
│   ├── login/page.tsx    # Login with UI Blocks + Catalyst
│   └── dashboard/page.tsx # Unchanged Tailwind template
└── components/
    └── forms/
        └── ClientLeadForm.tsx # Form with Catalyst components
```
