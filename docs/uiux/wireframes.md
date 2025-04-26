# UI Wireframes and Layouts

## Single Page Layout

### Main Layout Structure
```
+------------------------------------------+
|              Header Bar                   |
| [Logo] [Search] [Notifications] [Profile] |
+------------------------------------------+
|                                          |
|              Main Content                 |
|                                          |
+------------------------------------------+
```

### Main Page
```
+------------------------------------------+
|              Header Bar                   |
| [Logo] [Search] [Notifications] [Profile] |
+------------------------------------------+
| Template Selection                       |
| [Default Templates ▼]  [Custom Templates]|
+------------------------------------------+
| Transcription Controls                   |
| [Start/Stop] [Pause]                     |
+------------------------------------------+
| Mini Transcription Monitor              |
| [Compact view of latest transcription]   |
| Status: Recording... Duration: 00:05:30  |
+------------------------------------------+
| Quick Notes                              |
| [Bullet point text area]                 |
| [Auto-saving...]                         |
|                                          |
| • Pt mentioned...                        |
| • Need to check...                       |
| • Remember to...                         |
+------------------------------------------+
| Generated Notes                          |
|                                          |
| SOAP Format:                             |
| Subjective:                              |
| [Editable area]                          |
|                                          |
| Objective:                               |
| [Editable area]                          |
|                                          |
| Assessment:                              |
| [Editable area]                          |
|                                          |
| Plan:                                    |
| [Editable area]                          |
|                                          |
| [Generate Notes] [Copy to Clipboard]      |
+------------------------------------------+
```

## Component Details

### 1. Template Selection
```
+------------------------------------------+
| Select Template:                         |
|                                          |
| Default Templates ▼                      |
| ├─ ✓ Multi-problem SOAP (Default)        |
| ├─ Driver's License Medical              |
| ├─ 6-week Baby Check                     |
| └─ Initial Medical                       |
|                                          |
| My Templates ▼ (When logged in)          |
| ├─ My SOAP Template                      |
| ├─ Mental Health Review                  |
| └─ [+ Create New Template]               |
+------------------------------------------+

Not logged in view:
+------------------------------------------+
| Select Template:                         |
|                                          |
| Default Templates ▼                      |
| ├─ ✓ Multi-problem SOAP (Default)        |
| ├─ Driver's License Medical              |
| ├─ 6-week Baby Check                     |
| └─ Initial Medical                       |
|                                          |
| [Log in to create custom templates]      |
+------------------------------------------+

Selected template is automatically loaded when:
- Starting a new consultation
- Page refresh/reload
- First time visit
```

### 2. Transcription Controls & Monitor
```
+------------------------------------------+
| [⏺️ Start] [⏸️ Pause] [⏹️ Stop]         |
+------------------------------------------+
| Latest Transcription:                    |
| Dr: And how long have you...             |
| [Compact, scrolling single-line view]    |
+------------------------------------------+
```

### 3. Quick Notes
```
+------------------------------------------+
| Quick Notes                              |
| [Bullet point text area]                 |
|                                          |
| • Pt mentioned knee pain                 |
| • BP 145/90                              |
| • Need to check bloods                   |
|                                          |
| [Auto-saves as you type]                 |
+------------------------------------------+
```

### 4. Generated Notes
```
+------------------------------------------+
| Generated Notes                          |
| [Template-based structure]               |
|                                          |
| [Editable sections with formatting]      |
|                                          |
+------------------------------------------+
```

### 5. Action Buttons
```
+------------------------------------------+
| [Generate Notes] [Copy to Clipboard]      |
| [Clear All]     [Start New Consultation] |
+------------------------------------------+
```

## Responsive Behavior

### Mobile View (320px - 768px)
- Stack all sections vertically
- Collapsible transcription monitor
- Full-width text areas
- Floating action buttons

### Desktop View (> 768px)
```
+----------------+----------------------+
|     Header                           |
+----------------+----------------------+
| Template       |                     |
| Controls       |                     |
| Mini Trans.    |  Future Features    |
| Quick Notes    |  (NZ Resources,     |
| Generated      |   Tools, etc.)      |
| Notes          |                     |
|                |                     |
+----------------+----------------------+
```
- Main consultation area (70% width)
- Future features area (30% width)
- Sticky controls
- Comfortable reading width

## Key Features
- No patient data storage
- Quick note-taking during consultation
- Real-time transcription monitoring
- Easy template selection
- Copy-paste friendly
- Auto-saving
- Minimal clicks required

## Key Screens

### 1. Login Screen
```
+------------------------------------------+
|                                          |
|            ConsultAI NZ Logo             |
|                                          |
|            [Email Input]                 |
|            [Password Input]              |
|                                          |
|            [Login Button]                |
|                                          |
|            [Forgot Password]             |
|            [Sign Up]                     |
|                                          |
+------------------------------------------+
```

### 2. Template Management
```
+------------------------------------------+
| Templates | Search | New Template        |
+------------------------------------------+
|                                          |
| Template List                            |
| +--------------------------------------+ |
| | Template 1 | Edit | Delete | Copy    | |
| +--------------------------------------+ |
| | Template 2 | Edit | Delete | Copy    | |
| +--------------------------------------+ |
|                                          |
| Template Preview                         |
| [Template Content]                       |
|                                          |
+------------------------------------------+
```

## Component Specifications

### 1. Header
- Logo
- Navigation
- Search
- Notifications
- User Profile
- Responsive Menu

### 2. Sidebar
- Dashboard
- Consultations
- Templates
- Settings
- Collapsible
- Active State

### 3. Forms
- Input Fields
- Select Dropdowns
- Checkboxes
- Radio Buttons
- Date Pickers
- File Upload

### 4. Cards
- Consultation Card
- Template Card
- Statistics Card
- Notification Card
- Profile Card
- Settings Card

## Responsive Design

### Mobile Layout
```
+------------------+
|       Header     |
+------------------+
|                  |
|     Content      |
|                  |
+------------------+
|     Footer       |
+------------------+
```

### Tablet Layout
```
+--------------------------+
|         Header          |
+--------------------------+
|                          |
|         Content         |
|                          |
+--------------------------+
|         Footer          |
+--------------------------+
```

### Desktop Layout
```
+------------------------------------------+
|                 Header                    |
+------------------------------------------+
| Sidebar |            Content             |
|         |                                |
|         |                                |
|         |                                |
+------------------------------------------+
|                 Footer                    |
+------------------------------------------+
```

### 4. Error States
```
+------------------------------------------+
| Error: Transcription Failed              |
|                                          |
| Unable to start transcription.           |
| Please check your microphone permissions |
| and try again.                           |
|                                          |
| [Retry] [Check Settings]                 |
+------------------------------------------+

+------------------------------------------+
| Error: Note Generation Failed            |
|                                          |
| Unable to generate notes.                |
| Please try again or contact support.     |
|                                          |
| [Retry] [Contact Support]                |
+------------------------------------------+

+------------------------------------------+
| Error: Template Loading Failed           |
|                                          |
| Unable to load template.                 |
| Switching to default template.           |
|                                          |
| [Use Default] [Try Again]                |
+------------------------------------------+
```

## Error States Integration

### Main Layout with Error State
```
+------------------------------------------+
|              Header Bar                   |
| [Logo] [Search] [Notifications] [Profile] |
+------------------------------------------+
|                                          |
| Error: Transcription Failed              |
| [Error message and recovery options]     |
|                                          |
|              Main Content                 |
| [Disabled during error state]            |
|                                          |
+------------------------------------------+
```

### Mobile Error State
```
+------------------------------------------+
|              Header Bar                   |
+------------------------------------------+
|                                          |
| Error: Transcription Failed              |
| [Error message and recovery options]     |
|                                          |
|              Main Content                 |
| [Disabled during error state]            |
|                                          |
+------------------------------------------+
| Floating Action Buttons                  |
| [Retry] [Contact Support]                |
+------------------------------------------+
```
