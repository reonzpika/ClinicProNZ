require('dotenv').config();
const express = require('express');
const oauthTokenService = require('./services/oauth-token-service');
const alexApiClient = require('./services/alex-api-client');
const { randomUUID } = require('node:crypto');
const { Buffer } = require('node:buffer');

const app = express();
app.use(express.json());

const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB

function coerceFacilityId(raw) {
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

function shouldForceRefresh(raw) {
  if (raw === true) {
 return true;
}
  if (typeof raw !== 'string') {
 return false;
}
  return raw === '1' || raw.toLowerCase() === 'true';
}

function respondWithAlexError(res, error, fallback) {
  const statusCode = (error && typeof error.statusCode === 'number' && error.statusCode >= 100)
    ? error.statusCode
    : (fallback || 500);

  const correlationId = (error && typeof error.correlationId === 'string' && error.correlationId.trim())
    ? error.correlationId.trim()
    : undefined;

  res.status(statusCode).json({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    ...(correlationId ? { correlationId } : {}),
  });
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'clinicpro-bff',
    time: new Date().toISOString(),
    medtech: 'enabled',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Medtech: Token info
app.get('/api/medtech/token-info', (req, res) => {
  const tokenInfo = oauthTokenService.getTokenInfo();
  res.json({
    tokenCache: {
      isCached: tokenInfo.isCached,
      expiresIn: tokenInfo.expiresIn
? {
        seconds: Math.round(tokenInfo.expiresIn / 1000),
        minutes: Math.round(tokenInfo.expiresIn / 60000),
      }
: null,
    },
    environment: {
      baseUrl: process.env.MEDTECH_API_BASE_URL,
      facilityId: process.env.MEDTECH_FACILITY_ID,
      hasClientId: !!process.env.MEDTECH_CLIENT_ID,
      hasClientSecret: !!process.env.MEDTECH_CLIENT_SECRET,
    },
  });
});

// ============================================================================
// Medtech: DocumentReference verification (debug)
// ============================================================================
/**
 * GET /api/medtech/document-reference/:id
 *
 * Purpose:
 * - Confirm a committed Inbox Scan document exists in ALEX quickly, independent of Evolution UI.
 *
 * Notes:
 * - This uses a read-by-id (`GET /DocumentReference/{id}`) which may be permitted even if search is restricted.
 * - If ALEX rejects this, the endpoint returns the ALEX error + correlationId to forward to Medtech support.
 */
app.get('/api/medtech/document-reference/:id', async (req, res) => {
  const startTime = Date.now();
  const correlationId = randomUUID();
  const facilityId = coerceFacilityId(req.query.facilityId);

  try {
    const id = req.params?.id;
    if (typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'id path parameter required',
        correlationId,
      });
    }

    const doc = await alexApiClient.get(
      `/DocumentReference/${encodeURIComponent(id.trim())}`,
      { correlationId, facilityId },
    );

    return res.json({
      success: true,
      correlationId,
      durationMs: Date.now() - startTime,
      documentReference: doc,
    });
  } catch (error) {
    return respondWithAlexError(res, error, 500);
  }
});

// ============================================================================
// Medtech: Vendor Forms Launch Decode (ALEX Apps)
// ============================================================================
/**
 * GET /api/medtech/launch/decode?context=...&signature=...&correlationId=...
 *
 * Purpose: Decode Medtech Evolution vendor form launch parameters via ALEX.
 * Boundary: Only the BFF calls ALEX (static IP allow-listed).
 *
 * Returns:
 * {
 *   success: true,
 *   correlationId,
 *   durationMs,
 *   context: { patientId, facilityCode, providerId?, createdTime? }
 * }
 */
app.get('/api/medtech/launch/decode', async (req, res) => {
  const { context, signature } = req.query;
  const startTime = Date.now();
  const correlationId = (typeof req.query.correlationId === 'string' && req.query.correlationId.trim())
    ? req.query.correlationId.trim()
    : randomUUID();

  try {
    if (typeof context !== 'string' || !context.trim() || typeof signature !== 'string' || !signature.trim()) {
      return res.status(400).json({
        success: false,
        error: 'context and signature parameters required',
        correlationId,
      });
    }

    // ALEX endpoint is path-parameter based; ensure URL-safe encoding.
    const encodedContext = encodeURIComponent(context.trim());
    const encodedSignature = encodeURIComponent(signature.trim());

    const launchContext = await alexApiClient.get(
      `/vendorforms/api/getlaunchcontextstring/${encodedContext}/${encodedSignature}`,
      { correlationId },
    );

    return res.json({
      success: true,
      correlationId,
      durationMs: Date.now() - startTime,
      context: launchContext,
    });
  } catch (error) {
    return respondWithAlexError(res, error, 500);
  }
});

// Medtech: Test FHIR connectivity
app.get('/api/medtech/test', async (req, res) => {
  const nhi = req.query.nhi || 'ZZZ0016';
  const facilityId = coerceFacilityId(req.query.facilityId);
  const forceRefresh = shouldForceRefresh(req.query.forceRefresh);
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    if (forceRefresh) {
      await oauthTokenService.forceRefresh();
    }
    const tokenInfo = oauthTokenService.getTokenInfo();
    const patientBundle = await alexApiClient.get(
      `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
      { facilityId, correlationId },
    );

    const firstPatientId = patientBundle?.entry?.[0]?.resource?.id || null;

    res.json({
      success: true,
      correlationId,
      duration: Date.now() - startTime,
      tokenInfo: {
        isCached: tokenInfo.isCached,
        expiresIn: tokenInfo.expiresIn ? Math.round(tokenInfo.expiresIn / 1000) : null,
      },
      fhirResult: {
        resourceType: patientBundle.resourceType,
        type: patientBundle.type,
        total: patientBundle.total,
        patientCount: patientBundle.entry?.length || 0,
        // Minimal patient info for downstream testing (patientId is required by widget).
        firstPatientId,
      },
    });
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId,
      duration: Date.now() - startTime,
    });
  }
});

// ============================================================================
// Medtech: Commit session images to ALEX as Inbox Scan DocumentReference (legacy compatible)
// ============================================================================

function stripDataUrlPrefix(base64OrDataUrl) {
  if (typeof base64OrDataUrl !== 'string') {
 return '';
}

  // Supports: data:image/jpeg;base64,AAAA... and plain base64 AAAA...
  const commaIndex = base64OrDataUrl.indexOf(',');
  if (base64OrDataUrl.startsWith('data:') && commaIndex >= 0) {
    return base64OrDataUrl.slice(commaIndex + 1).trim();
  }
  return base64OrDataUrl.trim();
}

async function downloadUrlToBase64(downloadUrl) {
  const response = await fetch(downloadUrl, { method: 'GET' });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`downloadUrl fetch failed: ${response.status} ${errorText}`.trim());
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  if (bytes.length > MAX_IMAGE_BYTES) {
    throw new Error(`image too large: ${bytes.length} bytes (max ${MAX_IMAGE_BYTES})`);
  }

  const contentType = response.headers.get('content-type') || null;
  const base64 = bytes.toString('base64');

  return { base64, contentType, sizeBytes: bytes.length, bytes };
}

function base64ToBytes(base64) {
  try {
    return Buffer.from(base64, 'base64');
  } catch {
    return null;
  }
}

function sniffAttachmentContentType(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 4) {
 return null;
}

  // PDF magic bytes: %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }

  // JPEG magic bytes: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4E
    && bytes[3] === 0x47
    && bytes[4] === 0x0D
    && bytes[5] === 0x0A
    && bytes[6] === 0x1A
    && bytes[7] === 0x0A
  ) {
    return 'image/png';
  }

  // TIFF magic bytes:
  // - Little endian: 49 49 2A 00
  // - Big endian:    4D 4D 00 2A
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00)
    || (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A)
  ) {
    return 'image/tiff';
  }

  return null;
}

function getNzCreatedDateTimeNow() {
  // We want the datetime to land on the correct NZ clinical day in Medtech UI.
  // Prefer an ISO datetime with an explicit Pacific/Auckland offset if supported by the runtime.
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'shortOffset',
    }).formatToParts(now);

    const get = type => parts.find(p => p.type === type)?.value;
    const year = get('year');
    const month = get('month');
    const day = get('day');
    const hour = get('hour');
    const minute = get('minute');
    const second = get('second');
    const tz = get('timeZoneName'); // eg "GMT+13" or "GMT+12"

    if (!year || !month || !day || !hour || !minute || !second || !tz) {
      return { value: new Date().toISOString(), warning: 'NZ timezone parts unavailable; used UTC' };
    }

    const match = tz.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) {
      return { value: new Date().toISOString(), warning: `Unexpected NZ offset format (${tz}); used UTC` };
    }

    const sign = match[1];
    const hours = match[2].padStart(2, '0');
    const minutes = (match[3] || '00').padStart(2, '0');

    const offset = `${sign}${hours}:${minutes}`;
    return { value: `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`, warning: null };
  } catch {
    return { value: new Date().toISOString(), warning: 'NZ timezone formatting unsupported; used UTC' };
  }
}

app.post('/api/medtech/session/commit', async (req, res) => {
  const startTime = Date.now();

  const body = req.body || {};
  const encounterId = body.encounterId;
  const patientId = body.patientId;
  const facilityId = typeof body.facilityId === 'string' && body.facilityId.trim()
    ? body.facilityId.trim()
    : null;
  const files = body.files;
  const correlationId = typeof body.correlationId === 'string' && body.correlationId.trim()
    ? body.correlationId.trim()
    : randomUUID();

  if (!encounterId || typeof encounterId !== 'string') {
    return res.status(400).json({ error: 'encounterId is required' });
  }
  if (!patientId || typeof patientId !== 'string') {
    return res.status(400).json({ error: 'patientId is required' });
  }
  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'files array is required' });
  }

  const results = [];

  for (const file of files) {
    const clientRef = file?.clientRef;

    try {
      const warnings = [];

      if (!clientRef || typeof clientRef !== 'string') {
        throw new Error('clientRef is required');
      }

      const source = file?.source || {};
      const sourceBase64Data = source.base64Data;
      const sourceDownloadUrl = source.downloadUrl;

      let base64 = null;
      let contentType = null;
      let sizeBytes = null;
      let sniffedContentType = null;

      if (typeof sourceBase64Data === 'string' && sourceBase64Data.length > 0) {
        base64 = stripDataUrlPrefix(sourceBase64Data);
        const bytes = base64ToBytes(base64);
        if (!bytes) {
          throw new Error('invalid base64Data');
        }
        sizeBytes = bytes.length;
        if (sizeBytes > MAX_IMAGE_BYTES) {
          throw new Error(`image too large: ${sizeBytes} bytes (max ${MAX_IMAGE_BYTES})`);
        }
        sniffedContentType = sniffAttachmentContentType(bytes);
        contentType = typeof file?.contentType === 'string' ? file.contentType : null;
      } else if (typeof sourceDownloadUrl === 'string' && sourceDownloadUrl.length > 0) {
        const downloaded = await downloadUrlToBase64(sourceDownloadUrl);
        base64 = downloaded.base64;
        contentType = downloaded.contentType || (typeof file?.contentType === 'string' ? file.contentType : null);
        sizeBytes = downloaded.sizeBytes;
        sniffedContentType = sniffAttachmentContentType(downloaded.bytes);
      } else {
        throw new Error('no image data provided (expected source.base64Data or source.downloadUrl)');
      }

      if (sniffedContentType) {
        if (contentType && contentType !== sniffedContentType) {
          warnings.push(`contentType mismatch; overridden ${contentType} -> ${sniffedContentType}`);
        }
        contentType = sniffedContentType;
      }

      // Legacy DOM compatible path: Inbox Scan supports TIFF images and PDF documents only.
      const allowedTypes = new Set(['image/tiff', 'application/pdf']);
      const effectiveContentType = contentType || 'application/octet-stream';
      if (!allowedTypes.has(effectiveContentType)) {
        throw new Error(
          `Unsupported attachment type for Inbox Scan: ${effectiveContentType}. Supported: image/tiff, application/pdf`,
        );
      }

      const createdDateTime = getNzCreatedDateTimeNow();
      if (createdDateTime.warning) {
 warnings.push(createdDateTime.warning);
}

      const title
        = (typeof file?.title === 'string' && file.title.trim() ? file.title.trim() : null)
          || (typeof file?.meta?.label === 'string' && file.meta.label.trim() ? file.meta.label.trim() : null)
          || undefined;

      const documentReferenceResource = {
        resourceType: 'DocumentReference',
        status: 'current',
        date: createdDateTime.value,
        description: title,
        subject: { reference: `Patient/${patientId}` },
        context: {
          encounter: [{ reference: `Encounter/${encounterId}` }],
        },
        content: [{
          attachment: {
            contentType: effectiveContentType,
            data: base64,
            ...(title ? { title } : {}),
          },
        }],
      };

      // eslint-disable-next-line no-console
      console.log('[Medtech Commit] Creating DocumentReference (Inbox Scan)', {
        encounterId,
        patientId,
        facilityId: facilityId || process.env.MEDTECH_FACILITY_ID,
        clientRef,
        sizeBytes,
        contentType: effectiveContentType,
        correlationId,
      });

      const createdResource = await alexApiClient.post(
        '/DocumentReference',
        documentReferenceResource,
        { correlationId, facilityId },
      );
      const documentReferenceId = createdResource?.id;

      if (!documentReferenceId) {
        throw new Error('ALEX did not return DocumentReference.id');
      }

      results.push({
        clientRef,
        status: 'committed',
        documentReferenceId,
        warnings,
      });
    } catch (error) {
      results.push({
        clientRef: typeof clientRef === 'string' ? clientRef : undefined,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to commit file',
      });
    }
  }

  return res.json({
    files: results,
    durationMs: Date.now() - startTime,
    correlationId,
  });
});

// ============================================================================
// Medtech: Media Verification Endpoint (Phase 1D)
// ============================================================================

/**
 * GET /api/medtech/media
 *
 * Purpose: Verify Media created via commit exists in ALEX, independent of Medtech UI.
 *
 * Query:
 * - nhi=<NHI> (required; uses patient.identifier search)
 * - count=<number> (default 10)
 * - _sort=<FHIR sort> (default -created)
 *
 * Notes:
 * - ALEX supports `patient.identifier=<system>|<value>` for Media searches.
 * - We intentionally do not fall back to `patient=<id>` or `subject=Patient/<id>`; those have
 *   returned 403 in UAT even when the token contains the expected roles.
 */
app.get('/api/medtech/media', async (req, res) => {
  const { nhi, count = 10, _sort = '-created' } = req.query;
  const facilityId = coerceFacilityId(req.query.facilityId);
  const forceRefresh = shouldForceRefresh(req.query.forceRefresh);
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    if (forceRefresh) {
      await oauthTokenService.forceRefresh();
    }
    if (typeof nhi !== 'string' || !nhi.trim()) {
      return res.status(400).json({
        success: false,
        error: 'nhi parameter required',
        correlationId,
      });
    }

    const sort = encodeURIComponent(_sort);
    const trimmedNhi = nhi.trim();
    const patientIdentifier = `https://standards.digital.health.nz/ns/nhi-id|${trimmedNhi}`;

    const queryUsed = 'patient.identifier';
    const bundle = await alexApiClient.get(
      `/Media?patient.identifier=${patientIdentifier}&_count=${count}&_sort=${sort}`,
      { correlationId, facilityId },
    );

    // Convenience for UI workflows: try to resolve patientId from NHI (non-fatal if it fails).
    let patientId = null;
    try {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=${patientIdentifier}`,
        { correlationId, facilityId },
      );
      patientId = patientBundle?.entry?.[0]?.resource?.id || null;
    } catch {
      // non-fatal
    }

    res.json({
      success: true,
      duration: Date.now() - startTime,
      correlationId,
      queryUsed,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      media: bundle.entry?.map(e => e.resource) || [],
    });
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      correlationId,
    });
  }
});

// ============================================================================
// FHIR Resource Exploration Endpoints (for feature validation)
// ============================================================================

// Get DocumentReference (consultation notes) for a patient
app.get('/api/medtech/documents', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query;
  const facilityId = coerceFacilityId(req.query.facilityId);
  const forceRefresh = shouldForceRefresh(req.query.forceRefresh);
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    if (forceRefresh) {
      await oauthTokenService.forceRefresh();
    }
    let patientId = patient;

    // If NHI provided, first look up patient ID
    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
        { correlationId, facilityId },
      );
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id;
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found', correlationId });
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required', correlationId });
    }

    const bundle = await alexApiClient.get(
      `/DocumentReference?patient=${patientId}&_count=${count}&_sort=-date`,
      { correlationId, facilityId },
    );

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      documents: bundle.entry?.map(e => e.resource) || [],
    });
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      correlationId,
    });
  }
});

// Get DiagnosticReport (lab results) for a patient
app.get('/api/medtech/labs', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query;
  const facilityId = coerceFacilityId(req.query.facilityId);
  const forceRefresh = shouldForceRefresh(req.query.forceRefresh);
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    if (forceRefresh) {
      await oauthTokenService.forceRefresh();
    }
    let patientId = patient;

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
        { correlationId, facilityId },
      );
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id;
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found', correlationId });
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required', correlationId });
    }

    const bundle = await alexApiClient.get(
      `/DiagnosticReport?patient=${patientId}&_count=${count}&_sort=-date`,
      { correlationId, facilityId },
    );

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      reports: bundle.entry?.map(e => e.resource) || [],
    });
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      correlationId,
    });
  }
});

// Get MedicationRequest (prescriptions) for a patient
app.get('/api/medtech/prescriptions', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query;
  const facilityId = coerceFacilityId(req.query.facilityId);
  const forceRefresh = shouldForceRefresh(req.query.forceRefresh);
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    if (forceRefresh) {
      await oauthTokenService.forceRefresh();
    }
    let patientId = patient;

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
        { correlationId, facilityId },
      );
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id;
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found', correlationId });
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required', correlationId });
    }

    const bundle = await alexApiClient.get(
      `/MedicationRequest?patient=${patientId}&_count=${count}&_sort=-date`,
      { correlationId, facilityId },
    );

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      prescriptions: bundle.entry?.map(e => e.resource) || [],
    });
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      correlationId,
    });
  }
});

// Get Communication (referrals/messages) for a patient
app.get('/api/medtech/communications', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query;
  const facilityId = coerceFacilityId(req.query.facilityId);
  const forceRefresh = shouldForceRefresh(req.query.forceRefresh);
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    if (forceRefresh) {
      await oauthTokenService.forceRefresh();
    }
    let patientId = patient;

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
        { correlationId, facilityId },
      );
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id;
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found', correlationId });
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required', correlationId });
    }

    const bundle = await alexApiClient.get(
      `/Communication?patient=${patientId}&_count=${count}&_sort=-sent`,
      { correlationId, facilityId },
    );

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      communications: bundle.entry?.map(e => e.resource) || [],
    });
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      correlationId,
    });
  }
});

// Get Task resources for a patient
app.get('/api/medtech/tasks', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query;
  const facilityId = coerceFacilityId(req.query.facilityId);
  const forceRefresh = shouldForceRefresh(req.query.forceRefresh);
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    if (forceRefresh) {
      await oauthTokenService.forceRefresh();
    }
    let patientId = patient;

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
        { correlationId, facilityId },
      );
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id;
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found', correlationId });
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required', correlationId });
    }

    const bundle = await alexApiClient.get(
      `/Task?patient=${patientId}&_count=${count}`,
      { correlationId, facilityId },
    );

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      tasks: bundle.entry?.map(e => e.resource) || [],
    });
  } catch (error) {
    res.status(error?.statusCode || 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
      correlationId,
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`ClinicPro BFF listening on ${port}`);
  // eslint-disable-next-line no-console
  console.log('Medtech integration: enabled');
});
