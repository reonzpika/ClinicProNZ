/**
 * Mock Medtech API Service
 *
 * Simulates Integration Gateway API responses while ALEX API is blocked.
 * Switch to real API by setting NEXT_PUBLIC_MEDTECH_USE_MOCK=false
 */

import type {
  Capabilities,
  CommitRequest,
  CommitResponse,
  MobileSessionResponse,
  UploadInitiateRequest,
  UploadInitiateResponse,
} from '../types';

const MOCK_DELAY = 800; // Simulate network latency (ms)

/**
 * Simulate network delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock Medtech API
 */
export const mockMedtechAPI = {
  /**
   * GET /api/medtech/capabilities
   * Returns feature flags and coded value lists
   */
  async getCapabilities(): Promise<Capabilities> {
    await delay(MOCK_DELAY);

    console.log('[MOCK API] GET /api/medtech/capabilities');

    return {
      provider: {
        name: 'alex',
        environment: 'mock',
      },
      features: {
        images: {
          enabled: true,
          mobileHandoff: {
            qr: true,
            ttlSeconds: 600,
          },
          inbox: {
            enabled: true,
          },
          tasks: {
            enabled: true,
          },
          quickChips: {
            laterality: [
              { system: 'http://snomed.info/sct', code: '24028007', display: 'Right' },
              { system: 'http://snomed.info/sct', code: '7771000', display: 'Left' },
              { system: 'http://snomed.info/sct', code: '51440002', display: 'Bilateral' },
              { system: 'http://snomed.info/sct', code: '373067005', display: 'Not applicable' },
            ],
            bodySitesCommon: [
              { system: 'http://snomed.info/sct', code: '89545001', display: 'Face' },
              { system: 'http://snomed.info/sct', code: '43799004', display: 'Scalp' },
              { system: 'http://snomed.info/sct', code: '22943007', display: 'Trunk' },
              { system: 'http://snomed.info/sct', code: '53120007', display: 'Upper limb' },
              { system: 'http://snomed.info/sct', code: '40983000', display: 'Forearm' },
              { system: 'http://snomed.info/sct', code: '7569003', display: 'Hand' },
              { system: 'http://snomed.info/sct', code: '61685007', display: 'Lower limb' },
              { system: 'http://snomed.info/sct', code: '30021000', display: 'Leg' },
              { system: 'http://snomed.info/sct', code: '56459004', display: 'Foot' },
            ],
            views: [
              { system: 'clinicpro/view', code: 'close-up', display: 'Close-up' },
              { system: 'clinicpro/view', code: 'dermoscopy', display: 'Dermoscopy' },
              { system: 'clinicpro/view', code: 'other', display: 'Other' },
            ],
            types: [
              { system: 'clinicpro/type', code: 'lesion', display: 'Lesion' },
              { system: 'clinicpro/type', code: 'rash', display: 'Rash' },
              { system: 'clinicpro/type', code: 'wound', display: 'Wound' },
              { system: 'clinicpro/type', code: 'infection', display: 'Infection' },
              { system: 'clinicpro/type', code: 'other', display: 'Other' },
            ],
          },
        },
      },
      limits: {
        attachments: {
          acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
          maxSizeBytes: 1048576, // 1MB
          maxPerRequest: 10,
          maxTotalBytesPerEncounter: 52428800, // 50MB
        },
      },
      recipients: {
        inbox: [
          { id: 'mock-gp-1', type: 'user', display: 'Dr Mock Smith' },
          { id: 'mock-gp-2', type: 'user', display: 'Dr Mock Jones' },
          { id: 'mock-team-1', type: 'team', display: 'Triage Inbox' },
        ],
        tasks: [
          { id: 'mock-nurse-1', type: 'user', display: 'Nurse Mock Lee' },
          { id: 'mock-nurse-2', type: 'user', display: 'Nurse Mock Chen' },
        ],
      },
    };
  },

  /**
   * POST /api/medtech/mobile/initiate
   * Generate QR code for mobile upload
   */
  async initiateMobile(encounterId: string): Promise<MobileSessionResponse> {
    await delay(MOCK_DELAY);

    console.log('[MOCK API] POST /api/medtech/mobile/initiate', { encounterId });

    const token = `mock-token-${Date.now()}`;
    const mobileUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/medtech-images/mobile?t=${token}`
      : `/medtech-images/mobile?t=${token}`;

    // Generate simple QR code SVG (in real app, use qrcode.react or similar)
    const qrSvg = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">
          QR Code Mock
        </text>
        <text x="100" y="120" text-anchor="middle" font-size="8" fill="gray">
          ${token.slice(0, 20)}...
        </text>
      </svg>
    `)}`;

    return {
      mobileUploadUrl: mobileUrl,
      qrSvg,
      ttlSeconds: 600,
    };
  },

  /**
   * POST /api/medtech/attachments/upload-initiate
   * Prepare file metadata for upload (not used in mock - direct commit)
   */
  async uploadInitiate(request: UploadInitiateRequest): Promise<UploadInitiateResponse> {
    await delay(MOCK_DELAY);

    console.log('[MOCK API] POST /api/medtech/attachments/upload-initiate', request);

    return {
      uploadSessionId: `mock-session-${Date.now()}`,
      files: request.files.map(f => ({
        clientRef: f.clientRef,
        fileId: `mock-file-${Math.random().toString(36).slice(2)}`,
        uploadUrl: '/api/mock-upload', // Not used in mock
        headers: {},
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      })),
    };
  },

  /**
   * POST /api/medtech/attachments/commit
   * Commit images to encounter (simulates ALEX FHIR POST)
   */
  async commit(request: CommitRequest): Promise<CommitResponse> {
    await delay(MOCK_DELAY * 2); // Longer for "upload"

    console.log('[MOCK API] POST /api/medtech/attachments/commit');
    console.log('Encounter ID:', request.encounterId);
    console.log('Files:', request.files.map(f => ({
      fileId: f.fileId,
      metadata: f.meta,
      inbox: f.alsoInbox,
      task: f.alsoTask,
    })));

    // Simulate success
    return {
      files: request.files.map(f => ({
        fileId: f.fileId,
        status: 'committed',
        documentReferenceId: `mock-dr-${Math.random().toString(36).slice(2, 10)}`,
        mediaId: `mock-media-${Math.random().toString(36).slice(2, 10)}`,
        inboxMessageId: f.alsoInbox?.enabled
          ? `mock-inbox-${Math.random().toString(36).slice(2, 10)}`
          : undefined,
        taskId: f.alsoTask?.enabled
          ? `mock-task-${Math.random().toString(36).slice(2, 10)}`
          : undefined,
        warnings: [],
      })),
    };
  },
};

/**
 * Real Medtech API (calls actual Integration Gateway endpoints)
 */
export const realMedtechAPI = {
  async getCapabilities(): Promise<Capabilities> {
    const response = await fetch('/api/medtech/capabilities');
    if (!response.ok) {
      throw new Error(`Failed to fetch capabilities: ${response.statusText}`);
    }
    return response.json();
  },

  async initiateMobile(encounterId: string, patientId: string, facilityId: string): Promise<MobileSessionResponse> {
    const response = await fetch('/api/medtech/session/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encounterId, patientId, facilityId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate mobile session: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map Phase 1B response format to MobileSessionResponse
    return {
      mobileUploadUrl: data.mobileUrl,
      qrSvg: null, // QR generation will happen client-side
      ttlSeconds: data.expiresIn,
    };
  },

  async uploadInitiate(request: UploadInitiateRequest): Promise<UploadInitiateResponse> {
    const response = await fetch('/api/medtech/attachments/upload-initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate upload: ${response.statusText}`);
    }

    return response.json();
  },

  async commit(request: CommitRequest): Promise<CommitResponse> {
    const response = await fetch('/api/medtech/attachments/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to commit: ${response.statusText}`);
    }

    return response.json();
  },
};

/**
 * Export the appropriate API based on environment variable
 */
const USE_MOCK = process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true';

export const medtechAPI = USE_MOCK ? mockMedtechAPI : realMedtechAPI;
