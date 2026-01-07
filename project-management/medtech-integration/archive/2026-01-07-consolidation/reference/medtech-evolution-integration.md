# Medtech Evolution Integration Patterns

**Last Updated**: 2025-12-09  
**Source**: Perplexity research of public Medtech documentation  
**Status**: Findings documented, implementation approach defined

---

## Executive Summary

**Key Finding**: Medtech Evolution does NOT provide a formal widget API, JavaScript events, or PostMessage-based embedding model for third-party web applications.

**Integration Pattern**: Apps are launched via "ALEX Apps" toolbar as **independent web applications** with patient context passed at launch. Apps are responsible for their own lifecycle management using standard browser events.

---

## 1. Patient Change Detection

### Research Findings

**What We Looked For**:
- PostMessage events when GP changes patients
- JavaScript events fired on patient change
- Polling API to detect patient changes
- Recommended patterns for third-party integrations

**Result**: ❌ **NOT FOUND** in public documentation

**Direct Quotes**:
> "There is currently no publicly available Medtech Evolution developer documentation that describes a formal 'widget API', JavaScript events, or postMessage-based embedding model for third-party web apps."

> "No evidence is visible that Evolution continues to push later context changes to the external app; patterns resemble 'launch in current context, then app is independent' rather than a reactive widget API."

### Inferred Patterns

1. **Launch-in-context model**: ALEX Apps buttons/toolbar entries open external apps "in context" for currently selected patient
2. **Patient ID passed at launch**: Apps receive patient identifier (or token) when launched
3. **No reactive updates**: Evolution does not notify apps of subsequent patient changes
4. **Independent operation**: After launch, app operates independently using ALEX FHIR APIs

### Similar Products Comparison

Other PMS/EHRs (EMIS, Epic, Cerner SMART-on-FHIR):
- Pass patient/encounter in launch parameters or JWT
- Do NOT guarantee event notifications when user navigates away
- Some systems (SMART-on-FHIR) have rich embedded containers with context change events, but this is not standard

### Implementation Recommendation

**Accept**: No reliable real-time notification of patient changes

**Strategy**: Defensive detection using:

1. **Session-per-patient approach**:
   - Each launch = new session for specific patient
   - Session ID encodes patient + encounter context
   - If user launches for different patient = new session

2. **Browser beforeunload warning**:
   ```typescript
   window.addEventListener('beforeunload', (e) => {
     if (uncommittedImages.length > 0) {
       e.preventDefault();
       e.returnValue = '';
       return '';
     }
   });
   ```

3. **Re-launch detection**:
   - Store uncommitted images in backend/localStorage keyed by patient
   - On new launch, check for uncommitted images from previous patient
   - Show warning: "You have X uncommitted images for [Previous Patient]"

4. **Session expiry** (1 hour):
   - Natural timeout prevents indefinite sessions
   - Warns user before expiry if uncommitted images exist

**What We're NOT doing**:
- ❌ Polling ALEX API for "current patient" (no such endpoint)
- ❌ Listening for PostMessage events (doesn't exist)
- ❌ Detecting parent window navigation (not reliable cross-origin)

---

## 2. Widget Embedding Method

### Research Findings

**What We Looked For**:
- iFrame vs new window vs new tab
- Widget placement options (left pane, ribbon, dashboard)
- Configuration files or API endpoints to register widgets

**Result**: ⚠️ **PARTIALLY FOUND** - Launch mechanism described, embedding details missing

**Direct Quotes**:

> "DermEngine integration: users 'select ALEX Apps and then choose' DermEngine from Medtech Evolution, indicating launch from the toolbar through the ALEX Apps menu."

> "Hauora Plan training shows launching a plan by clicking a specific toolbar icon 'From ALEX Apps in Medtech Evolution.'"

> "IntelliTek AI scribe marketing describes it as 'integrated into Medtech Evolution through the Alex Apps Launch in Context.'"

### Confirmed Pattern

**ALEX Apps Toolbar Launch**:
- Apps appear as menu items in "ALEX Apps" toolbar
- User clicks app name → Launches app URL
- Patient context passed at launch

**Unknown Details**:
- Whether app opens in iFrame, separate window, or new tab
- How to configure app placement
- Whether placement is customizable per practice

### Similar Integrations

Examples following same pattern:
- **DermEngine**: ALEX Apps tab, launched from toolbar
- **Hauora Plan**: Toolbar icon, launched from ALEX Apps
- **IntelliTek AI scribe**: "Launch in Context" from ALEX Apps
- **Manage My Health**: Forms integration

### Implementation Recommendation

**Design as**: Web application launched by URL from ALEX Apps toolbar

**NOT**: Tight in-canvas widget expecting DOM events

**Expect**:
- Launch URL format: `https://app.clinicpro.co.nz/medtech-images?token=xxx` or similar
- Context passed via query parameters and/or signed token
- Evolution acts as **launcher**, not JavaScript host

**To Determine Placement**:
- Contact Medtech partner support
- Request documentation for ALEX Apps configuration
- Ask how to register app in ALEX Apps menu

---

## 3. Encounter Context Passing

### Research Findings

**What We Looked For**:
- How patient ID and encounter ID are passed to external apps
- Format used (query params, JWT, PostMessage)
- Fields typically available (patient ID, NHI, DOB, encounter, facility, provider)
- Example URL patterns

**Result**: ❌ **NOT FOUND** in public documentation

**Direct Quotes**:

> "Public docs, however, do not show the exact launch URL format for ALEX Apps from Evolution or the exact set of fields passed at launch (e.g., NHI, encounter ID)."

> "'How are patient ID and encounter ID passed to external applications?' – NOT FOUND in public docs."

### Inferred Patterns

**Likely approach** (based on Azure AD + FHIR architecture):

1. Evolution launches app with URL like:
   ```
   https://app.example.com/launch?
     token=<one-time-launch-token>
     &patient=<patient-ehr-key-or-nhi>
     &facility=<facility-id>
     &provider=<provider-id>
   ```

2. App exchanges token for OAuth access:
   - Validates launch token with backend
   - Obtains ALEX API access token
   - Retrieves patient/encounter details via FHIR

3. App uses ALEX FHIR API to enrich context:
   - GET `/Patient?identifier=...` (by NHI)
   - GET `/Encounter?patient=...` (if encounter ID provided)
   - GET `/Location` (facility details)
   - GET `/Practitioner` (provider details)

### Expected Fields

**Minimal launch context**:
- Patient identifier (EHR key or NHI)
- Facility ID
- Launch token (one-time use, short-lived)

**Desirable additional fields**:
- Provider ID
- Encounter ID (if in active encounter)
- Patient name (for immediate display)
- Correlation ID (for audit logging)

### Implementation Recommendation

**Plan for**:
- Launch URL with token + patient key
- Backend endpoint to validate launch token
- FHIR API calls to retrieve full context
- Session storage of context (keyed by sessionId)

**Explicitly request from Medtech** (via partner support):
- Launch URL format specification
- List of fields passed at launch
- Token validation mechanism
- Example integration documentation

---

## 4. Widget Lifecycle Management

### Research Findings

**What We Looked For**:
- Cleanup hooks when Medtech Evolution closes
- Events when user navigates away
- "Unsaved changes" callback mechanism
- Widget close notification

**Result**: ❌ **NOT FOUND** in public documentation

**Direct Quotes**:

> "ALEX FHIR documentation and HealthLink integration guides detail API lifecycle (tokens, headers) and message transfer, not UI lifecycle events or 'widget close' hooks."

> "Evolution's own referral and form modules can warn on unsaved changes when switching patients; this is likely implemented inside the PMS UI or tightly coupled embedded forms, using internal APIs that are not available to generic external web apps."

### Inferred Patterns

**Internal vs External Apps**:
- **Internal forms** (referrals, MMH): Can show unsaved warnings because they're part of Evolution codebase
- **External apps** (ALEX Apps): Treated as independent web apps, no special lifecycle hooks

**Standard browser behavior applies**:
- App can use `beforeunload` event
- App cannot detect parent window navigation (if in iFrame)
- App cannot prevent Evolution from closing

### Implementation Recommendation

**Use standard browser events only**:

```typescript
// Warn when closing tab/window with uncommitted images
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (uncommittedImages.length > 0) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [uncommittedImages.length]);
```

**Session-based recovery**:
1. Persist uncommitted images to backend (keyed by patient + session)
2. On next launch for same patient, check for uncommitted images
3. Show recovery option: "You have 3 uncommitted images from previous session. Continue?"

**Patient-change detection**:
1. On new launch with different patient, check for uncommitted images from previous patient
2. Show warning: "You have X uncommitted images for [Previous Patient]. Commit now or discard?"
3. Allow user to commit previous images before proceeding

**Ask Medtech support**: "Is there any supported 'unsaved changes' callback for ALEX Apps?"

---

## 5. Similar Integrations (Examples)

### Documented Integrations

**DermEngine**:
- Launch: ALEX Apps tab in toolbar
- Pattern: Launch-in-context for selected patient
- Use case: Dermatology imaging and AI analysis

**Hauora Plan**:
- Launch: Toolbar icon "From ALEX Apps in Medtech Evolution"
- Pattern: Launch-in-context
- Use case: Care planning

**IntelliTek AI Clinical Virtual Assistant**:
- Launch: "Integrated into Medtech Evolution through the Alex Apps Launch in Context"
- Pattern: Launch-in-context
- Use case: AI scribing

**Manage My Health (MMH)**:
- Integration: Forms that "integrate flawlessly with Medtech32 and Medtech Evolution"
- Pattern: Send referrals from PMS
- Note: May use tighter integration as it's Medtech-affiliated

### Common Pattern Across All

1. **Toolbar/menu entry** in ALEX Apps
2. **Launch of external web application** with:
   - Patient context available
   - Authentication against ALEX for data read/write
   - App responsible for own state and UX
3. **No generic Evolution widget framework** with formal lifecycle events

### Recommended Pattern to Follow

**Emulate DermEngine / Hauora Plan approach**:

1. Single-click launch from ALEX Apps with known patient
2. App uses ALEX FHIR to read/write clinical content:
   - POST Media resources for images
   - Link to encounter via subject reference
   - Store metadata in FHIR-compliant fields
3. Confirmations about unsaved work handled entirely inside app UI
4. Session management and recovery handled by app backend

---

## 6. ALEX API and Widget Integration

### Research Findings

**What We Looked For**:
- Widget-specific ALEX endpoints
- Lifecycle events in ALEX API
- PostMessage or UI hooks
- Embedded app integration patterns

**Result**: ❌ **NOT FOUND** - ALEX is data/API layer only, not UI container

**Direct Quotes**:

> "ALEX docs define authentication, endpoints for Patient, DocumentReference, Media, Communication, Task, etc., and custom headers such as mt-facilityid and mt-appid. These docs do not mention 'widget,' 'postMessage,' 'embedded app lifecycle,' or UI hooks."

> "ALEX is a data/API layer, not a UI container: It authenticates vendor apps and exposes FHIR resources. Evolution acts as the client that happens to launch your web app via 'ALEX Apps,' but ALEX itself does not manage your browser window or lifecycle."

### Role of ALEX

**ALEX provides**:
- OAuth 2.0 authentication (Azure AD)
- FHIR R4 API endpoints (Patient, Media, DocumentReference, etc.)
- Data read/write for clinical content
- Headers for facility, app identification

**ALEX does NOT provide**:
- UI embedding framework
- Widget lifecycle management
- Real-time context change events
- Browser window/iFrame management

**Evolution's role**:
- Launches app URL (via ALEX Apps menu)
- Provides initial patient context (likely in launch URL)
- **Does not** manage app lifecycle beyond initial launch

### Implementation Recommendation

**Use ALEX FHIR for**:
1. **Retrieve context**:
   - GET `/Patient?identifier=<nhi>` (patient demographics)
   - GET `/Encounter?patient=<id>` (encounter metadata)
   - GET `/Location` (facility details)
   - GET `/Practitioner` (provider details)

2. **Store images**:
   - POST `/Media` (FHIR Media resource with base64 image)
   - Include: subject (patient), encounter, bodySite, laterality, content
   - Link to encounter via encounter reference

3. **Additional features** (optional):
   - POST `/Communication` (inbox messages)
   - POST `/Task` (create tasks for staff)
   - GET `/Binary` (retrieve existing attachments)

**Use Evolution's ALEX Apps integration as**:
- Launch point only
- Source of initial context
- **NOT** as real-time event stream

**Architect as**:
- Standard web application
- Secure OAuth client integration to ALEX
- Backend manages sessions and temporary storage
- Frontend handles capture, compression, metadata entry

---

## Concrete Implementation Design

Based on all findings above, here's the recommended architecture:

### Launch Flow

```
1. GP opens Medtech Evolution
2. GP selects patient (Patient A)
3. GP clicks "ClinicPro Images" in ALEX Apps toolbar
4. Evolution launches:
   https://app.clinicpro.co.nz/medtech-images?
     token=<launch-token>
     &patient=<patient-key>
     &facility=<facility-id>
     &provider=<provider-id>

5. Our app:
   a. Validates launch token with our backend
   b. Backend exchanges token for session
   c. Backend uses ALEX FHIR to fetch patient details
   d. Backend creates session in Redis (1 hour TTL)
   e. Frontend loads with patient context
```

### Session Management

```typescript
interface Session {
  sessionId: string;
  patientId: string;
  patientName: string;
  patientNHI: string;
  encounterId?: string;
  facilityId: string;
  providerId?: string;
  createdAt: Date;
  expiresAt: Date; // 1 hour from creation
  images: SessionImage[]; // Uncommitted images
}
```

**Session lifecycle**:
- Created on launch
- Expires after 1 hour from last activity
- Extended on each mobile upload or desktop action
- Cleaned up after commit or expiry

### Unsaved Images Warning

**Scenario 1: GP closes browser tab**
```typescript
// Standard beforeunload warning
window.addEventListener('beforeunload', (e) => {
  if (uncommittedImages.length > 0) {
    e.preventDefault();
    e.returnValue = ''; // Browser shows generic warning
    return '';
  }
});
```

**Scenario 2: GP launches for different patient**
```typescript
// On app load
async function checkForUncommittedImages(currentPatientId: string) {
  // Query backend for uncommitted sessions
  const uncommittedSessions = await fetch('/api/sessions/uncommitted');
  
  const previousSession = uncommittedSessions.find(
    s => s.patientId !== currentPatientId && s.images.length > 0
  );
  
  if (previousSession) {
    // Show modal
    showWarningModal({
      message: `You have ${previousSession.images.length} uncommitted ` +
               `images for ${previousSession.patientName}.`,
      actions: [
        { label: 'Commit Now', action: () => commitPreviousSession(previousSession) },
        { label: 'Discard', action: () => discardSession(previousSession) },
        { label: 'Review Later', action: () => {} }
      ]
    });
  }
}
```

**Scenario 3: Session expires with uncommitted images**
```typescript
// Backend cleanup job (runs every 5 minutes)
async function cleanupExpiredSessions() {
  const expiredSessions = await findExpiredSessions();
  
  for (const session of expiredSessions) {
    if (session.images.length > 0) {
      // Grace period: Keep images for 30 more minutes
      if (!session.graceExtended) {
        await extendSessionGracePeriod(session.id, 30);
        session.graceExtended = true;
      } else {
        // Grace period used, delete everything
        await deleteSessionImages(session.id);
        await deleteSession(session.id);
      }
    } else {
      // No images, safe to delete
      await deleteSession(session.id);
    }
  }
}
```

### Patient Change Detection (Summary)

**What we DO**:
- ✅ Warn on browser close if uncommitted images (beforeunload)
- ✅ Check for previous patient's uncommitted images on launch
- ✅ Session-per-patient approach (1 session = 1 patient)
- ✅ Backend tracks uncommitted sessions by patient
- ✅ Grace period for expired sessions with uncommitted images

**What we DON'T do**:
- ❌ Real-time detection of patient change in Evolution (doesn't exist)
- ❌ PostMessage listeners (no events fired)
- ❌ Polling ALEX API for "current patient" (no such endpoint)
- ❌ Preventing Evolution from switching patients (not possible)

---

## Next Steps

### 1. Contact Medtech Partner Support

**Questions to ask**:
1. What is the launch URL format for ALEX Apps?
2. What fields are passed at launch (patient ID, NHI, encounter, facility, provider)?
3. Is launch token validated? If so, how?
4. How do we register our app in the ALEX Apps menu?
5. Does the app open in iFrame, new window, or new tab?
6. Is there any lifecycle event or callback for unsaved changes?
7. Can you provide example integration documentation?

**Contact**: support@medtechglobal.com or partner portal

### 2. Request ALEX Apps Configuration

**What we need**:
- App registration form/process
- Configuration file format (if any)
- Logo and display name requirements
- Placement options (toolbar, menu, context)
- Testing environment access

### 3. Build Backend Token Validation

**Endpoint**: `POST /api/medtech/launch/validate`

**Flow**:
```
1. Frontend receives launch URL with token
2. Frontend sends token to our backend
3. Backend validates token (mechanism TBD - ask Medtech)
4. Backend creates session in Redis
5. Backend fetches patient details from ALEX FHIR
6. Backend returns session ID to frontend
7. Frontend stores session ID, loads patient context
```

### 4. Update UI Specs

**Changes needed**:
- Remove PostMessage listener code examples
- Add launch token validation flow
- Add session recovery on re-launch
- Add uncommitted images check on new launch
- Update patient-change detection to "new launch = new patient"

---

## Open Questions

1. **Launch URL format**: Exact format TBD (ask Medtech)
2. **Token validation**: How to validate launch token? (ask Medtech)
3. **App registration**: Process to register in ALEX Apps menu? (ask Medtech)
4. **Embedding method**: iFrame, window, or tab? (ask Medtech)
5. **Session persistence**: Should session survive page refresh? (Recommend: Yes, 1 hour TTL)
6. **Uncommitted image recovery**: Show recovery UI on every launch, or only if different patient?

---

## References

### Research Sources
- Perplexity AI research (2025-12-09)
- Medtech ALEX API documentation (https://alexapidoc.medtechglobal.com/)
- Partner integration examples (DermEngine, Hauora Plan, IntelliTek)

### Related Docs
- [alex-api.md](./alex-api.md) - ALEX FHIR API reference
- [mobile-ui-spec.md](../features/clinical-images/mobile-ui-spec.md) - Mobile UI specification
- [desktop-ui-spec.md](../features/clinical-images/desktop-ui-spec.md) - Desktop UI specification

---

**Last Updated**: 2025-12-09  
**Status**: Research complete, implementation approach defined, Medtech support contact needed  
**Next Action**: Contact Medtech partner support with questions listed above
