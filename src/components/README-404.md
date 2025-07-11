# 404 Error Page Implementation

## Overview
This directory contains the implementation of a custom 404 error page for the SmartFee application.

## Files
- `NotFound.jsx` - The main 404 component
- `../styles/notfound.css` - CSS styling for the 404 page
- `__tests__/NotFound.test.jsx` - Unit tests for the component

## Design Features
- **Animated GIF Background**: Uses a Dribbble 404 animation for visual appeal
- **Responsive Design**: Works on all screen sizes with proper mobile optimization
- **Bootstrap-like Grid**: Implements a custom grid system for layout
- **Arvo Font**: Uses Google Fonts for typography
- **Hover Effects**: Interactive button with smooth transitions

## Routing
The 404 page is integrated into the React Router setup:
- Direct route: `/404`
- Catch-all route: `*` (any undefined route)

## CSS Structure
```css
.page_404 - Main container
.four_zero_four_bg - Animated background with GIF
.contant_box_404 - Content area with text and button
.link_404 - Home button styling
```

## Usage
The component is automatically loaded when:
1. User navigates to `/404`
2. User navigates to any undefined route
3. Application encounters a routing error

## Testing
Run tests with:
```bash
npm test NotFound.test.jsx
```

## Customization
To customize the 404 page:
1. Update the GIF URL in `notfound.css` 
2. Modify text content in `NotFound.jsx`
3. Adjust styling in `notfound.css`
4. Update colors to match brand guidelines 