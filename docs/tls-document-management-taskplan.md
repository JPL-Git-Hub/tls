# TLS Document Management System Implementation Task Plan
## **Attorney Dashboard Focus - Phases 1-4**
## **Headless UI Consistency Strategy**

**Component Approach**: Use @cubone (headless file manager logic) + Headless UI (consistent dashboard styling)
- @cubone provides file management functionality without enforcing UI styles
- Headless UI components (Dialog, Menu, Disclosure) maintain existing dashboard patterns
- Tailwind classes style @cubone to match your current attorney dashboard aesthetic
- No component library mixing - keeps dashboard interface consistent

## **Phase 1: Foundation & Cubone Integration (Week 1)**

### **Task 1.1: Cubone Setup & Attorney Dashboard Integration**
- [ ] Install @cubone/react-file-manager with CSS imports in TLS codebase
- [ ] Create Cubone wrapper component styled with Tailwind to match existing Headless UI dashboard patterns
- [ ] Replace `admin-document-selector.tsx` (lines 1-206) with Headless UI + Cubone integration
- [ ] Test dynamic import with `{ ssr: false }` for Next.js compatibility
- [ ] Maintain existing attorney authentication and security patterns

### **Task 1.2: Firebase Storage Integration with Headless UI**
- [ ] Create Cubone adapter for existing Firebase Storage patterns
- [ ] Style Cubone components with Tailwind classes to match Headless UI dashboard aesthetic
- [ ] Preserve current `document-upload.tsx` upload functionality within Cubone + Headless UI
- [ ] Test with existing case/document relationships in attorney dashboard
- [ ] Validate document access through Firebase Security Rules

### **Task 1.3: Schema Preparation**
- [ ] Add optional fields to DocumentData schema (storageType, folderId, fileSize, mimeType)
- [ ] Create FolderData schema for Firestore subcollections
- [ ] Implement backward compatibility for existing documents
- [ ] Test schema changes with current attorney document operations

## **Phase 2: Enhanced File Management (Weeks 2-3)**

### **Task 2.1: Attorney Document Cards Enhancement with Headless UI**
- [ ] Replace basic document list with rich cards using Headless UI + Tailwind patterns
- [ ] Add file type icons and document analytics matching attorney dashboard styling
- [ ] Create quick action menus using Headless UI Menu components (view, share, download, delete)
- [ ] Integrate with existing PDF viewer (`document-viewer.tsx`) for attorney document review
- [ ] Maintain consistent Headless UI component patterns from existing dashboard

### **Task 2.2: Advanced Upload System for Attorneys**
- [ ] Enhance `document-upload.tsx` with react-dropzone drag-and-drop
- [ ] Implement upload progress tracking in attorney dashboard
- [ ] Add enhanced file validation for legal document types
- [ ] Create bulk upload capabilities with case assignment for attorney workflows

### **Task 2.3: Case-Based Organization & Navigation with Headless UI**
- [ ] Implement folder structure within cases using Firestore subcollections
- [ ] Add drag-and-drop document organization styled with existing dashboard patterns
- [ ] Create multi-select bulk operations using Headless UI components for attorney workflows
- [ ] Add breadcrumb navigation using Headless UI patterns for case/folder hierarchy
- [ ] Maintain consistent attorney dashboard UX with existing Headless UI styling

### **Task 2.4: Attorney Search & Filtering**
- [ ] Implement document search across names and metadata in attorney dashboard
- [ ] Add filters by document type, date range, case for attorney workflows
- [ ] Create saved search/filter configurations for attorney efficiency
- [ ] Maintain attorney-level access to all cases via existing security patterns

## **Phase 3: Google Drive Integration (Weeks 4-6)**

### **Task 3.1: Google Drive API Setup**
- [ ] Configure Google Drive API with existing @thelawshop.com GWS credentials
- [ ] Create service account for automated operations via attorney dashboard
- [ ] Set up API routes for Google Drive operations (`/api/documents/google-drive`)
- [ ] Test Google Drive authentication with existing Google Functions setup

### **Task 3.2: Dual Storage Architecture**
- [ ] Create storage router logic (docType-based) for Firebase vs Google Drive
- [ ] Implement Google Drive upload for case documents via attorney dashboard
- [ ] Maintain Firebase Storage for system documents (thumbnails, processed files)
- [ ] Update Firestore metadata to track storage location and googleDriveId

### **Task 3.3: Attorney Desktop Workflow Integration**
- [ ] Create automated Google Drive folder creation for new cases
- [ ] Implement case folder templates (Contracts, Disclosures, Correspondence, Settlement)
- [ ] Set up attorney Google Drive permissions for desktop access
- [ ] Test attorney desktop file manager → Google Drive → attorney dashboard sync

### **Task 3.4: Document Processing Pipeline**
- [ ] Create Google Function for processing attorney uploads
- [ ] Implement document validation and routing between storage systems
- [ ] Add PDF thumbnail generation for attorney dashboard previews
- [ ] Create audit trail logging for attorney document operations

## **Phase 4: Advanced Attorney Features (Weeks 7-8)**

### **Task 4.1: Document Sharing for Attorney Workflows with Headless UI**
- [ ] Generate secure sharing links for external client/third-party access
- [ ] Implement access control and expiration settings using Headless UI Dialog components
- [ ] Create share tracking and analytics integrated with attorney dashboard patterns
- [ ] Integration with existing client portal authentication for seamless sharing
- [ ] Use Headless UI Menu components for sharing options and controls

### **Task 4.2: Version Control & Document History with Headless UI**
- [ ] Implement document versioning system using Headless UI Disclosure components
- [ ] Create version history display matching attorney dashboard styling patterns
- [ ] Add document comparison capabilities using Headless UI Dialog components
- [ ] Integrate with Google Drive native versioning for desktop workflow
- [ ] Maintain consistent Headless UI navigation patterns for version controls

### **Task 4.3: Attorney Collaboration Features with Headless UI**
- [ ] Add document comments and annotations using Headless UI Dialog components
- [ ] Implement real-time collaboration indicators matching attorney dashboard styling
- [ ] Create document review and approval workflows using Headless UI Menu and Dialog patterns
- [ ] Integration with attorney role permissions (hardcoded authorization system)
- [ ] Maintain consistent Headless UI component patterns throughout collaboration features

### **Task 4.4: Legal Compliance & Audit Features**
- [ ] Enhanced audit logging for legal requirements in attorney dashboard
- [ ] Document retention policy implementation for case management
- [ ] Chain of custody tracking for legal document integrity
- [ ] Integration with existing structured error logging system

## **Implementation Guidelines**

### **Attorney Dashboard Consistency with Headless UI**
- All development maintains existing Headless UI + Tailwind patterns
- @cubone components styled to match current attorney dashboard aesthetic
- Use established Headless UI components (Dialog, Menu, Disclosure) for document actions
- Maintains interface consistency within attorney dashboard you already like
- Leverages existing Headless UI knowledge for faster development

### **Incremental Development Approach**
- Each task generates 10-20 lines of focused code
- Single-objective CC prompts under 50 words
- Build on existing TLS architecture patterns with Headless UI consistency
- Reference established Firebase and authentication patterns
- Use existing attorney authentication via Google OAuth + domain verification
- Style @cubone with Tailwind classes to match Headless UI dashboard patterns

### **Success Metrics**
- Complete feature parity with Papermark comparison for attorney workflows
- Seamless integration with existing attorney dashboard
- Desktop workflow integration for attorney file management
- Sub-2-second document load times in attorney dashboard
- Zero security rule violations in testing

### **Risk Mitigation Based on Claude Code Assessment**
- Maintain existing system functionality throughout development
- Create rollback points at each phase completion
- Test all changes against existing case/client data
- Validate Google API rate limits and costs
- **Extended timeline for Google Drive integration (6 weeks vs 4 weeks)**

### **Completion Timeline: 8 weeks (Attorney Dashboard Foundation)**
**Week 1**: Cubone foundation with Headless UI integration in attorney dashboard
**Weeks 2-3**: Enhanced file management using Headless UI component patterns
**Weeks 4-6**: Google Drive integration and dual storage (extended timeline)
**Weeks 7-8**: Advanced features and legal compliance with Headless UI consistency

This plan focuses specifically on attorney dashboard document management using existing Headless UI patterns, providing enterprise-grade functionality while leveraging your Google Workspace infrastructure and maintaining the consistent dashboard experience you already like.