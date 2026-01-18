# Unholy Rodents Website Redesign Specification

## Design Philosophy

**"Brutal Zine Crossover"** - Merging three aesthetic directions:
1. **Brutal Minimalism**: Stark contrasts, heavy typography, negative space
2. **DIY Zine Aesthetic**: Photocopied textures, torn edges, raw authenticity
3. **Crossover Thrash Functionality**: Clean navigation, show-focused, professional underground

---

## Color Palette

### Primary Colors
```css
--void-black: #0a0a0a;        /* Deep black - primary background */
--paper-white: #f5f5f0;       /* Off-white - like aged paper */
--blood-red: #c41e3a;         /* Cardinal red - primary accent */
```

### Secondary Colors
```css
--charcoal: #1a1a1a;          /* Lighter black for cards/sections */
--concrete: #888888;          /* Muted text, borders */
--cream: #ebe8df;             /* Softer white for contrast areas */
```

### Accent States
```css
--blood-red-bright: #e63946;  /* Hover states */
--blood-red-dark: #8b0000;    /* Active/pressed states */
```

### Usage Rules
- **Background**: 90% void-black, 10% charcoal for section breaks
- **Text**: paper-white for headings, cream for body
- **Accents**: blood-red ONLY for interactive elements, tags, and emphasis
- **NO gradients** - flat colors only
- **NO neon/glow effects** - raw and direct

---

## Typography

### Font Stack
```css
/* Headlines - Bold, condensed, aggressive */
--font-display: 'Anton', 'Impact', 'Arial Black', sans-serif;

/* Body - Clean, readable, utilitarian */
--font-body: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;

/* Accent - Monospace for dates, tags, metadata */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;      /* 12px - tags, metadata */
--text-sm: 0.875rem;     /* 14px - captions */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.25rem;      /* 20px - lead text */
--text-xl: 1.5rem;       /* 24px - section headers */
--text-2xl: 2rem;        /* 32px - page titles */
--text-3xl: 3rem;        /* 48px - hero secondary */
--text-4xl: 4.5rem;      /* 72px - hero primary */
--text-5xl: 6rem;        /* 96px - mega display */
```

### Typography Rules
- Headlines: ALL CAPS, letter-spacing: 0.05em
- Body: Sentence case, line-height: 1.6
- **No italic** except for quotes
- **Heavy weight contrast**: 400 for body, 900 for headlines

---

## Layout System

### Grid
```css
/* 12-column grid with gutter */
--grid-columns: 12;
--grid-gutter: 1.5rem;
--container-max: 1200px;
--container-padding: 1rem;
```

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 1rem;      /* 16px */
--space-4: 1.5rem;    /* 24px */
--space-5: 2rem;      /* 32px */
--space-6: 3rem;      /* 48px */
--space-7: 4rem;      /* 64px */
--space-8: 6rem;      /* 96px */
```

### Section Structure
```
[HEADER - Fixed, minimal]
[HERO - Full viewport, impactful]
[DIVIDER - Torn paper edge SVG]
[CONTENT SECTIONS - Alternating black/charcoal]
[FOOTER - Compact, functional]
```

---

## Visual Elements

### Torn Paper Dividers
SVG-based torn edge effect between sections:
- Jagged, irregular top edge
- Slight overlap creating depth
- Subtle paper texture within

### Photocopied Texture Overlay
```css
.texture-photocopy {
  background-image: url('/textures/photocopy-grain.png');
  background-blend-mode: overlay;
  opacity: 0.08;
}
```

### Halftone Pattern
For image treatments:
- Convert band photos to high-contrast B&W
- Apply halftone dot pattern
- Red duotone option for featured images

### Stamp/Sticker Elements
For tags and labels:
- Slightly rotated (1-3 degrees)
- Rough, uneven borders
- "Pressed ink" texture effect

---

## Components

### Navigation Header
```
+----------------------------------------------------------+
|  [LOGO]                    SHOWS  MUSIC  ABOUT  CONTACT  |
+----------------------------------------------------------+
```
- Fixed position, transparent until scroll
- Logo: Raw text "UNHOLY RODENTS" or simple wordmark
- Links: Uppercase, spaced, underline on hover
- Mobile: Hamburger with full-screen overlay

### Hero Section
```
+----------------------------------------------------------+
|                                                          |
|                    UNHOLY                                |
|                    RODENTS                               |
|                                                          |
|         SQUIRRELCORE FROM CENTRAL FLORIDA                |
|                                                          |
|            [SEE SHOWS]    [LISTEN]                       |
|                                                          |
+----------------------------------------------------------+
```
- Full viewport height
- Massive typography, stacked
- Subtle animated grain texture
- Torn paper edge at bottom

### Show Card
```
+------------------------+
|  JAN    THE HAVEN      |
|  15     Orlando, FL    |
|  2024                  |
|         w/ Rat Attack  |
|         [TICKETS]      |
+------------------------+
```
- Date block: Large, red background
- Venue: Bold white
- Support acts: Smaller, gray
- Hover: Slight lift + red border glow

### Album/Release Card
```
+------------------------+
|  [ALBUM ART]           |
|                        |
|  ALBUM TITLE           |
|  2024 // 8 TRACKS      |
|                        |
|  [PLAY] [STREAM]       |
+------------------------+
```
- Square artwork with halftone treatment
- Minimal text below
- Hover: Red overlay with play icon

### Button Styles

**Primary (Red)**
```css
.btn-primary {
  background: var(--blood-red);
  color: var(--paper-white);
  padding: 0.75rem 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: none;
  position: relative;
  /* Rough edge effect via clip-path or SVG mask */
}
```

**Secondary (Outline)**
```css
.btn-secondary {
  background: transparent;
  color: var(--paper-white);
  border: 2px solid var(--paper-white);
  /* Same sizing as primary */
}
```

### Tags
```css
.tag {
  background: var(--blood-red);
  color: var(--paper-white);
  padding: 0.25rem 0.5rem;
  font-size: var(--text-xs);
  text-transform: uppercase;
  transform: rotate(-1deg);
  /* Slight shadow for "stuck on" effect */
}
```

---

## Animations

### Page Load Sequence
1. **0ms**: Black screen
2. **100ms**: Logo fades in (opacity 0 -> 1, 400ms ease-out)
3. **300ms**: Main headline slides up (translateY 20px -> 0, 500ms ease-out)
4. **500ms**: Subtitle fades in (opacity, 300ms)
5. **700ms**: CTA buttons fade in (opacity, 300ms)
6. **Continuous**: Subtle grain texture animation (CSS keyframes, 8fps flicker)

### Scroll Animations
```css
/* Fade up on scroll into view */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Hover States

**Links**
```css
a {
  position: relative;
}
a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--blood-red);
  transition: width 0.3s ease-out;
}
a:hover::after {
  width: 100%;
}
```

**Cards**
```css
.card {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(196, 30, 58, 0.3);
}
```

**Buttons**
```css
.btn {
  transition: transform 0.15s ease-out, background 0.15s ease-out;
}
.btn:hover {
  transform: scale(1.02);
}
.btn:active {
  transform: scale(0.98);
}
```

### Grain/Noise Animation
```css
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1%, -1%); }
  20% { transform: translate(1%, 1%); }
  30% { transform: translate(-1%, 1%); }
  40% { transform: translate(1%, -1%); }
  50% { transform: translate(-1%, 0); }
  60% { transform: translate(1%, 0); }
  70% { transform: translate(0, 1%); }
  80% { transform: translate(0, -1%); }
  90% { transform: translate(1%, 1%); }
}

.grain-overlay {
  animation: grain 0.5s steps(10) infinite;
}
```

### Text Reveal (Headlines)
```css
@keyframes text-reveal {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

.headline-animate {
  animation: text-reveal 0.8s ease-out forwards;
}
```

---

## Page Specifications

### Homepage
1. **Hero**: Full-screen, band name massive, torn edge bottom
2. **Next Show**: Featured show card with countdown if applicable
3. **Latest Release**: Album art + streaming links
4. **Instagram Feed**: 4-6 latest posts in grid (if available)
5. **Newsletter Signup**: Simple email form, "Join the Horde"

### Shows Page
1. **Header**: "SHOWS" large, subtext "Catch us live"
2. **Upcoming**: Cards in chronological order
3. **Past Shows**: Collapsed/archived, smaller format
4. **Booking CTA**: Contact for booking info

### Music Page
1. **Featured Release**: Large album art + full tracklist
2. **Discography**: Grid of releases
3. **Streaming Links**: Platform buttons
4. **Embedded Player**: Bandcamp or Spotify embed

### About Page
1. **Band Photo**: Full-width, halftone treatment
2. **Bio**: Compelling copy about squirrelcore origins
3. **Members**: Individual cards with photos
4. **Influences**: Tag cloud style

### Contact Page
1. **Booking/Press**: Clear contact info
2. **Social Links**: Large, prominent
3. **Contact Form**: Simple, functional

---

## Assets Needed

### Textures
- [ ] Photocopy grain texture (tileable PNG)
- [ ] Paper texture (subtle, for backgrounds)
- [ ] Halftone pattern overlay

### SVGs
- [ ] Torn paper edge divider
- [ ] Rough button edge mask
- [ ] Logo wordmark

### Fonts (Google Fonts)
- Anton (display)
- Space Grotesk (body)
- JetBrains Mono (code/mono)

### Images
- Band photos (to be processed with halftone/duotone)
- Album artwork
- Show flyers

---

## Technical Notes

### Framework
- Next.js 14 (App Router) - already in place
- Tailwind CSS - extend config with new design tokens
- Framer Motion - for advanced animations

### Performance
- Lazy load images below fold
- Preload critical fonts
- Minimize texture file sizes (WebP)
- CSS animations over JS where possible

### Accessibility
- Maintain color contrast ratios (red on black = 4.5:1 minimum)
- Respect prefers-reduced-motion
- Semantic HTML structure
- Focus states on all interactive elements

---

## Migration Plan

1. **Phase 1**: Update Tailwind config with new design tokens
2. **Phase 2**: Create new texture/SVG assets
3. **Phase 3**: Rebuild layout components (Header, Footer)
4. **Phase 4**: Redesign Hero section
5. **Phase 5**: Update all page components
6. **Phase 6**: Add animations with Framer Motion
7. **Phase 7**: Polish and test

---

*Praise Squatan. Hoard riffs. Stay feral.*
