# UI/UX Design Guidelines

## Design Principles

### 1. User-Centered Design
- Prioritize GP workflow
- Minimize cognitive load
- Ensure intuitive navigation
- Focus on efficiency
- Support quick actions
- Maintain consistency

### 2. Accessibility
- WCAG 2.1 compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Proper color contrast
- Clear focus states

### 3. Responsive Design
- Mobile-first approach
- Adaptive layouts
- Flexible components
- Proper breakpoints
- Touch-friendly
- Cross-device consistency

### 4. Visual Hierarchy
- Clear information architecture
- Proper spacing
- Consistent typography
- Visual cues
- Proper contrast
- Focused attention

## Component Guidelines

### 1. Forms
- Clear labels
- Proper validation
- Helpful error messages
- Logical grouping
- Proper spacing
- Accessible inputs

### 2. Navigation
- Clear structure
- Consistent placement
- Proper highlighting
- Breadcrumb trails
- Search functionality
- Quick actions

### 3. Data Display
- Clear tables
- Proper pagination
- Sorting options
- Filtering capabilities
- Export options
- Data visualization

### 4. Feedback
- Loading states
- Success messages
- Error handling
- Confirmation dialogs
- Progress indicators
- Toast notifications

## Styling Guidelines

### 1. Colors
```
Primary Colors:
- Primary Blue: #2E75B6 (Headers, buttons)
- Secondary Blue: #5B9BD5 (Links, highlights)
- Alert Red: #D9534F (Warnings, errors)
- Success Green: #5CB85C (Success messages)

Neutral Colors:
- Background: #FFFFFF
- Text: #333333
- Light Gray: #F5F5F5 (Secondary background)
- Border: #E0E0E0
```

### 2. Typography
```
Font Family:
- Primary: Inter (Clean, professional medical look)
- Fallback: system-ui, -apple-system, sans-serif

Font Sizes:
- Page Title: 24px
- Section Headers: 20px
- Body Text: 16px
- Small Text: 14px
- Tiny Text: 12px

Font Weights:
- Regular: 400 (Body text)
- Medium: 500 (Subheadings)
- Semibold: 600 (Headers)
```

### 3. Layout
```
Spacing:
- XS: 4px
- Small: 8px
- Medium: 16px
- Large: 24px
- XL: 32px

Container:
- Max-width: 1200px
- Default padding: 16px

Grid:
- Simple 12-column grid
- Gutters: 16px
```

### 4. Components

#### Headers
```
- Clean blue header bar
- White text on blue background
- Logo on left
- Search on right
- Simple navigation below
```

#### Cards
```
- White background
- Light border
- Small border radius (4px)
- Subtle shadow
- Consistent padding (16px)
```

#### Buttons
```
Primary:
- Blue background
- White text
- No gradient
- Subtle hover effect

Secondary:
- White background
- Blue border
- Blue text
```

#### Forms
```
- Full width inputs
- Clear labels above fields
- Visible focus states
- Simple validation styles
- Consistent spacing
```

#### Alerts
```
- Simple colored backgrounds
- Clear icons
- Concise messages
- Dismissible when appropriate
```

### 5. Responsive Design
```
Breakpoints:
- Mobile: 320px
- Tablet: 768px
- Desktop: 1024px

Mobile:
- Stack all elements
- Full width containers
- Larger touch targets
- Simplified navigation
```

### 6. Accessibility
```
- High contrast text
- Clear focus indicators
- Proper heading hierarchy
- Sufficient color contrast
- Screen reader support
```

### 7. Icons
```
- Use Lucide icons
- Consistent size (20px default)
- Match primary colors
- Use sparingly
- Keep it simple
```

This styling guide focuses on:
- Professional medical appearance
- Clear readability
- Simple, clean design
- Consistent spacing
- Accessible interface

## Interaction Patterns

### 1. Hover States
- Subtle changes
- Clear feedback
- Proper timing
- Consistent behavior
- Accessible
- Informative

### 2. Click/Tap
- Clear targets
- Proper feedback
- Consistent behavior
- Prevent errors
- Support gestures
- Quick actions

### 3. Scrolling
- Smooth behavior
- Proper momentum
- Infinite scroll
- Load more
- Back to top
- Scroll indicators

### 4. Animations
- Subtle effects
- Purposeful motion
- Performance
- Accessibility
- Consistent timing
- Proper easing

## Layout Guidelines

### 1. Grid System
- 12-column grid
- Proper gutters
- Responsive breakpoints
- Flexible columns
- Nested grids
- Alignment

### 2. Component Layout
- Proper spacing
- Consistent alignment
- Clear hierarchy
- Flexible containers
- Proper wrapping
- Responsive behavior

### 3. Page Layout
- Clear structure
- Proper sections
- Consistent headers
- Proper footers
- Sidebar usage
- Content width

### 4. Responsive Layout
- Mobile-first
- Breakpoint strategy
- Flexible components
- Proper stacking
- Touch targets
- Viewport handling

## Design System

### 1. Components
- Button styles
- Form elements
- Navigation
- Cards
- Modals
- Tables

### 2. Patterns
- Form patterns
- Navigation patterns
- Data display
- Feedback patterns
- Layout patterns
- Interaction patterns

### 3. Tokens
- Color tokens
- Typography tokens
- Spacing tokens
- Border tokens
- Shadow tokens
- Animation tokens

### 4. Documentation
- Component docs
- Pattern docs
- Token docs
- Usage examples
- Best practices
- Accessibility notes

## Implementation Guidelines

### 1. Tailwind CSS
- Proper configuration
- Custom utilities
- Component classes
- Responsive classes
- Dark mode
- Custom plugins

### 2. Shadcn UI
- Component usage
- Customization
- Theme integration
- Accessibility
- Performance
- Documentation

### 3. Radix UI
- Component usage
- Customization
- Accessibility
- Performance
- Documentation
- Best practices

### 4. Performance
- Optimize CSS
- Minimize classes
- Proper purging
- Critical CSS
- Load times
- Render performance
