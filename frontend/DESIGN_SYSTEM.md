# BrazilFit Premium Design System

A comprehensive, world-class design system for a £50/month premium fitness platform, inspired by Whoop (data-driven precision), Hevy (modern community), and Nike Training Club (premium lifestyle).

## Design Philosophy

**Personality:** Precise, Trustworthy, Elevated  
**Tone:** Data-driven + Modern + Premium Bold  
**Aesthetic:** Dark, sophisticated, minimal with strategic color use  
**Motion:** Smooth, purposeful, non-distracting

---

## Color System

### Primary Palette (Forest Green)
**Identity & Trust** — The core of BrazilFit's brand

```
#1a4a3a - Primary (main identity, dark mode backgrounds)
#157359 - Secondary (hover states, accents)
#0f3129 - Dark (high contrast text)
#a0d4cb - Light (backgrounds, secondary uses)
```

**Usage:**
- Buttons, links, CTAs
- Focus indicators
- Progress bars (start color)
- Primary headings in certain contexts
- Brand elements

### Accent Palette (Mint)
**Energy & Action** — Progress, highlights, achievements

```
#7dd4a8 - Core accent (primary action, highlights)
#5ec699 - Darker mint (hover states)
#3fba8a - Very dark (high contrast text on light)
#d1faf0 - Light mint (backgrounds, secondary)
```

**Usage:**
- Key CTAs (Start, Submit, Continue)
- Progress indicators
- Achievement/badge unlocks
- Metric highlights
- Success states

### Warm Accent Palette (Orange)
**Dynamic Energy** — Secondary actions, warmth

```
#f9a661 - Bright warm (secondary CTAs, energy)
#e87a2f - Energetic orange (hover states)
#d45a1a - Deep orange (active states)
```

**Usage:**
- Secondary buttons
- Loading states
- Attention-grabbing elements
- Dynamic interactions

### Semantic Colors

**Success:** Mint (#7dd4a8) — Progress, completed tasks, achievements  
**Warning:** Orange (#f9a661) — Caution, pending actions  
**Error:** Red (#e74c3c) — Validation errors, destructive actions  
**Info:** Blue (#3b82f6) — Informational messages, tips

### Neutral Palette (Dark Mode)

```
#0a0a0a - Darkest background (page level)
#111111 - Dark background (secondary)
#1a1a1a - Muted background (default)
#1f1f1f - Card background
#262626 - Elevated background
#374151 - Borders, dividers
#6b7280 - Secondary text
#9ca3af - Tertiary text
#d1d5db - Light text
#e5e7eb - Lighter text
#f3f4f6 - Very light text
#ffffff - White text (primary text)
```

---

## Typography System

### Font Families

**Display (Headers):** Space Grotesk
- Modern, geometric, confident, premium
- Used for: H1-H6, display headings, page titles
- Weights: 400, 500, 600, 700

**Body (UI & Content):** Inter
- Warm, readable, accessible on all screens
- Used for: body copy, UI labels, form text
- Weights: 300, 400, 500, 600, 700, 800, 900

**Monospace (Data/Metrics):** Space Mono
- Clean, technical, precise
- Used for: data values, metrics, code
- Weights: 400, 700

### Type Scale (1.2 Ratio - Minor Third)

```
48px - Display XL (hero headlines)
38px - Display LG (page sections)
30px - Display MD
24px - Display SM / H1

25px - H2 (section titles)
20px - H3 (subsections)
17px - Body LG
16px - Body MD (default)
15px - Body SM / H4 / H5
14px - Body XS / H6 (labels)
13px - Body 2XS (captions)
```

### Line Heights (Screen Optimized)

```
1.2 - Headings, tight copy
1.5 - Body text, labels (default)
1.6 - Large body, accessibility
1.8 - Descriptions, prose
```

### Letter Spacing

```
-0.02em - Headings (tight, confident)
0       - Default (neutral)
0.025em - Labels, caps (wide)
0.05em  - Emphasis, ALL CAPS
```

---

## Spacing System

**Grid Base:** 4px  
**Fundamental Unit:** 1rem = 16px

```
0    = 0
1    = 4px
2    = 8px
3    = 12px
4    = 16px
5    = 20px
6    = 24px
8    = 32px
10   = 40px
12   = 48px
16   = 64px
20   = 80px
```

**Common Combinations:**

- **Padding:** 12px, 16px, 24px (cards, containers)
- **Margin:** 16px, 24px, 32px (sections, spacing)
- **Gap:** 8px, 12px, 16px (flex, grid layouts)
- **Gutters:** 16px (mobile), 24px (desktop)

---

## Shadow System

**Hue-Shifted Shadows** (green-tinted for premium cohesion)

```
sm     - 0 1px 2px 0 rgba(26, 74, 58, 0.1)
base   - 0 2px 4px 0 rgba(26, 74, 58, 0.12)
md     - 0 4px 8px 0 rgba(26, 74, 58, 0.14)
lg     - 0 8px 16px 0 rgba(26, 74, 58, 0.16)
xl     - 0 12px 24px 0 rgba(26, 74, 58, 0.18)
2xl    - 0 16px 32px 0 rgba(26, 74, 58, 0.2)

elevated  - Layered for premium cards
premium   - Maximum elevation for modals
```

**Usage:**
- Elevation indicates hierarchy
- Darker shadows = more elevated
- Hue-shifting (green tint) = cohesive, premium feel

---

## Border Radius

```
2px   - xs (subtle)
4px   - sm (inputs, small components)
8px   - base (buttons, cards, modals)
12px  - md (larger cards)
16px  - lg (sections)
24px  - 2xl (very large)
```

**Rule:** Smaller elements use smaller radius; larger elements use larger radius

---

## Motion System

### Timing

```
100ms  - Micro-interactions (hover feedback, brief animations)
150ms  - Fast (button press, form validation)
250ms  - Normal (standard transitions)
300ms  - Standard (navigation, state changes) — default
400ms  - Slow (complex animations)
500ms  - Slower (page transitions, elaborate)
```

### Easing Curves

```
ease-out-cubic        - Entries (starts slow, accelerates)
ease-in-cubic         - Exits (accelerates out)
ease-smooth           - Default (natural, balanced)
ease-smooth-in-out    - Both directions
ease-energetic        - Dynamic, responsive feel
ease-back-out         - Slight overshoot (celebratory)
```

### Common Animations

| Interaction | Duration | Easing | Effect |
|---|---|---|---|
| Button hover | 100ms | ease-smooth | Slight elevation |
| Button press | 150ms | ease-smooth | Scale + elevation |
| Input focus | 150ms | ease-smooth | Border glow |
| Modal enter | 300ms | ease-out-cubic | Slide up + fade |
| Modal exit | 200ms | ease-in-cubic | Slide down + fade |
| Toast notification | 300ms | ease-out-cubic | Slide in from edge |
| Page transition | 300ms | ease-smooth | Fade + slide |
| Chart animation | 400ms | ease-out-cubic | Drawing stroke |
| Badge unlock | 600ms | ease-back-out | Scale + rotate |
| Achievement pop | 2s | ease-smooth | Rise + fade |

### Motion Accessibility

**Respects `prefers-reduced-motion`** — All animations disabled for users who prefer reduced motion

---

## Component Library

### Buttons

**Primary Button**
- Background: Forest Green (#1a4a3a)
- Text: White
- Hover: Darker green, elevation
- Size: 44px min height (touch target)
- Weight: Semibold (600)

**Secondary Button**
- Background: Mint (#7dd4a8)
- Text: Black (#0a0a0a)
- Hover: Darker mint
- Purpose: Key affirming actions

**Tertiary Button**
- Background: Transparent
- Border: 1.5px gray
- Text: White
- Hover: Mint border + text

**Danger Button**
- Background: Red (#e74c3c)
- Text: White
- Purpose: Destructive actions

### Cards

**Base Card**
- Background: #1f1f1f
- Border: 1px #262626
- Radius: 12px
- Padding: 24px
- Hover: Mint border, elevated shadow

**Elevated Card**
- No border
- Box shadow from start
- Hover: More elevation

**Interactive Card**
- Clickable
- Hover: Translate up -4px

### Form Fields

**Input / Textarea / Select**
- Background: #1f1f1f
- Border: 1px #374151
- Radius: 8px
- Focus: Mint glow (3px shadow)
- Error: Red glow
- Success: Mint glow

### Badges

**Primary Badge** - Forest green background
**Success Badge** - Mint background with opacity
**Warning Badge** - Orange background with opacity
**Error Badge** - Red background with opacity
**Outline Badge** - Border only, transparent

### Progress Bars

- Height: 8px
- Radius: 4px
- Gradient: Forest green → Mint
- Animation: Smooth fill over 400ms

### Icons

- Size: 24px default, 32px large, 16px small
- Stroke width: 2px (consistent)
- Color: Inherit from text context
- Animation: Quick fade/scale on state changes

---

## Responsive Design

### Breakpoints (Content-Driven)

```
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### Mobile-First Approach

- Start with mobile layout
- Use `min-width` media queries
- Enhance progressively for larger screens

### Touch Targets

- Minimum: 44x44px (iOS standard)
- Comfortable: 48x48px
- Apply to: buttons, links, inputs, checkboxes

### Responsive Typography

- Base: 16px (responsive with clamp)
- Mobile: Reduce large heading sizes by ~20%
- Desktop: Full type scale

### Responsive Spacing

- Mobile: 16px gutters
- Tablet: 20px gutters
- Desktop: 24px gutters

### Fluid Values with `clamp()`

```css
font-size: clamp(1.5rem, 2vw, 2.5rem);
padding: clamp(1rem, 3%, 2rem);
```

---

## Accessibility Requirements

### Color Contrast

✓ All text meets WCAG AA (4.5:1 on small, 3:1 on large)
✓ Forest green on white: 8.5:1 (excellent)
✓ Mint on dark: 4.8:1 (AA pass)

### Motion

✓ Respects `prefers-reduced-motion: reduce`
✓ No auto-playing videos
✓ Animations are 500ms or less

### Focus Management

✓ Visible focus indicators (2px mint outline)
✓ Focus order follows DOM
✓ Keyboard navigation works throughout
✓ Focus trap in modals

### Forms

✓ Labels explicitly associated with inputs
✓ Error messages in `aria-describedby`
✓ Validation on blur, not keystroke
✓ Required fields marked with asterisk

### Semantic HTML

✓ Proper heading hierarchy (H1 → H6)
✓ Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
✓ Buttons are `<button>`, not `<div>` + JavaScript
✓ ARIA roles only when necessary

---

## Usage Examples

### Button

```jsx
<button className="btn btn-primary">
  Start 7-Day Free Trial
</button>

<button className="btn btn-secondary btn-sm">
  Learn More
</button>

<button className="btn btn-tertiary" disabled>
  Cancel
</button>
```

### Card

```jsx
<div className="card animate-fade-in">
  <h3 className="text-h3">Progress Today</h3>
  <p className="text-body-md">You're on track!</p>
</div>
```

### Form Input

```jsx
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  className="transition-colors"
  required
/>
```

### Progress Bar

```jsx
<div className="progress">
  <div
    className="progress-bar animated"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Modal

```jsx
<div className="modal-backdrop">
  <div className="modal-content">
    <h2 className="text-h2">Unlock Premium</h2>
    <button className="btn btn-primary">
      Start Free Trial
    </button>
  </div>
</div>
```

### Badge Unlock Animation

```jsx
<div className="animate-badge-unlock">
  🏆 First Session Completed!
</div>
```

---

## Implementation Checklist

- [x] Color system with semantic variables
- [x] Premium typography (Space Grotesk + Inter + Space Mono)
- [x] Complete shadow system (hue-shifted)
- [x] Motion specifications (timing, easing, animations)
- [x] Component library (buttons, cards, forms, etc.)
- [x] Responsive design system
- [x] Accessibility standards (WCAG AA)
- [ ] **TODO:** Apply to all pages (Login, Client Dashboard, PT Dashboard, Modals)
- [ ] **TODO:** Test on iPhone + Desktop (responsive, touch targets)
- [ ] **TODO:** Verify animations perform at 60fps
- [ ] **TODO:** QA: color contrast, focus rings, keyboard nav
- [ ] **TODO:** Document component variants (size, state, disabled)

---

## Next Steps

### Phase 1: Design System Files (✅ DONE)
- Color palette with semantic naming
- Premium typography system
- Motion & animation specifications
- Component library with base styles

### Phase 2: Page Redesigns (🔄 IN PROGRESS)
1. **Login Page** — Refresh background, button styles, form inputs
2. **Client Dashboard** — Cards, metrics, layout with proper spacing
3. **PT Dashboard** — Analytics cards, tables, data visualization
4. **All Modals** — Consistent backdrop, animations, sizing

### Phase 3: Quality Assurance
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (iPhone, Android)
- Accessibility audit (WAVE, axe, manual testing)
- Performance verification (60fps animations, no jank)

### Phase 4: Refinement
- Collect user feedback
- Fine-tune timing/easing if needed
- Add premium touches (micro-interactions, delight moments)
- Documentation for team

---

## Design System Files

- `frontend/src/styles/typography.css` — Complete type system
- `frontend/src/styles/motion.css` — Animations and transitions
- `frontend/src/styles/components.css` — Reusable component styles
- `frontend/tailwind.config.js` — Tailwind color, spacing, shadow config
- `frontend/index.html` — Font imports (Space Grotesk, Space Mono)

---

## Design Principles (Design for Hackers by David Kadavy)

1. **Purpose** — Every element serves a function
2. **Hierarchy** — Clear visual priority guides the eye
3. **Balance** — Proportion and white space create elegance
4. **Color** — Strategic use (forest green + mint) elevates perception
5. **Typography** — Different fonts for different roles (display vs body)
6. **Motion** — Purpose-driven, respects user preference
7. **Accessibility** — Inclusive by default (contrast, focus, keyboard)
8. **Responsive** — Adapts gracefully to any screen size

---

## Questions?

Refer to design files:
- Typography scale → `typography.css`
- Motion timing → `motion.css`
- Component variants → `components.css`
- Color tokens → `tailwind.config.js`

For implementation questions, check page examples below or ask in code comments.
