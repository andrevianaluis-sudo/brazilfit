# BrazilFit Design System - Quick Start

Copy-paste ready. Get started in 60 seconds.

## 1. Most Common Components

### Primary Button (Green CTA)
```jsx
<button className="btn btn-primary">Start Trial</button>
```

### Secondary Button (Mint - Affirming)
```jsx
<button className="btn btn-secondary">Continue</button>
```

### Card with Content
```jsx
<div className="card">
  <h3 className="text-h3">Your Progress</h3>
  <p className="text-body-md">You're crushing it! 💪</p>
</div>
```

### Form Input
```jsx
<label htmlFor="email">Email</label>
<input id="email" type="email" className="transition-colors" />
<button className="btn btn-primary w-full">Sign In</button>
```

### Modal/Dialog
```jsx
<div className="modal-backdrop">
  <div className="modal-content">
    <h2 className="text-h2">Upgrade to Pro</h2>
    <p className="text-body-md">Get premium features</p>
    <button className="btn btn-primary">Start Free Trial</button>
  </div>
</div>
```

### Progress Display
```jsx
<div>
  <div className="metric-label">Sessions Left</div>
  <div className="metric-value">8 / 10</div>
</div>
<div className="progress">
  <div className="progress-bar" style={{width: '80%'}} />
</div>
```

### Badge/Tag
```jsx
<span className="badge badge-success">✓ Active</span>
<span className="tag">Strength Training</span>
```

### Loading State
```jsx
<div className="skeleton skeleton-card" />
<div className="spinner" />
```

---

## 2. Typography Cheat Sheet

| Use Case | Class | Example |
|----------|-------|---------|
| Page Title | `text-h1` | H1 (32px, bold) |
| Section Title | `text-h2` | H2 (25px, bold) |
| Subsection | `text-h3` | H3 (20px, semibold) |
| Body Text | `text-body-md` | Regular paragraph |
| Small Text | `text-body-sm` | Secondary info |
| Tiny Text | `text-body-2xs` | Captions |
| Data/Number | `text-data-lg` | 42.5 (monospace) |
| Label | `text-label-md` | SESSIONS REMAINING |

```jsx
<h1 className="text-h1">Welcome Back</h1>
<p className="text-body-md">Your progress today</p>
<span className="text-label-md">Total XP</span>
<div className="metric-value">42.5</div>
```

---

## 3. Color Classes

### Semantic Colors (Most Common)
```jsx
// Text colors
<p className="text-white">White text</p>
<p className="text-neutral-400">Gray text (secondary)</p>
<p className="text-accent-300">Mint text (highlight)</p>

// Background colors
<div className="bg-bg-dark">Dark page bg</div>
<div className="bg-primary-700">Forest green bg</div>
<div className="bg-accent-300">Mint bg</div>

// Border colors
<div className="border border-primary-700">Green border</div>
<div className="border border-neutral-400">Gray border</div>
```

---

## 4. Animations (Most Common)

```jsx
// Fade in smoothly
<div className="animate-fade-in">Appears</div>

// Slide up (modals, toasts)
<div className="animate-slide-in-up">Modal content</div>

// Scale in (cards)
<div className="animate-scale-in">New card</div>

// Staggered list items
<div className="stagger-children">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
  <div className="card">Item 3</div>
</div>

// Badge unlock celebration
<div className="animate-badge-unlock">🏆 Achievement!</div>
```

---

## 5. Spacing Quick Reference

```jsx
// Margin (push away from others)
<div className="m-4">4 units (16px)</div>
<div className="mt-6">Top margin (24px)</div>
<div className="mb-8">Bottom margin (32px)</div>

// Padding (internal space)
<div className="p-6">16px padding all sides</div>
<div className="px-4">Horizontal padding</div>

// Gap (space between flex items)
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Space between (vertical stacking)
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## 6. Responsive Design

```jsx
// Mobile: 1 column, Desktop: 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
</div>

// Full width on mobile, auto on desktop
<button className="btn btn-primary w-full md:w-auto">
  Submit
</button>

// Hide on mobile, show on desktop
<div className="hidden md:block">
  Desktop-only content
</div>

// Show on mobile, hide on desktop
<div className="md:hidden">
  Mobile-only content
</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  More padding on larger screens
</div>
```

---

## 7. Real Page Examples

### Login Page
```jsx
import { Zap } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark to-bg-darker flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary-700 p-3 rounded-lg">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-h1">
            <span className="text-primary-700">Brazil</span>
            <span className="text-warm-500">Fit</span>
          </h1>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label>Username</label>
            <input type="text" placeholder="Enter username" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Client Dashboard
```jsx
export default function ClientHome() {
  return (
    <div className="space-y-6 p-6">
      {/* Greeting */}
      <h1 className="text-h1">Good Evening, Sarah</h1>

      {/* Next Session Card */}
      <div className="card-elevated">
        <h2 className="text-h3">Next Session</h2>
        <p className="text-body-md text-neutral-400">
          Tuesday, 6:00 PM — Strength Training
        </p>
        <button className="btn btn-primary btn-sm mt-4">
          Add to Calendar
        </button>
      </div>

      {/* Progress Card */}
      <div className="card">
        <div className="flex justify-between mb-4">
          <div>
            <div className="metric-label">Sessions Left</div>
            <div className="text-h2 text-accent-300">8 / 10</div>
          </div>
          <div className="text-right">
            <div className="text-body-2xs text-neutral-400">Progress</div>
            <div className="text-h3">80%</div>
          </div>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{width: '80%'}} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 stagger-children">
        <div className="card-interactive">
          <h4 className="text-h5">Sessions</h4>
        </div>
        <div className="card-interactive">
          <h4 className="text-h5">Progress</h4>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Pro Tips

### Tip 1: Always Use Semantic Classes
```jsx
// ✅ Good: Semantic
<button className="btn btn-primary">Submit</button>

// ❌ Avoid: Random colors
<button style={{backgroundColor: '#27AE60'}}>Submit</button>
```

### Tip 2: Spacing Consistency
```jsx
// ✅ Good: Consistent spacing
<div className="card">
  <h3 className="text-h3 mb-3">Title</h3>
  <p className="text-body-md">Content</p>
</div>

// ❌ Avoid: Random margins
<div className="card" style={{marginBottom: '23px'}}>...</div>
```

### Tip 3: Mobile First
```jsx
// ✅ Good: Mobile first, scale up
<button className="btn btn-primary w-full md:w-auto">
  Submit
</button>

// ❌ Avoid: Desktop first
<button className="btn btn-primary hidden md:inline">
  Submit
</button>
```

### Tip 4: Use Animations for Feedback
```jsx
// ✅ Good: Reveal content with animation
<div className="animate-fade-in">
  Welcome!
</div>

// ✅ Good: Show loading
<div className="spinner" />

// ❌ Avoid: Content appears instantly (feels janky)
```

### Tip 5: Focus Rings Always Visible
```jsx
// ✅ Built-in: Focus rings are automatic
<button className="btn btn-primary">Submit</button>

// ✅ Manual: For custom elements
<input type="text" className="focus:outline-2 focus:outline-accent-300" />
```

---

## 9. Before You Ship a Page

Verify these 5 things:

```jsx
// 1. Colors are from design system (not custom colors)
<div className="bg-primary-700">✅</div>  // Good
<div style={{backgroundColor: '#123456'}}>❌</div>  // Bad

// 2. Typography uses correct classes
<h1 className="text-h1">✅</h1>  // Good
<h1 style={{fontSize: '32px'}}>❌</h1>  // Bad

// 3. Buttons have hover state visible
<button className="btn btn-primary">✅</button>  // Hover works

// 4. Mobile responsive works
<button className="w-full md:w-auto">✅</button>  // Responsive

// 5. Focus rings are visible
<input type="text" />  // ✅ Built-in focus ring
```

---

## 10. Common Patterns

### Form with Validation
```jsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  if (!email.includes('@')) {
    setError('Invalid email');
  } else {
    setError('');
    // Submit
  }
};

return (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={error ? 'error' : ''}
      />
      {error && (
        <span className="text-error-500 text-body-2xs">{error}</span>
      )}
    </div>
    <button type="submit" className="btn btn-primary w-full">
      Sign In
    </button>
  </form>
);
```

### Card List with Stagger Animation
```jsx
const items = [{id: 1, ...}, {id: 2, ...}];

return (
  <div className="stagger-children">
    {items.map(item => (
      <div key={item.id} className="card">
        <h3 className="text-h4">{item.title}</h3>
        <p className="text-body-sm text-neutral-400">{item.description}</p>
      </div>
    ))}
  </div>
);
```

### Modal with Overlay
```jsx
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
      Open Modal
    </button>

    {isOpen && (
      <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-h2">Title</h2>
          <p className="text-body-md">Content</p>
          <button className="btn btn-primary" onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
      </div>
    )}
  </>
);
```

---

## 11. File Structure

```
frontend/
├── src/
│   ├── styles/
│   │   ├── typography.css      ← Font sizes, weights, scales
│   │   ├── motion.css          ← Animations, transitions
│   │   └── components.css      ← Button, card, form styles
│   ├── index.css               ← Imports all above + Tailwind
│   ├── pages/
│   │   ├── Login.jsx           ← Update with new design
│   │   └── client/
│   │       └── ClientHome.jsx  ← Update with new design
│   └── ...
├── tailwind.config.js          ← Color tokens, spacing
├── index.html                  ← Font imports
├── DESIGN_SYSTEM.md            ← Full spec (read when questions)
├── IMPLEMENTATION_GUIDE.md     ← 50+ code examples
└── QUICK_START.md              ← You are here
```

---

## 12. Still Stuck?

### "What color should I use?"
→ For primary actions: `bg-primary-700` (forest green)  
→ For accents/energy: `bg-accent-300` (mint)  
→ For text: `text-white` or `text-neutral-400`  
→ See `tailwind.config.js` for full color palette

### "What size should this be?"
→ Read `DESIGN_SYSTEM.md` → Typography section  
→ Use classes: `text-h1`, `text-body-md`, `text-label-md`

### "Why does it look wrong?"
→ You're probably not using design system classes  
→ Check `IMPLEMENTATION_GUIDE.md` for examples

### "How do I make it move?"
→ Add animation classes: `animate-fade-in`, `animate-slide-in-up`, `stagger-children`

### "Is it accessible?"
→ Yes! All colors pass WCAG AA, focus rings work, keyboard nav supported

---

## 🚀 You're Ready!

Go build something beautiful. Start with Login, then Client Dashboard. 

Copy-paste the examples above. It'll look premium automatically.

Questions? Read `DESIGN_SYSTEM.md` or `IMPLEMENTATION_GUIDE.md`.

Happy coding! 💚
