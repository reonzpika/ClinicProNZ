# ClinicPro Clinical Image Desktop Management System

## Overview

ClinicPro's Clinical Image Management System provides a comprehensive desktop interface for healthcare professionals to upload, manage, and analyse clinical images. The system integrates AI-powered image analysis with Claude Vision API, multi-source image aggregation (consultation and mobile uploads), and secure S3 storage management. This forms the desktop counterpart to the mobile image capture workflow, enabling complete clinical imaging documentation.

## System Architecture

### Core Components
- **Desktop Upload Interface**: Direct file upload with drag-and-drop support
- **Mobile Integration Hub**: QR code generation for mobile device pairing
- **AI Analysis Engine**: Claude Vision API integration with streaming responses
- **Multi-Source Aggregation**: Unified view of consultation and mobile images
- **S3 Storage Management**: Presigned URL handling for secure image operations

### Data Flow Pipeline
```
Desktop Upload → S3 Storage → Image Gallery → AI Analysis → Clinical Documentation
Mobile QR → Mobile Upload → Desktop Sync → Analysis → Integration
```

## Clinical Image Management Workflow

### Features
- **Multi-Modal Upload**: Direct file upload and mobile QR code integration
- **Unified Image Gallery**: Grid-based display of all clinical images
- **AI-Powered Analysis**: Claude Vision integration with custom prompts
- **Real-Time Streaming**: Progressive analysis results display
- **Mobile Token Integration**: Seamless mobile device pairing
- **Source Tracking**: Clear identification of image sources (consultation/mobile)

### Technical Characteristics
- **Multi-Source Support**: Aggregates images from consultation and mobile uploads
- **AI Analysis**: Claude 3.5 Sonnet integration with clinical prompts
- **Streaming Responses**: Real-time analysis updates with progress indication
- **Mobile Token Validation**: Database-backed mobile device authentication
- **S3 Direct Access**: Presigned URLs for secure image operations
- **RBAC Enforcement**: Role-based access control for all operations

### Desktop Workflow Steps
1. GP accesses clinical image management interface
2. Upload images directly via file input or mobile QR code pairing
3. System aggregates images from all sources (consultation/mobile)
4. Images displayed in responsive grid with metadata
5. Click image to open AI analysis modal
6. Select preset prompts or custom analysis requests
7. Receive streaming AI analysis with clinical insights
8. Results integrated into consultation documentation

## Image Upload System

### Direct Upload Component
```typescript
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  for (const file of files) {
    await uploadFile(file);
  }
};
```

### Mobile Integration Pipeline
- **QR Code Generation**: Dynamic URL creation for mobile access
- **Token Validation**: Database verification of mobile tokens
- **Cross-Platform Sync**: Real-time upload notifications
- **Source Attribution**: Clear mobile vs consultation image tracking

### Upload Strategy
```typescript
// Mobile token integration for uploads
const uploadFile = async (file: File) => {
  // Get or generate mobile token
  let mobileTokenId = await getMobileToken();
  
  // Generate presigned URL with mobile token
  const { uploadUrl } = await getPresignedUrl(file, mobileTokenId);
  
  // Direct S3 upload
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
};
```

## AI Analysis Engine

### Claude Vision Integration
```typescript
const analyseImage = async () => {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    temperature: 0.1, // Low temperature for clinical consistency
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: presignedUrl } },
          { type: 'text', text: customPrompt || defaultPrompt },
        ],
      },
    ],
    stream: true,
  });
};
```

### Clinical Analysis Features
- **Professional Prompts**: Medical terminology and clinical observation focus
- **Streaming Responses**: Real-time progressive analysis display
- **Preset Templates**: Quick prompts for common analysis types
- **Custom Prompts**: Flexible user-defined analysis requests
- **Clinical Context**: NZ healthcare system and terminology integration

### Analysis Modal System
- **Full-Screen Interface**: Dedicated analysis workspace
- **Image Preview**: High-quality image display with zoom capabilities
- **Progressive Results**: Real-time streaming analysis updates
- **Prompt Management**: Preset and custom prompt selection
- **Result Export**: Copy and integration capabilities

## Multi-Source Image Aggregation

### Database Integration
```typescript
// Fetch consultation images
const userSessions = await db
  .select({ id: patientSessions.id })
  .from(patientSessions)
  .where(eq(patientSessions.userId, userId));

// Fetch mobile images  
const userTokens = await db
  .select({ token: mobileTokens.token })
  .from(mobileTokens)
  .where(eq(mobileTokens.userId, userId));
```

### Source Aggregation Strategy
- **Consultation Images**: `consultations/{sessionId}/` prefix in S3
- **Mobile Images**: `mobile-uploads/{tokenId}/` prefix in S3
- **Unified Display**: Combined gallery with source identification
- **Metadata Enrichment**: Size, upload date, source type tracking
- **Session Association**: Links to patient sessions and mobile tokens

### Image Data Structure
```typescript
type ServerImage = {
  id: string;                           // Unique cross-source identifier
  key: string;                          // S3 object key
  filename: string;                     // Original filename
  mimeType: string;                     // Image format
  size: number;                         // File size in bytes
  uploadedAt: string;                   // ISO timestamp
  source: 'consultation' | 'mobile';    // Upload source
  sessionId?: string;                   // Consultation session link
  tokenId?: string;                     // Mobile token identifier
};
```

## API Endpoints & Security

### Image Management APIs
```
GET  /api/clinical-images/list          # Multi-source image aggregation
POST /api/clinical-images/analyze       # Claude Vision analysis  
GET  /api/uploads/presign               # S3 upload URL generation
GET  /api/uploads/download              # S3 download URL generation
```

### Security Features
- **RBAC Enforcement**: Role-based access control on all endpoints
- **Multi-Factor Authentication**: Clerk JWT + mobile token validation
- **S3 Key Validation**: Strict prefix checking for security
- **Presigned URL Expiry**: Time-limited access (1-5 hours)
- **User Isolation**: Images scoped to user sessions and tokens

### Authentication Flow
```typescript
// Multi-modal authentication
const { userId } = await auth();                    // Clerk JWT
const mobileToken = req.headers.get('x-mobile-token'); // Mobile device
const rbacContext = await extractRBACContext(req);  // Role validation

if (!permissionCheck.allowed) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

## UI Components Architecture

### Page Structure
```typescript
// Main Clinical Image Page
export default function ClinicalImagePage() {
  const [serverImages, setServerImages] = useState<ServerImage[]>([]);
  const [analysisModal, setAnalysisModal] = useState<AnalysisModal>({...});
  
  return (
    <Container>
      {/* Left Panel - Upload Controls */}
      <div className="w-80">
        <UploadControls />
        <QRCodeDisplay />
      </div>
      
      {/* Right Panel - Image Gallery */}
      <div className="flex-1">
        <ImageGallery images={serverImages} />
      </div>
      
      {/* Analysis Modal */}
      {analysisModal.isOpen && <AnalysisModal {...analysisModal} />}
    </Container>
  );
}
```

### Component Breakdown
- **Upload Controls**: File input, mobile QR toggle, progress indicators
- **QR Code Display**: Dynamic mobile pairing with device instructions
- **Image Gallery**: Responsive grid with lazy loading and metadata
- **Server Image Card**: Individual image preview with analysis triggers
- **Analysis Modal**: Full-screen analysis interface with streaming results

### State Management

**Architecture: Zustand Store + TanStack Query**

The image management system uses a modern state management approach combining Zustand for UI state and TanStack Query for server state management.

#### Store Structure (`useImageStore`)
```typescript
// Zustand store handles UI state
const {
  isMobile,
  showQR,
  error,
  analysisModal,
  mobileState,
  capturedPhotos,
  uploadProgress,
  isUploadingBatch,
  // Actions
  setIsMobile,
  openAnalysisModal,
  closeAnalysisModal,
  addCapturedPhoto,
  updateCapturedPhoto,
  // ... more actions
} = useImageStore();
```

#### Query Management (`TanStack Query`)
```typescript
// Smart caching and automatic refetching
const { data: serverImages, isLoading } = useServerImages();
const uploadImages = useUploadImages();
const analyzeImage = useAnalyzeImage();
const { data: imageUrl } = useImageUrl(imageKey);
```

#### Benefits
- **Smart Caching**: Images loaded once, cached automatically
- **Background Updates**: Fresh data when needed  
- **Optimistic Updates**: UI updates instantly on upload
- **No Unnecessary Refetches**: Eliminates component re-render issues
- **Better Performance**: Automatic query invalidation and cache management

## File Structure & Code Organisation

### Clinical Image Page Components
```
app/(clinical)/image/
└── page.tsx                           # Main clinical image management interface
    ├── ClinicalImagePage()             # Primary page component
    ├── ServerImageCard()               # Individual image display component  
    ├── AnalysisModal()                 # AI analysis interface component
    └── Store + Query integration       # Zustand + TanStack Query state

State Management Files:
├── src/stores/imageStore.ts            # Zustand store for UI state
├── src/hooks/useImageQueries.ts        # TanStack Query hooks
└── src/lib/react-query.ts             # Query configuration and keys

Query Hooks:
├── useServerImages()                   # Cached image list with smart refetching
├── useUploadImages()                   # Upload mutation with optimistic updates  
├── useAnalyzeImage()                   # Claude Vision streaming analysis mutation
├── useImageUrl()                       # Cached presigned URL generation
└── Mobile QR integration               # QR code generation and display
```

### API Endpoint Structure
```
app/api/clinical-images/
├── list/route.ts                       # Multi-source image aggregation
│   ├── Consultation image fetching     # Patient session-based S3 listing
│   ├── Mobile image aggregation        # Mobile token-based S3 listing
│   ├── Metadata enrichment            # Size, type, upload date processing
│   └── Unified response formatting     # Combined gallery data structure

└── analyze/route.ts                    # Claude Vision analysis endpoint
    ├── RBAC authentication             # Role-based access validation
    ├── S3 presigned URL generation     # Secure Claude image access
    ├── Clinical prompt templating      # Medical analysis system prompts
    └── Streaming response handling     # Real-time analysis updates
```

### Upload API Integration  
```
app/api/uploads/
├── presign/route.ts                    # S3 upload URL generation
│   ├── Mobile token validation         # Database token verification
│   ├── S3 presigned URL creation       # Secure direct upload URLs
│   └── Metadata tagging               # Clinical context and user tracking

└── download/route.ts                   # S3 download URL generation  
    ├── Authentication validation       # Clerk JWT verification
    ├── S3 key security checking        # Consultation prefix validation
    └── Presigned download URLs         # Secure image access (1 hour expiry)
```

## Performance Characteristics

### Modern State Management Benefits
- **Eliminated Re-fetching**: TanStack Query prevents unnecessary API calls on component re-renders
- **Smart Caching**: Images cached for 5 minutes, download URLs for 30 minutes
- **Optimistic Updates**: UI responds instantly to uploads before server confirmation
- **Background Refetching**: Automatic fresh data when browser regains focus
- **Query Invalidation**: Automatic cache updates when mutations succeed

### Image Loading
- **Lazy Loading**: On-demand image URL generation for gallery display
- **Presigned URLs**: 1-hour expiry for download URLs, 5-minute for uploads
- **Grid Optimisation**: Responsive layout with aspect-ratio preservation  
- **Loading States**: Progressive loading indicators for image operations
- **URL Caching**: Query-based image URL caching prevents duplicate requests

### API Efficiency
- **Batch Operations**: Multi-file upload support with sequential processing
- **Streaming Analysis**: Real-time AI response updates reduce perceived latency
- **Database Optimisation**: Indexed queries on user sessions and mobile tokens
- **S3 Direct Access**: Bypasses server for image storage operations
- **Mutation-Based Uploads**: Centralized error handling and loading states

### Memory Management
- **Component Unmounting**: Proper cleanup of analysis streams and file inputs
- **Store Optimisation**: Zustand provides efficient selective re-renders
- **Query Garbage Collection**: Automatic cleanup of unused cache entries
- **Modal Management**: Single analysis modal with centralized state management

## Error Handling & Recovery

### Upload Error Management
```typescript
// Graceful upload error handling
try {
  for (const file of files) {
    await uploadFile(file);
  }
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to upload files');
} finally {
  setIsUploading(false);
}
```

### Analysis Error Recovery
- **Stream Interruption**: Graceful handling of Claude API disconnections
- **Token Expiry**: Automatic token refresh for extended analysis sessions
- **Rate Limiting**: User feedback for API limits with retry suggestions
- **Network Failure**: Connection monitoring with automatic retry attempts

### Authentication Error Handling
- **Expired Tokens**: Clear messaging with re-authentication prompts
- **RBAC Failures**: Informative access denied messages with upgrade paths
- **Mobile Token Issues**: QR code regeneration and pairing instructions
- **Session Management**: Automatic cleanup of invalid mobile tokens

## Clinical Workflow Integration

### Standard GP Image Workflow
1. **Multi-Source Access**: Images from consultation recording and mobile capture
2. **Unified Management**: Single interface for all clinical images
3. **AI-Assisted Analysis**: Claude Vision integration for clinical insights
4. **Documentation Integration**: Analysis results available for consultation notes
5. **Source Tracking**: Clear attribution for audit and clinical review
6. **Quality Control**: Full-resolution image access for detailed examination

### Recording System Integration
- **Session Continuity**: Images associated with current patient consultations
- **Real-Time Updates**: Mobile uploads immediately visible in desktop interface
- **Workflow Preservation**: Analysis doesn't interrupt consultation flow
- **Context Preservation**: Patient session context maintained throughout

## Scalability & Performance

### Concurrent Usage
- **Multi-User Support**: Independent image galleries per healthcare professional
- **Resource Isolation**: User-scoped S3 paths and database queries
- **Session Management**: Parallel analysis sessions without interference
- **Database Efficiency**: Optimised queries with appropriate indexing

### Data Management
- **Storage Organisation**: Structured S3 paths for efficient retrieval
- **Metadata Tracking**: Comprehensive image metadata for search and filter
- **Audit Trail**: Complete upload and analysis history
- **Cleanup Automation**: Expired token and inactive session management

---

*This document provides comprehensive coverage of ClinicPro's Clinical Image Management System. For implementation details and mobile integration, refer to mobile-image-capture.md and relevant source code.*
