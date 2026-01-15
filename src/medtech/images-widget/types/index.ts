/**
 * Medtech Images Widget - Type Definitions
 *
 * These types represent the simplified REST API from the Integration Gateway,
 * NOT the underlying FHIR resources.
 */

// ============================================================================
// Coded Concepts (SNOMED CT or internal codes)
// ============================================================================

export type CodeableConcept = {
  system?: string;
  code: string;
  display: string;
};

// ============================================================================
// Widget Image State
// ============================================================================

export type ImageStatus = 'pending' | 'compressing' | 'uploading' | 'committed' | 'error';

export type WidgetImage = {
  id: string;
  file: File | null; // Null for images uploaded from mobile (no File object)
  preview?: string; // Blob URL for preview (desktop capture)
  previewUrl?: string; // S3 presigned URL for preview (mobile upload)
  thumbnail?: string; // Compressed preview
  s3Key?: string; // S3 key (for images uploaded to session storage)

  // Metadata
  metadata: {
    bodySite?: CodeableConcept;
    laterality?: CodeableConcept;
    view?: CodeableConcept;
    type?: CodeableConcept;
    label?: string; // Free text to differentiate images
    notes?: string; // Additional notes
    // Edit state (non-destructive)
    edits?: {
      rotation?: number; // Rotation angle in degrees
      crop?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      arrows?: Array<
        | {
          // New format: start and end points
          id: string;
          x1: number; // Start point X as percentage (0-100)
          y1: number; // Start point Y as percentage (0-100)
          x2: number; // End point X as percentage (0-100)
          y2: number; // End point Y as percentage (0-100)
        }
        | {
          // Legacy format: position and angle (for backward compatibility when reading)
          id: string;
          x: number; // Position X as percentage (0-100)
          y: number; // Position Y as percentage (0-100)
          angle?: number; // Arrow rotation in degrees (default: 0 = pointing right)
        }
      >;
    };
  };

  // Commit options
  commitOptions?: {
    alsoInbox?: {
      enabled: boolean;
      recipientId?: string;
      note?: string;
    };
    alsoTask?: {
      enabled: boolean;
      assigneeId?: string;
      due?: string; // ISO date
      note?: string;
    };
  };

  // State
  status: ImageStatus;
  error?: string;

  // Result after commit
  result?: {
    documentReferenceId: string;
    mediaId?: string;
    inboxMessageId?: string;
    taskId?: string;
  };
};

// ============================================================================
// Capabilities Response (from GET /api/medtech/capabilities)
// ============================================================================

export type Capabilities = {
  provider: {
    name: string;
    environment: 'sandbox' | 'production' | 'mock';
  };

  features: {
    images: {
      enabled: boolean;
      mobileHandoff: {
        qr: boolean;
        ttlSeconds: number;
      };
      inbox: {
        enabled: boolean;
      };
      tasks: {
        enabled: boolean;
      };
      quickChips: {
        laterality: CodeableConcept[];
        bodySitesCommon: CodeableConcept[];
        views: CodeableConcept[];
        types: CodeableConcept[];
      };
    };
  };

  limits: {
    attachments: {
      acceptedTypes: string[];
      maxSizeBytes: number;
      maxPerRequest: number;
      maxTotalBytesPerEncounter?: number;
    };
  };

  recipients?: {
    inbox: Recipient[];
    tasks: Recipient[];
  };
};

export type Recipient = {
  id: string;
  type: 'user' | 'team';
  display: string;
};

// ============================================================================
// Mobile Session (QR Handoff)
// ============================================================================

export type MobileSessionResponse = {
  mobileUploadUrl: string;
  qrSvg: string | null; // SVG data URI (null if client-side generation)
  ttlSeconds: number;
};

// ============================================================================
// Upload Initiate (File Metadata)
// ============================================================================

export type UploadInitiateRequest = {
  encounterId: string;
  files: Array<{
    clientRef: string; // Client-side unique ID
    contentType: string;
    sizeBytes: number;
    hash?: string;
    clientCompression?: {
      longestEdgePx: number;
      quality: number;
      stripExif: boolean;
    };
    proposedMeta?: {
      title?: string;
      label?: string;
      bodySite?: CodeableConcept;
      laterality?: CodeableConcept;
      view?: CodeableConcept;
      type?: CodeableConcept;
    };
  }>;
};

export type UploadInitiateResponse = {
  uploadSessionId: string;
  files: Array<{
    clientRef: string;
    fileId: string;
    uploadUrl: string; // Presigned URL or direct POST endpoint
    headers?: Record<string, string>;
    expiresAt?: string;
  }>;
};

// ============================================================================
// Commit Request/Response
// ============================================================================

export type CommitRequest = {
  encounterId: string;
  /**
   * Patient ID is mandatory for real commit (Phase 1C).
   * Must be provided by the widget encounter context; the server must not look it up from ALEX.
   */
  patientId: string;
  /**
   * Facility ID for the target Medtech environment.
   * Critical for Phase 1D: your local Medtech Evolution UI may be a different facility (eg F99669-C).
   */
  facilityId: string;
  /**
   * Provider (Practitioner) ID from Medtech launch context.
   * Optional but recommended for Inbox Scan routing; if omitted, Medtech may route to a default inbox.
   */
  providerId?: string;
  files: Array<{
    fileId: string;
    /**
     * Optional for commit-time mapping; used to select a sensible contentType when posting to FHIR.
     */
    contentType?: string;
    /**
     * Commit-ready source. Exactly one should be provided.
     * - Desktop: base64Data (from File -> data URL or raw base64)
     * - Mobile: s3Key (server will presign to a downloadUrl for the BFF to fetch)
     */
    source?: {
      base64Data?: string;
      s3Key?: string;
    };
    meta: {
      title?: string;
      label?: string;
      bodySite?: CodeableConcept;
      laterality?: CodeableConcept;
      view?: CodeableConcept;
      type?: CodeableConcept;
    };
    derivedFromDocumentReferenceId?: string | null;
    alsoInbox?: {
      enabled: boolean;
      recipientId?: string;
      note?: string;
    };
    alsoTask?: {
      enabled: boolean;
      assigneeId?: string;
      due?: string;
      note?: string;
    };
    idempotencyKey?: string;
  }>;
};

export type CommitResponse = {
  /**
   * Correlation ID for tracing this commit through Vercel logs, BFF logs, and ALEX API.
   * Useful when a commit "succeeds" but the Medtech UI does not show the expected result.
   */
  correlationId?: string;
  files: Array<{
    fileId: string;
    status: 'committed' | 'error';
    documentReferenceId?: string;
    mediaId?: string;
    inboxMessageId?: string;
    taskId?: string;
    warnings?: string[];
    error?: string;
  }>;
};

// ============================================================================
// Encounter Context (from Medtech Evolution)
// ============================================================================

export type EncounterContext = {
  encounterId: string;
  patientId: string;
  patientName?: string;
  patientNHI?: string;
  facilityId: string;
  providerId?: string;
  providerName?: string;
  encounterDate?: string;
};

// ============================================================================
// Compression Options
// ============================================================================

export type CompressionOptions = {
  maxSizeBytes: number;
  longestEdgePx: number;
  quality: number;
  stripExif: boolean;
};

export type CompressionResult = {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
};
