# Design System — Interactive Garden Plan

## Design Philosophy

Organic, editorial, and calm. The palette is pulled from the natural world — warm creams, sage greens, deep forest, earthy terracotta. Serif headings give it an editorial quality. Lots of whitespace. Photography is a first-class design element, not decoration.

Key traits to preserve:
- Warmth over coldness. No pure whites, no stark blacks — everything has warmth.
- Serif for headlines, sans-serif for UI and body.
- The accent color (terracotta) is used sparingly — one or two moments per section, never decorative.
- Cards use colored backgrounds, not borders or shadows, to differentiate.

---

## Brand
- **Primary audience:** Older, non-tech-savvy garden clients
- **Feeling:** Professional, warm, trustworthy, easy to understand
- **NOT:** Techy, flashy, complex, overwhelming

---

## Color Tokens

### Primitives

```css
/* Neutrals */
--color-cream:         #F2EDE8;   /* Page background — warm off-white */
--color-blush:         #EDD8C8;   /* Featured card background */
--color-sage-light:    #E5EBE3;   /* Hero section tint, panel backgrounds */
--color-white:         #FFFFFF;   /* Card backgrounds */

/* Greens */
--color-forest:        #283529;   /* Dark card background, nav button, zone pill active */
--color-forest-mid:    #2D3B2E;   /* Price text, dark text on light bg */
--color-green-text:    #1A2820;   /* Primary headings */

/* Accent */
--color-terracotta:    #C97D4A;   /* Brand accent — CTA buttons, active states, highlights */
--color-terracotta-hover: #B56A38; /* Terracotta hover */

/* Text */
--color-text-dark:     #1A2820;   /* Primary headings */
--color-text-body:     #4A4A4A;   /* Body copy, descriptions */
--color-text-muted:    #888888;   /* Labels, captions, scientific names */
--color-text-on-dark:  #FFFFFF;   /* Text on forest-green backgrounds */

/* UI utility */
--color-border:        #DDD6CE;   /* Warm-tinted borders — not cold gray */
--color-skeleton:      #E8E2DC;   /* Loading skeleton shimmer base */
--color-surface:       #EDE8E3;   /* Hover background for cards */
--color-overlay:       rgba(0, 0, 0, 0.2); /* Map backdrop on mobile */
```

### Semantic Tokens

```css
--color-bg:              var(--color-cream);
--color-bg-hero:         var(--color-sage-light);
--color-bg-card:         var(--color-white);
--color-bg-card-blush:   var(--color-blush);
--color-bg-card-sage:    var(--color-sage-light);
--color-bg-card-dark:    var(--color-forest);
--color-bg-panel:        var(--color-cream);

--color-primary:         var(--color-terracotta);
--color-primary-hover:   var(--color-terracotta-hover);

--color-heading:         var(--color-text-dark);
--color-body:            var(--color-text-body);
--color-muted:           var(--color-text-muted);
--color-nav-btn:         var(--color-forest);
```

---

## Typography

**Heading font:** `'Playfair Display', 'Cormorant Garamond', Georgia, serif`
**Body / UI font:** `'DM Sans', 'Inter', system-ui, sans-serif`

Two distinct font roles — never mix them within the same context. Headings are always serif. Buttons, labels, nav, and body copy are always sans-serif.

### Scale

```css
--font-heading: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
--font-body:    'DM Sans', 'Inter', system-ui, sans-serif;

--font-size-hero:    56px;   /* Main hero headline */
--font-size-h1:      44px;   /* Section headings */
--font-size-h2:      36px;   /* Large pull quotes, feature text */
--font-size-h3:      22px;   /* Card headings, panel titles */
--font-size-h4:      18px;   /* Sub-headings, plant names */
--font-size-base:    15px;   /* Body copy, descriptions */
--font-size-sm:      13px;   /* Labels, captions, eyebrow text */
--font-size-xs:      12px;   /* Fine print, badge text, scientific names */

--font-weight-regular:  400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;

--line-height-tight:   1.15;
--line-height-heading: 1.3;
--line-height-body:    1.6;
```

Rules:
- Page/section titles use `--font-heading`. All other text uses `--font-body`.
- Scientific names: `--font-size-xs`, italic, `--color-muted`.
- Navigation links: `--font-body`, `--font-size-sm`, uppercase, `letter-spacing: 0.05em`.
- Buttons: `--font-body`, `--font-weight-medium`, sentence case.

---

## Spacing

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
```

---

## Border Radius

```css
--radius-sm:    8px;    /* Badges, skeleton rects, photo thumbnails */
--radius-md:    16px;   /* Plant cards, feature cards */
--radius-lg:    24px;   /* Panels, large containers */
--radius-full:  9999px; /* Zone pills, CTA buttons, "Sign In"-style nav button */
```

---

## Elevation

```css
--shadow-card:   0 2px 12px rgba(40, 53, 41, 0.08), 0 1px 4px rgba(40, 53, 41, 0.04);
--shadow-hover:  0 8px 24px rgba(40, 53, 41, 0.12), 0 2px 8px rgba(40, 53, 41, 0.06);
--shadow-panel:  -4px 0 24px rgba(40, 53, 41, 0.10);  /* Sidebar panel */
--shadow-sheet:  0 -4px 24px rgba(40, 53, 41, 0.10);  /* Bottom sheet */
--shadow-none:   none;
```

---

## Components

### Plant Card
- Background: `--color-bg-card`
- Border-radius: `--radius-md`
- Box-shadow: `--shadow-card`
- Padding: `--space-3`
- Layout: horizontal flex — photo left, text right
- Photo thumbnail: 64×64px, `border-radius: --radius-sm`, object-fit: cover
- Gap between photo and text: `--space-3`
- Plant name: `--font-size-base`, `--font-weight-semibold`, `--color-heading`
- Scientific name: `--font-size-xs`, italic, `--color-muted`
- Hover: background `--color-surface`, box-shadow `--shadow-hover`, transition `200ms ease`
- Touch target: minimum 44px height

### Sidebar Panel (desktop, ≥768px)
- Width: 320px
- Background: `--color-bg-panel` (`--color-cream`)
- Border-left: `1px solid var(--color-border)`
- Box-shadow: `--shadow-panel`
- Padding: `--space-4`
- Panel title: `--font-heading`, `--font-size-h3`, `--color-heading`
- Scroll: `overflow-y: auto` for plant list
- Close button: 32×32px, top-right corner, `--color-muted` icon, hover `--color-body`

### Bottom Sheet (mobile, <768px)
- Min-height: 40vh, max-height: 60vh
- Background: `--color-bg-panel`
- Border-radius: `--radius-lg` top corners only (`24px 24px 0 0`)
- Box-shadow: `--shadow-sheet`
- Handle: 40×4px, centered, `background: --color-border`, `border-radius: --radius-full`
- Padding: `--space-4`
- Backdrop: `--color-overlay` on map behind sheet
- Animation: slide up `300ms ease-out`

### Zone List (primary nav)
- Layout: horizontal wrap
- Gap: `--space-2`
- Item padding: `--space-2` vertical, `--space-4` horizontal
- Item border: `1px solid var(--color-border)`
- Item border-radius: `--radius-full`
- Item font: `--font-body`, `--font-size-sm`, `--color-body`
- Item hover: `background: --color-terracotta`, `color: white`, `border-color: --color-terracotta`
- Item active (zone selected): `background: --color-forest`, `color: white`, `border-color: --color-forest`
- Transition: `150ms ease`
- Touch target: minimum 44px height

### Skeleton Card (loading state)
- Same dimensions and layout as Plant Card
- Photo area: `--color-skeleton`, 64×64px, `--radius-sm`
- Text areas: `--color-skeleton` rectangles at `--font-size-base` and `--font-size-xs` heights
- Animation: shimmer pulse `1.5s ease-in-out infinite`

```css
@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
```

### Primary Button (CTA)
```css
background:     var(--color-primary);
color:          white;
font-family:    var(--font-body);
font-size:      var(--font-size-base);
font-weight:    var(--font-weight-medium);
padding:        12px 28px;
border-radius:  var(--radius-full);
border:         none;
transition:     background 150ms ease;
```
Hover: `background: var(--color-primary-hover)`

---

## Responsive Breakpoints

- **Desktop:** ≥ 768px → sidebar panel layout
- **Mobile:** < 768px → bottom sheet layout
- No tablet-specific breakpoint (uses mobile layout)

---

## Leaflet Map Overrides

```js
{
  zoomControl: false,              // not a geographic map
  attributionControl: false,       // or styled minimal
  maxBoundsViscosity: 1.0,         // prevent panning outside image
  scrollWheelZoom: false           // prevent accidental zoom on desktop
}
```
Pinch-zoom allowed on mobile within tight bounds.

---

## Accessibility

- Touch targets: 44px minimum on all interactive elements
- Color contrast: 4.5:1 minimum for all text
- Focus indicators: `2px solid var(--color-primary)`, `outline-offset: 2px`
- Zone list: keyboard focusable via tab, ARIA role `navigation`
- Sidebar/bottom sheet panel: ARIA role `complementary`
- Skeleton cards: `aria-busy="true"` on container while loading

---

## What Not to Do

- No pure white (`#FFFFFF`) page backgrounds — always use `--color-cream`
- No cold gray borders — all borders use `--color-border` (warm-tinted)
- No sans-serif for section or page titles
- No more than one terracotta accent per visual section
- No hard box borders on cards — use `--shadow-card` instead
- No flat, sharp-cornered buttons — all CTAs are rounded pill or `--radius-md` minimum
- Do not use `#808080` or similar neutral grays — every gray in this system has a warm undertone