# Testing Mobile Recording System V2

## **🧪 How to Test the New System**

### **Step 1: Enable Feature Flags**

In your browser's console (on the consultation page):
```javascript
// Enable Mobile V2 system
localStorage.setItem('feature-MOBILE_RECORDING_V2', 'true');

// Enable Patient Sessions
localStorage.setItem('feature-PATIENT_SESSIONS', 'true');

// Refresh page to see changes
window.location.reload();
```

### **Step 2: Test WebSocket Server**

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Initialize WebSocket Server:**
   - Visit: `http://localhost:3000/api/ws/mobile`
   - Should see: `{"success":true,"wsUrl":"ws://localhost:8080/ws/mobile","message":"WebSocket server is running"}`

### **Step 3: Test Desktop Experience**

1. **Visit Consultation Page:** `http://localhost:3000/consultation`

2. **You Should See:**
   - "Patient Sessions" card with Beta label (if patient sessions enabled)
   - Updated mobile recording options

3. **Create Patient Session:**
   - Click "Start New Patient Session"
   - Enter a patient name (e.g., "John Doe")
   - Click "Create Session"

4. **Generate Mobile QR:**
   - Look for "Mobile Recording V2" option
   - Click "Generate QR Code"
   - Should see 24-hour token (not 5-hour)

### **Step 4: Test Mobile Experience**

1. **Scan QR Code or Manual URL:**
   - Copy the generated URL from QR code
   - Open in mobile browser or new tab
   - URL format: `http://localhost:3000/mobile?token=xxx`

2. **Mobile Page Should Show:**
   - Connection status indicator
   - Current patient name
   - Recording controls
   - Device connection stats

3. **Test Connection:**
   - Mobile should show "Connected" status
   - Desktop should show device connected

### **Step 5: Test Real-Time Features**

1. **Patient Switching:**
   - Create a second patient session on desktop
   - Switch between patients
   - Mobile should instantly update to show current patient

2. **Recording (Simulated):**
   - Start recording on mobile
   - Should see volume indicators
   - Recording timer should work

## **🐛 Troubleshooting**

### **WebSocket Connection Issues:**
- Check if port 8080 is available
- Verify firewall settings
- Check browser console for WebSocket errors

### **Token Generation Issues:**
- Ensure you're signed in
- Check network tab for API call failures
- Verify database connection

### **Feature Flags Not Working:**
- Clear localStorage and try again
- Check browser console for errors
- Ensure you refreshed after setting flags

### **Mobile Page Not Loading:**
- Verify token is in URL
- Check if token is expired
- Look for JavaScript errors in mobile browser

## **📊 What to Look For**

### **Success Indicators:**
- ✅ WebSocket server starts on port 8080
- ✅ QR code generates with 24-hour token
- ✅ Mobile page loads and connects
- ✅ Real-time patient switching works
- ✅ Device connection status updates
- ✅ Patient sessions create and persist

### **Expected Behavior:**
1. **Desktop generates QR** → Mobile scans → **Instant connection**
2. **Desktop creates patient** → Mobile instantly shows patient name
3. **Desktop switches patient** → Mobile updates in real-time
4. **Mobile records** → Transcription appears on desktop immediately

## **🔄 Switching Back to Old System**

If you need to revert to the old system:
```javascript
// Disable new features
localStorage.setItem('feature-MOBILE_RECORDING_V2', 'false');
localStorage.setItem('feature-PATIENT_SESSIONS', 'false');

// Refresh page
window.location.reload();
```

## **📝 Testing Checklist**

- [ ] WebSocket server starts successfully
- [ ] QR code generation works
- [ ] Mobile page loads with token
- [ ] WebSocket connection establishes
- [ ] Patient session creation works
- [ ] Patient switching syncs in real-time
- [ ] Device connection status updates
- [ ] Recording controls function
- [ ] Multiple devices can connect
- [ ] Graceful error handling for expired tokens
- [ ] Feature flags work correctly

**The new system runs alongside the old system, so your existing functionality remains intact while testing!**
