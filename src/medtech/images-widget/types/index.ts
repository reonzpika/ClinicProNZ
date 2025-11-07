/**
 * Medtech Images Widget - Type Definitions
 * 
 * These types represent the simplified REST API from the Integration Gateway,
 * NOT the underlying FHIR resources.
 */

// ============================================================================
// Coded Concepts (SNOMED CT or internal codes)
// ============================================================================

export interface CodeableConcept {
  system?: string;
  code: string;
  display: string;
}

// ============================================================================
// Widget Image State
// ============================================================================

export type ImageStatus = 'pending' | 'compressing' | 'uploading' | 'committed' | 'error';

export interface WidgetImage {
  id: string;
  file: File;
  preview: string; // Blob URL for preview
  thumbnail?: string; // Compressed preview
  
  // Metadata
  metadata: {
    bodySite?: CodeableConcept;
    laterality?: CodeableConcept;
    view?: CodeableConcept;
    type?: CodeableConcept;
    label?: string; // Free text to differentiate images
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
}

// ============================================================================
// Capabilities Response (from GET /api/medtech/capabilities)
// ============================================================================

export interface Capabilities {
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
}

export interface Recipient {
  id: string;
  type: 'user' | 'team';
  display: string;
}

// ============================================================================
// Mobile Session (QR Handoff)
// ============================================================================

export interface MobileSessionResponse {
  mobileUploadUrl: string;
  qrSvg: string; // SVG data URI
  ttlSeconds: number;
}

// ============================================================================
// Upload Initiate (File Metadata)
// ============================================================================

export interface UploadInitiateRequest {
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
}

export interface UploadInitiateResponse {
  uploadSessionId: string;
  files: Array<{
    clientRef: string;
    fileId: string;
    uploadUrl: string; // Presigned URL or direct POST endpoint
    headers?: Record<string, string>;
    expiresAt?: string;
  }>;
}

// ============================================================================
// Commit Request/Response
// ============================================================================

export interface CommitRequest {
  encounterId: string;
  files: Array<{
    fileId: string;
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
}

export interface CommitResponse {
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
}

// ============================================================================
// Encounter Context (from Medtech Evolution)
// ============================================================================

export interface EncounterContext {
  encounterId: string;
  patientId: string;
  patientName?: string;
  patientNHI?: string;
  facilityId: string;
  providerId?: string;
  providerName?: string;
  encounterDate?: string;
}

// ============================================================================
// Compression Options
// ============================================================================

export interface CompressionOptions {
  maxSizeBytes: number;
  longestEdgePx: number;
  quality: number;
  stripExif: boolean;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}
