# Delete All Sessions Feature Implementation

## Overview
Added a "Delete All Sessions" button to the patient management modal with confirmation step as requested.

## Implementation Details

### 1. Backend API Changes (`app/api/patient-sessions/route.ts`)
- Enhanced the DELETE endpoint to support deleting all sessions for a user
- Added `deleteAll` parameter to distinguish between single session and bulk delete operations
- When `deleteAll: true` is provided, all sessions for the authenticated user are deleted
- Returns count of deleted sessions for user feedback

### 2. Context Layer (`src/shared/ConsultationContext.tsx`)
- Added `deleteAllPatientSessions` function to the ConsultationContext interface
- Implemented the function to call the API with `deleteAll: true` parameter
- Function clears all session-related state when successful:
  - `patientSessions` array
  - `currentPatientSessionId`
  - `transcription` data
  - `generatedNotes`
  - `typedInput`
  - `consultationNotes`
  - `consultationItems`

### 3. UI Components (`src/features/consultation/components/SessionModal.tsx`)
- Added "Delete All Sessions" button to the modal header alongside search and "Create New" buttons
- Button only appears when there are existing sessions (`patientSessions.length > 0`)
- Implemented two-step confirmation process:
  1. First click shows confirmation message and changes button to "Confirm Delete All"
  2. Second click executes the deletion
- Added loading state during deletion ("Deleting..." text)
- Styled with red colors to indicate destructive action
- Added confirmation message showing exact number of sessions to be deleted

### 4. User Experience Features
- **Confirmation Dialog**: Shows number of sessions and warning about irreversible action
- **Cancel Option**: Users can cancel the operation before confirmation
- **Visual Feedback**: Button changes appearance during confirmation and loading states
- **Accessibility**: Clear labeling and visual indicators for destructive actions
- **State Management**: Modal remains open after deletion to show empty state

### 5. Security & Safety
- User authentication required (handled by existing API auth)
- Only deletes sessions belonging to the authenticated user
- Two-step confirmation prevents accidental deletion
- Clear warning message about irreversible action
- Error handling with console logging for debugging

## User Flow
1. User opens patient management modal
2. If sessions exist, "Delete All" button appears next to "Create New"
3. User clicks "Delete All" - button changes to "Confirm Delete All"
4. Confirmation message appears showing session count and warning
5. User can:
   - Click "Cancel" to abort
   - Click "Confirm Delete All" to proceed
6. During deletion, button shows "Deleting..." state
7. After successful deletion, modal shows empty state
8. All session-related data is cleared from application state

## Technical Notes
- Maintains backward compatibility with existing single session deletion
- Uses same API endpoint with different parameters
- Optimistic UI updates for immediate feedback
- Proper error handling and recovery
- TypeScript type safety maintained throughout
- Follows existing codebase patterns and conventions

## Files Modified
- `app/api/patient-sessions/route.ts` - Enhanced DELETE endpoint
- `src/shared/ConsultationContext.tsx` - Added deleteAllPatientSessions function
- `src/features/consultation/components/SessionModal.tsx` - Added UI and confirmation logic