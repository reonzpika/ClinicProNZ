# Perplexity Research Prompt: Medtech Evolution Widget Integration

**Purpose**: Research how to integrate a clinical images widget with Medtech Evolution, specifically focusing on patient change detection and widget lifecycle management.

**Date**: 2025-12-09  
**Context**: Building a clinical images widget that needs to detect when GPs change patients in Medtech Evolution and close the widget (with warning if uncommitted data exists).

---

## Primary Research Question

**How does Medtech Evolution communicate with embedded widgets/applications when a patient changes?**

We need to know:
1. What lifecycle events/hooks are available for embedded widgets?
2. Does Medtech Evolution use PostMessage API, custom events, or other mechanisms?
3. Is there documentation for third-party widget integration?
4. What's the standard pattern other integrations (like referral apps) use?

---

## Perplexity Prompt

```
I need to research Medtech Evolution's widget/application integration capabilities, 
specifically for a clinical images capture widget. Please search the Medtech 
documentation and any available integration guides for the following:

**1. Patient Change Detection**
Search for:
- "Medtech Evolution widget API"
- "Medtech Evolution patient change event"
- "Medtech Evolution PostMessage"
- "Medtech Evolution application integration"
- "Medtech Evolution embedded application lifecycle"
- "Medtech Evolution ALEX widget integration"

Questions:
- When a GP changes patients in Medtech Evolution, how are embedded 
  applications/widgets notified?
- Does Medtech Evolution send PostMessage events to iframes or child windows?
- Are there JavaScript events fired when patient context changes?
- Is there a polling mechanism to detect patient changes?
- What's the recommended pattern for third-party integrations?

**2. Widget Embedding Method**
Search for:
- "Medtech Evolution custom applications"
- "Medtech Evolution widget placement"
- "Medtech Evolution iFrame integration"
- "Medtech Evolution application launcher"

Questions:
- How are third-party widgets embedded? (iFrame, new window, new tab?)
- Where can widgets be placed? (left pane, ribbon, dashboard, context menu?)
- How is patient context passed to widgets? (URL parameters, PostMessage, JWT?)
- Are there configuration files or API endpoints to register widgets?

**3. Encounter Context Passing**
Search for:
- "Medtech Evolution patient context"
- "Medtech Evolution encounter ID"
- "Medtech Evolution launch context"

Questions:
- How are patient ID and encounter ID passed to external applications?
- What format is used? (Query parameters, JWT claims, PostMessage data?)
- What fields are typically available?
  - Patient ID / NHI
  - Patient name
  - Encounter ID
  - Facility ID
  - Provider ID
- Example URL patterns or integration examples?

**4. Widget Lifecycle Management**
Search for:
- "Medtech Evolution widget close"
- "Medtech Evolution application exit"
- "Medtech Evolution session management"

Questions:
- Can widgets detect when Medtech Evolution is closing?
- Are there cleanup hooks or events?
- How do widgets handle unsaved data warnings?
- Example: How does the referral app show "unsaved changes" warnings?

**5. Similar Integrations (Examples)**
Search for:
- "Medtech Evolution referral app integration"
- "Medtech Evolution third-party applications"
- "Medtech Evolution partner integrations"

Questions:
- Are there publicly documented examples of integrated applications?
- What patterns do other vendors use?
- Are there case studies or integration guides?

**6. ALEX API Widget Integration**
Search for:
- "ALEX API widget"
- "ALEX API application integration"
- "Medtech ALEX embedded application"

Questions:
- Does ALEX API documentation include widget integration patterns?
- Are there specific endpoints or events for widget lifecycle?
- How do ALEX-powered widgets communicate with Medtech Evolution?

**Response Format:**

For each section above, provide:
1. **Direct quotes** from official documentation (with source URLs)
2. **Explicit "NOT FOUND"** if no documentation exists
3. **Inferred patterns** from forum posts, support articles, or developer discussions
4. **Similar product comparisons** if Medtech-specific info is unavailable
5. **Your recommendation** based on findings

**Additional Context:**

Our use case:
- Clinical images widget launched from within Medtech Evolution
- GP captures images for current patient
- If GP changes patient without committing images, we need to:
  a) Detect the patient change
  b) Show warning: "You have X uncommitted images for [Patient Name]. Close anyway?"
  c) Close widget if confirmed (or keep open if cancelled)

We've observed that Medtech Evolution's referral app shows similar warnings when 
switching patients with unsaved data, so this pattern must be possible.

**Priority:**
1. Patient change detection mechanism (HIGH)
2. Widget embedding method (HIGH)
3. Context passing format (MEDIUM)
4. Lifecycle hooks (MEDIUM)
5. Example integrations (LOW - helpful but not blocking)
```

---

## Expected Outcomes

After Perplexity research, we should have:

1. ✅ **Clear answer** on how to detect patient changes
2. ✅ **Code examples** or API patterns to implement
3. ✅ **Standard integration approach** to follow

OR

1. ❌ **No documentation found** → Need to contact Medtech support directly
2. ⚠️ **Partial information** → Fill gaps with educated guesses + testing

---

## Follow-Up Actions Based on Results

### If PostMessage API Found:
```typescript
// Implementation approach
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://medtech-evolution-origin.com') return;
  
  if (event.data?.type === 'PATIENT_CHANGED') {
    const newPatientId = event.data.patientId;
    handlePatientChange(newPatientId);
  }
});
```

### If Polling Required:
```typescript
// Implementation approach
useEffect(() => {
  const interval = setInterval(async () => {
    const currentPatient = await fetchCurrentPatient();
    if (currentPatient.id !== initialPatientId) {
      handlePatientChange(currentPatient.id);
    }
  }, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
}, []);
```

### If No Mechanism Found:
- **Option A**: Contact Medtech support for guidance
- **Option B**: Implement session-based approach (1 hour expiry, warn on close)
- **Option C**: Rely on browser beforeunload warning only

---

## Alternative Research Sources

If Perplexity doesn't find sufficient information:

1. **Medtech Support Portal**:
   - Login to Medtech support site
   - Search knowledge base: "widget integration", "third-party applications"

2. **ALEX API Documentation**:
   - https://alexapidoc.medtechglobal.com/
   - Check "Getting Started" or "Integration Guides" sections

3. **Medtech Developer Community**:
   - Look for developer forums or Slack channels
   - Ask other vendors/integrators

4. **Direct Contact**:
   - Email: support@medtechglobal.com
   - Subject: "Clinical Images Widget Integration - Patient Change Detection"
   - Attach: Use case description + technical requirements

---

## Success Criteria

Research is complete when we can answer:

- [ ] **How** to detect patient changes (PostMessage, polling, events, etc.)
- [ ] **What data format** is used (event payload structure)
- [ ] **How often** to check (if polling)
- [ ] **What origin** to trust (if PostMessage)
- [ ] **Example code** or reference implementation

---

## Notes

- Medtech Evolution user guide may have section on "Custom Applications" or "Extensions"
- ALEX API changelog might mention widget integration features
- Medtech Evolution v8+ likely has better integration APIs than older versions
- Other vendors (e.g., Best Practice, Heidi) may have similar patterns we can learn from

---

**Next Steps After Research**:
1. Review Perplexity findings
2. Document patient change detection implementation
3. Update desktop-ui-spec.md with concrete code
4. Test in Medtech Evolution environment (if available)

---

**End of Perplexity Research Prompt**
