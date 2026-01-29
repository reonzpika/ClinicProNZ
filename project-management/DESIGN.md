# ClinicPro Design System
## Comprehensive Design Document for Web & SaaS Application

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Purpose:** AI Agent Reference for Consistent Website Style in Cursor IDE

---

## 1. Design Philosophy & Inspiration

### Core Principles
Inspired by Dropbox.com's design excellence, ClinicPro adopts a **minimalist, trust-focused** approach tailored for healthcare professionals.

#### Design Pillars
1. **Clarity Over Complexity**: Medical professionals need fast, accurate information access
2. **Trust Through Calm**: Reduced cognitive load with calm colors and predictable patterns
3. **Efficiency First**: Every element serves a functional purpose
4. **Accessibility Standard**: WCAG 2.1 AA compliance minimum

#### Dropbox-Inspired Strengths
- **Whitespace Mastery**: Generous spacing prevents information overload
- **Subtle Motion**: Animations guide attention without distraction
- **Content Hierarchy**: Clear visual hierarchy for scannable content
- **Responsive Excellence**: Mobile-first approach with seamless desktop scaling

#### Healthcare Adaptations
- **Clinical Context**: Muted tones replace vibrant marketing colors
- **Data Density**: Support for tables, charts, and complex medical information
- **Professional Tone**: Conservative, trustworthy aesthetic over playful design
- **Privacy Indicators**: Visual cues for sensitive patient data

---

## 2. Color Palette

### Primary Colors

```css
/* Primary Blue - Trust & Action */
--color-primary: #0070E0;
--color-primary-hover: #006DCB;
--color-primary-active: #005BB5;
--color-primary-light: #E5F3FF;
--color-primary-dark: #004A99;

/* Success Green - Confirmations */
--color-success: #00A95F;
--color-success-hover: #009654;
--color-success-light: #E6F7F0;

/* Warning Amber - Alerts */
--color-warning: #F5A623;
--color-warning-hover: #E09615;
--color-warning-light: #FFF4E5;

/* Error Red - Critical States */
--color-error: #D32F2F;
--color-error-hover: #C62828;
--color-error-light: #FFEBEE;

/* Info Blue - Informational */
--color-info: #1976D2;
--color-info-light: #E3F2FD;
```

### Neutral Colors

```css
/* Background & Surface */
--color-white: #FFFFFF;
--color-background: #FAFBFC;
--color-surface: #F7F9FA;
--color-surface-raised: #FFFFFF;

/* Borders & Dividers */
--color-border: #E4E7EB;
--color-border-light: #F0F2F5;
--color-border-dark: #D1D5DB;

/* Text Colors */
--color-text-primary: #1D1D1D;
--color-text-secondary: #4B5563;
--color-text-tertiary: #6B7280;
--color-text-disabled: #9CA3AF;
--color-text-inverse: #FFFFFF;
```

### Usage Guidelines

**Primary Blue (#0070E0)**
- CTA buttons (Book Appointment, Save Record)
- Primary navigation links
- Interactive elements requiring user action
- Minimum contrast ratio: 4.5:1 against white

**Success Green (#00A95F)**
- Form submission confirmations
- Successfully saved data indicators
- Positive health metrics
- "Available" status badges

**Warning Amber (#F5A623)**
- Pending reviews or approvals
- Moderate priority alerts
- Missing optional information
- Cautionary messages

**Error Red (#D32F2F)**
- Form validation errors
- Critical patient alerts
- System errors
- Destructive actions (Delete, Cancel)

---

## 3. Typography System

### Font Stack

```css
/* Primary Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

/* Display Font (Headings) */
--font-display: 'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 
                'Segoe UI', Roboto, sans-serif;

/* Monospace (Code, IDs) */
--font-mono: 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
```

### Type Scale

```css
/* Display Sizes */
--text-display-xl: 3.75rem;    /* 60px - Hero headlines */
--text-display-lg: 3rem;       /* 48px - Section headers */
--text-display-md: 2.25rem;    /* 36px - Page titles */
--text-display-sm: 1.875rem;   /* 30px - Card headers */

/* Heading Sizes */
--text-h1: 2.25rem;   /* 36px */
--text-h2: 1.875rem;  /* 30px */
--text-h3: 1.5rem;    /* 24px */
--text-h4: 1.25rem;   /* 20px */
--text-h5: 1.125rem;  /* 18px */
--text-h6: 1rem;      /* 16px */

/* Body Sizes */
--text-body-lg: 1.125rem;  /* 18px - Lead paragraphs */
--text-body: 1rem;         /* 16px - Default body */
--text-body-sm: 0.875rem;  /* 14px - Secondary text */
--text-body-xs: 0.75rem;   /* 12px - Captions, labels */

/* Line Heights */
--leading-tight: 1.2;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Typography Rules

**Headings**
```css
h1, .h1 {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
}

h2, .h2 {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: -0.015em;
  color: var(--color-text-primary);
  margin-bottom: 1.25rem;
}

h3, .h3 {
  font-family: var(--font-primary);
  font-size: var(--text-h3);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}
```

**Body Text**
```css
body, .body {
  font-family: var(--font-primary);
  font-size: var(--text-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

.lead {
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.caption {
  font-size: var(--text-body-xs);
  line-height: var(--leading-normal);
  color: var(--color-text-tertiary);
}
```

---

## 4. Layout Grid & Spacing

### Container Sizes

```css
/* Max Widths */
--container-xs: 480px;   /* Mobile forms */
--container-sm: 640px;   /* Single column content */
--container-md: 768px;   /* Standard content */
--container-lg: 1024px;  /* Wide content */
--container-xl: 1280px;  /* Dashboard layouts */
--container-2xl: 1536px; /* Full-width sections */

/* Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Spacing Scale

```css
/* 8px Base Scale */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Layout Patterns

**Hero Section**
```css
.hero {
  padding: var(--space-20) var(--space-6);
  max-width: var(--container-xl);
  margin: 0 auto;
  min-height: 600px;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .hero {
    padding: var(--space-12) var(--space-4);
    min-height: 400px;
  }
}
```

**Content Section**
```css
.section {
  padding: var(--space-16) var(--space-6);
  max-width: var(--container-lg);
  margin: 0 auto;
}

.section-wide {
  max-width: var(--container-xl);
}

.section-narrow {
  max-width: var(--container-md);
}
```

**Grid System**
```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-4, .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid-4, .grid-3, .grid-2 {
    grid-template-columns: 1fr;
  }
}
```

### Dashboard Layout

```css
.dashboard-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  gap: 0;
}

.sidebar {
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: var(--space-6);
}

.main-content {
  padding: var(--space-8) var(--space-6);
  background: var(--color-background);
}

@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none; /* Toggle with menu */
  }
}
```

---

## 5. UI Components

### Buttons

**Primary Button**
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: var(--weight-medium);
  font-size: var(--text-body);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 6px rgba(0, 112, 224, 0.15);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: var(--color-primary-active);
  transform: translateY(0);
}

.btn-primary:disabled {
  background: var(--color-border);
  color: var(--color-text-disabled);
  cursor: not-allowed;
  box-shadow: none;
}
```

**Secondary Button**
```css
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: var(--weight-medium);
  font-size: var(--text-body);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-surface);
  border-color: var(--color-border-dark);
}
```

**Button Sizes**
```css
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: var(--text-body-sm);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: var(--text-body-lg);
}
```

### Cards

**Base Card**
```css
.card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-border-dark);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.card-title {
  font-size: var(--text-h4);
  font-weight: var(--weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.card-body {
  color: var(--color-text-secondary);
}

.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### Navigation

**Top Navigation Bar**
```css
.navbar {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.navbar-logo {
  font-size: var(--text-h4);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: var(--space-6);
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--weight-medium);
  transition: color 0.2s ease;
  position: relative;
}

.navbar-link:hover {
  color: var(--color-primary);
}

.navbar-link.active {
  color: var(--color-primary);
}

.navbar-link.active::after {
  content: '';
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
}
```

### Form Elements

**Input Fields**
```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: var(--text-body);
  font-family: var(--font-primary);
  color: var(--color-text-primary);
  background: var(--color-white);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input:disabled {
  background: var(--color-surface);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.input.error {
  border-color: var(--color-error);
}

.input.error:focus {
  box-shadow: 0 0 0 3px var(--color-error-light);
}
```

**Labels**
```css
.label {
  display: block;
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.label-required::after {
  content: '*';
  color: var(--color-error);
  margin-left: var(--space-1);
}
```

**Error Messages**
```css
.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  font-size: var(--text-body-sm);
  color: var(--color-error);
}
```

### Badges & Pills

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: var(--text-body-xs);
  font-weight: var(--weight-medium);
  line-height: 1;
}

.badge-primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.badge-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.badge-error {
  background: var(--color-error-light);
  color: var(--color-error);
}
```

### Icons

**Icon Guidelines**
- Use Heroicons, Lucide, or Feather Icons (16px, 20px, 24px sizes)
- Default stroke-width: 2
- Color: inherit from parent element
- Align icons vertically with text using flexbox

```css
.icon {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

.icon-lg {
  width: 1.5rem;
  height: 1.5rem;
}
```

---

## 6. Animations & Motion

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Duration */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Standard Transitions

```css
/* Hover States */
.transition-hover {
  transition: all var(--duration-base) var(--ease-out);
}

/* Focus States */
.transition-focus {
  transition: box-shadow var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}

/* Color Changes */
.transition-color {
  transition: color var(--duration-base) var(--ease-out),
              background-color var(--duration-base) var(--ease-out);
}
```

### Micro-Interactions

**Button Press**
```css
@keyframes button-press {
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

.btn:active {
  animation: button-press var(--duration-fast) var(--ease-out);
}
```

**Fade In**
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fade-in var(--duration-slow) var(--ease-out);
}
```

**Slide In**
```css
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in {
  animation: slide-in-right var(--duration-slow) var(--ease-out);
}
```

**Loading Spinner**
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### Page Transitions

```css
/* Route transitions */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all var(--duration-slow) var(--ease-out);
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-in);
}
```

### Performance Guidelines

1. **Use transform and opacity** for animations (GPU-accelerated)
2. **Avoid animating** width, height, top, left (causes reflow)
3. **Reduce motion** for accessibility:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Application Guidelines

### Mobile-First Considerations

**Touch Targets**
- Minimum size: 44x44px for all interactive elements
- Spacing: 8px minimum between touch targets
- Larger buttons on forms for easy tapping

```css
@media (max-width: 768px) {
  .btn {
    min-height: 44px;
    padding: var(--space-3) var(--space-4);
  }
  
  .navbar-link {
    padding: var(--space-3) var(--space-4);
  }
  
  /* Stack dashboard on mobile */
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  
  /* Increase font size for better readability */
  body {
    font-size: 1.0625rem; /* 17px */
  }
  
  /* Increase spacing on mobile */
  .section {
    padding: var(--space-8) var(--space-4);
  }
}
```

### Accessibility Requirements

**WCAG 2.1 AA Compliance**
1. Color contrast minimum 4.5:1 for normal text
2. Color contrast minimum 3:1 for large text (18px+)
3. Focus indicators visible on all interactive elements
4. ARIA labels for all icons and interactive elements
5. Keyboard navigation support for all features

```css
/* Focus Styles */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip to Content Link */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--space-3);
  text-decoration: none;
  z-index: 1000;
}

.skip-to-content:focus {
  top: 0;
}
```

---

## 8. Implementation Checklist

### For AI Agent in Cursor IDE

When implementing designs, verify:

- [ ] Colors match exact hex values from palette
- [ ] Typography uses specified font families and sizes
- [ ] Spacing follows 8px grid system
- [ ] Components use standard patterns from this document
- [ ] Hover/focus states are implemented
- [ ] Mobile responsive breakpoints are applied
- [ ] Animations use specified timing functions
- [ ] ARIA labels present on interactive elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets minimum 44x44px on mobile

### Component Priority Order

1. **Phase 1 - Foundation**
   - Navigation bar
   - Button components (primary, secondary)
   - Form inputs and labels
   - Card components

2. **Phase 2 - Layout**
   - Dashboard layout grid
   - Content sections
   - Grid systems
   - Container patterns

3. **Phase 3 - Interactive Elements**
   - Badges and status indicators
   - Tables and data display
   - Modal dialogs
   - Dropdown menus

4. **Phase 4 - Polish**
   - Animations and transitions
   - Loading states
   - Empty states
   - Error states

---

## 9. Code Templates

### React Component Template

```jsx
import React from 'react';
import './ComponentName.css';

export const ComponentName = ({ 
  variant = 'primary',
  size = 'medium',
  children,
  ...props 
}) => {
  const classes = [
    'component-name',
    `component-name--${variant}`,
    `component-name--${size}`,
  ].join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
```

### CSS Module Template

```css
/* Component: ComponentName */

.component-name {
  /* Layout */
  display: flex;
  
  /* Spacing */
  padding: var(--space-4);
  margin: 0;
  
  /* Typography */
  font-family: var(--font-primary);
  font-size: var(--text-body);
  
  /* Colors */
  color: var(--color-text-primary);
  background: var(--color-white);
  
  /* Borders */
  border: 1px solid var(--color-border);
  border-radius: 8px;
  
  /* Effects */
  transition: all var(--duration-base) var(--ease-out);
}

/* Variants */
.component-name--primary {
  background: var(--color-primary);
  color: var(--color-white);
}

/* States */
.component-name:hover {
  border-color: var(--color-primary);
}

.component-name:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .component-name {
    padding: var(--space-3);
  }
}
```

---

## 10. Resources & References

### Design Tools
- **Figma File**: [Link to ClinicPro Design System]
- **Icon Library**: Heroicons (https://heroicons.com)
- **Font**: Inter (https://rsms.me/inter/)

### Inspiration Sources
- Dropbox.com - Minimalist approach
- Stripe.com - Clean data presentation
- Linear.app - Professional dashboard design

### Accessibility Testing
- WAVE Tool: https://wave.webaim.org
- axe DevTools: Browser extension
- Keyboard navigation testing required

### Browser Support
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 14+
- Mobile Chrome: Android 10+

---

**Document Version Control**
- v1.0 - Initial design system (January 29, 2026)
- Next Review: March 2026
