# Design System - Interactive Garden Plan

## Brand
- **Primary audience:** Older, non-tech-savvy garden clients
- **Feeling:** Professional, warm, trustworthy, easy to understand
- **NOT:** Techy, flashy, complex, overwhelming

## Colors
```css
--color-primary: #662D91;          /* Purple - brand accent */
--color-primary-light: rgba(102, 45, 145, 0.3);  /* Zone hover highlight */
--color-primary-dark: #4a1f6b;     /* Active/pressed states */
--color-bg: #ffffff;               /* Page background */
--color-surface: #fafaf5;          /* Card/panel backgrounds */
--color-border: #e0e0e0;           /* Borders, dividers */
--color-text: #1a1a1a;             /* Primary text */
--color-text-secondary: #666666;   /* Secondary text, labels */
--color-text-muted: #999999;       /* Captions, metadata */
--color-success: #4c8750;          /* Plant loaded, zone active */
--color-error: #c0392b;            /* Error states */
--color-skeleton: #e8e8e3;         /* Loading skeleton base */
--color-skeleton-shine: #f5f5f0;   /* Loading skeleton animation */
```

## Typography
```css
--font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-size-xs: 12px;    /* Captions, metadata */
--font-size-sm: 14px;    /* Secondary text, labels */
--font-size-base: 16px;  /* Body text, plant names */
--font-size-lg: 18px;    /* Zone headings in panels */
--font-size-xl: 20px;    /* Panel titles */
--font-size-2xl: 24px;   /* Page title */
```
Note: 16px minimum for body text. Older users need readable sizes.

## Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
```

## Components

### Plant Card
- Height: auto (content-driven)
- Photo thumbnail: 64x64px, border-radius: 4px
- Name: --font-size-base, font-weight: 600
- Scientific name: --font-size-sm, italic, --color-text-secondary
- Padding: --space-3
- Gap between photo and text: --space-3
- Hover: subtle background change to --color-surface
- Touch target: minimum 44px height

### Sidebar Panel (desktop)
- Width: 320px
- Background: --color-bg
- Border-left: 1px solid --color-border
- Padding: --space-4
- Scroll: overflow-y auto for plant list
- Close button: 32x32px, top-right corner

### Bottom Sheet (mobile)
- Min-height: 40vh, max-height: 60vh
- Background: --color-bg
- Border-radius: 12px 12px 0 0 (top corners only)
- Handle: 40x4px centered gray pill at top (--color-border)
- Padding: --space-4
- Backdrop: semi-transparent overlay on map (rgba(0,0,0,0.2))
- Animation: slide up 300ms ease-out

### Zone List (primary nav)
- Layout: horizontal wrap (pills/chips)
- Item padding: --space-2 --space-4
- Item border: 1px solid --color-border
- Item border-radius: 20px
- Item hover: --color-primary background, white text
- Item active (zone selected): --color-primary background, white text
- Gap: --space-2
- Touch target: minimum 44px height

### Skeleton Card (loading state)
- Same dimensions as plant card
- Photo area: --color-skeleton rectangle, 64x64px
- Text areas: --color-skeleton rectangles, shimmer animation
- Animation: 1.5s ease-in-out infinite pulse

## Responsive Breakpoints
- Desktop: >= 768px (sidebar panel)
- Mobile: < 768px (bottom sheet)
- No tablet-specific breakpoint (uses mobile layout)

## Leaflet Map Overrides
- zoomControl: false (not a geographic map)
- attributionControl: false or styled minimal
- maxBoundsViscosity: 1.0 (prevent panning away from image)
- scrollWheelZoom: false on desktop (prevent accidental zoom)
- Allow pinch-zoom on mobile within tight bounds

## Accessibility
- Touch targets: 44px minimum
- Color contrast: 4.5:1 minimum for text
- Focus indicators: 2px solid --color-primary outline
- Zone list items: focusable with keyboard (tab navigation)
- ARIA: zone list as navigation landmark, panels as complementary
