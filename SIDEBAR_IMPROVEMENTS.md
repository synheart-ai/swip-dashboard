# Sidebar Improvements - Mobile Friendly & Collapsible

## Changes Made

### 1. **Collapsible Sidebar (Desktop)**
   - Added toggle button in the sidebar header (desktop only)
   - Sidebar can collapse from 256px (w-64) to 80px (w-20)
   - Collapsed state persists in localStorage
   - Icons remain visible with tooltips on hover when collapsed
   - Smooth transitions with 300ms duration

### 2. **Mobile-Friendly Design**
   - Sidebar hidden off-screen on mobile by default
   - Mobile header with hamburger menu button
   - Clicking hamburger opens sidebar as an overlay
   - Dark overlay behind sidebar when open
   - Sidebar automatically closes when:
     - Clicking on a navigation link
     - Clicking the overlay
     - Clicking the X button
     - Navigating to a new page

### 3. **Logo Update**
   - **Full Sidebar**: Uses `/logos/Swip_logo-02.svg` (matches landing page)
   - **Collapsed Sidebar**: Uses `/logos/Swip_logo-05.svg` (matches auth page)
   - Logo is clickable and links to home page
   - Hover animation:
     - Full: scale-105
     - Collapsed: scale-110
   - Height: 40px when collapsed, maintains aspect ratio

### 4. **Responsive Behavior**
   - **Mobile (< 1024px)**: 
     - Sidebar slides in from left
     - Full overlay when open
     - Hamburger menu in top header
   
   - **Desktop (≥ 1024px)**:
     - Sidebar always visible
     - Collapsible with toggle button
     - Main content margin adjusts automatically

### 5. **User Experience Enhancements**
   - Smooth animations and transitions
   - Tooltips show full labels when sidebar is collapsed
   - Active state highlighting maintained in all modes
   - Proper z-index layering for overlays
   - Aria labels for accessibility

## Files Modified

1. **`components/ui/Sidebar.tsx`**
   - Added `isCollapsed`, `isMobileOpen`, `onToggleCollapse`, `onCloseMobile` props
   - Mobile overlay component
   - Collapse/expand toggle button (desktop)
   - Close button (mobile)
   - Conditional rendering based on state
   - Tooltip system for collapsed state

2. **`components/LayoutWrapper.tsx`**
   - State management for collapse and mobile menu
   - LocalStorage integration for collapse state persistence
   - Mobile header with logo and hamburger button
   - Automatic mobile menu closing on navigation
   - Responsive main content margin (adjusts to sidebar width)

## Usage

### Desktop:
1. Click the collapse button (chevron icon) in the sidebar header to toggle
2. Sidebar will remember your preference

### Mobile:
1. Click the hamburger menu icon in the top header
2. Sidebar slides in from the left
3. Click any link, the X button, or the dark overlay to close

## Visual Indicators

- **Active Links**: Pink background with border (`bg-synheart-pink/10`)
- **Hover States**: Gray background on hover
- **Collapsed Icons**: Tooltips appear on hover
- **Mobile Overlay**: Semi-transparent black backdrop

## Technical Details

- **Breakpoint**: `lg` (1024px) for mobile/desktop switch
- **Sidebar Width**: 
  - Expanded: 256px (16rem)
  - Collapsed: 80px (5rem)
  - Mobile: Full overlay
- **Transitions**: All elements use 300ms ease-in-out
- **Z-Index Layers**:
  - Mobile overlay: z-40
  - Sidebar: z-50
  - Mobile header: z-30

