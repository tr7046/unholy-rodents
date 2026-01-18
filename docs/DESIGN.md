# Unholy Rodents - Website System Design

## Project Overview

**Band:** Unholy Rodents
**Genre:** Thrash Punk
**Project Code:** UR
**Deployment:** Vercel (Frontend) + Railway (Backend)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UNHOLY RODENTS WEB                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    VERCEL (Frontend)                         │   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │              Next.js 14 (App Router)                    ││   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ ││   │
│  │  │  │   Home   │ │  Shows   │ │  Music   │ │   Merch    │ ││   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘ ││   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ ││   │
│  │  │  │   Bio    │ │  Media   │ │ Contact  │ │   Admin    │ ││   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘ ││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  │                              │                               │   │
│  │                    Vercel Edge Functions                     │   │
│  └──────────────────────────────┼───────────────────────────────┘   │
│                                 │                                   │
│                          HTTPS/REST                                 │
│                                 │                                   │
│  ┌──────────────────────────────┼───────────────────────────────┐   │
│  │                    RAILWAY (Backend)                          │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │                 Node.js API Server                      │ │   │
│  │  │           (Express/Fastify + TypeScript)                │ │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │ │   │
│  │  │  │  Auth    │ │  Shows   │ │  Media   │ │   Merch    │ │ │   │
│  │  │  │  Routes  │ │  Routes  │ │  Routes  │ │   Routes   │ │ │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                              │                                │   │
│  │  ┌───────────────┐    ┌─────┴─────┐    ┌──────────────────┐  │   │
│  │  │  PostgreSQL   │    │   Redis   │    │  File Storage    │  │   │
│  │  │   (Railway)   │    │  (Cache)  │    │  (Cloudinary/S3) │  │   │
│  │  └───────────────┘    └───────────┘    └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL INTEGRATIONS                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐   │   │
│  │  │Instagram │ │ Facebook │ │ Spotify  │ │  Bandcamp      │   │   │
│  │  │   API    │ │   API    │ │   API    │ │  Embed         │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                      │   │
│  │  │  Stripe  │ │ Mailchimp│ │ YouTube  │                      │   │
│  │  │ Payments │ │  Email   │ │  Embed   │                      │   │
│  │  └──────────┘ └──────────┘ └──────────┘                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Visual Design System

### Brand Identity - Thrash Punk Aesthetic

**Color Palette:**
```css
:root {
  /* Primary - Aggressive & Raw */
  --blood-red: #8B0000;
  --neon-green: #39FF14;      /* Classic punk accent */
  --warning-yellow: #FFD700;

  /* Base - Gritty & Dark */
  --void-black: #0A0A0A;
  --asphalt-gray: #1A1A1A;
  --concrete: #2D2D2D;
  --dirty-white: #E5E5E5;

  /* Accents */
  --rust: #B7410E;
  --toxic-purple: #9400D3;
  --electric-blue: #00BFFF;
}
```

**Typography:**
- **Headlines:** "Bebas Neue" or "Anton" (bold, condensed, aggressive)
- **Body:** "Space Mono" or "IBM Plex Mono" (raw, readable)
- **Accent:** Hand-drawn/distressed font for special elements

**Design Elements:**
- Distressed/grunge textures
- Halftone patterns
- Diagonal cuts and slashes
- Spray paint/stencil effects
- VHS/CRT scan line overlays
- Aggressive angles (no soft curves)
- High contrast imagery
- DIY zine aesthetic

---

## 3. Page Structure & Features

### Phase 1 - Core Launch

#### Home Page
- Hero section with band photo/video background
- Animated logo reveal
- Next show highlight banner
- Latest release feature
- Social feed integration
- Mailing list signup

#### Shows/Tour Page
- Interactive map with tour dates
- Upcoming shows with ticket links
- Past shows archive
- Venue information
- "Request a show in your city" form

#### Music Page
- Embedded players (Spotify, Bandcamp, Apple Music)
- Discography with album artwork
- Lyrics viewer
- Download links for press kit

#### Media/Gallery
- Photo galleries (pulled from Instagram)
- Music videos (YouTube embeds)
- Press photos download
- Flyer archive

#### Bio/About
- Band story and history
- Individual member profiles
- Influences and gear
- Press quotes

#### Contact
- Booking inquiry form
- Press contact
- Social links
- Mailing list

### Phase 2 - Growth Features

#### Merch Store
- Product listings with variants
- Shopping cart
- Stripe checkout
- Order tracking
- Inventory management

#### Fan Community
- Mailing list with segmentation
- Exclusive content area
- Pre-sale access
- Fan photo submissions

#### Admin Dashboard
- Show management
- Content management
- Media uploads
- Analytics dashboard
- Email campaign management

### Phase 3 - Advanced

- Live show streaming integration
- Fan forum/community
- Crowdfunding for albums/tours
- Podcast/video series section
- Setlist archive with history

---

## 4. Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     shows       │       │    venues       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────▶│ id (PK)         │
│ venue_id (FK)   │       │ name            │
│ date            │       │ address         │
│ doors_time      │       │ city            │
│ start_time      │       │ state           │
│ ticket_url      │       │ country         │
│ ticket_price    │       │ capacity        │
│ age_restriction │       │ website         │
│ status          │       │ lat/lng         │
│ notes           │       │ created_at      │
│ created_at      │       └─────────────────┘
│ updated_at      │
└─────────────────┘       ┌─────────────────┐
                          │    releases     │
┌─────────────────┐       ├─────────────────┤
│   show_bands    │       │ id (PK)         │
├─────────────────┤       │ title           │
│ id (PK)         │       │ type            │
│ show_id (FK)    │       │ release_date    │
│ band_name       │       │ cover_art_url   │
│ set_order       │       │ spotify_url     │
│ is_headliner    │       │ bandcamp_url    │
└─────────────────┘       │ apple_music_url │
                          │ description     │
┌─────────────────┐       │ created_at      │
│     tracks      │       └─────────────────┘
├─────────────────┤              │
│ id (PK)         │              │
│ release_id (FK) │◀─────────────┘
│ title           │
│ track_number    │
│ duration        │
│ lyrics          │
│ spotify_id      │
│ preview_url     │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     media       │       │   media_tags    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────▶│ id (PK)         │
│ type            │       │ media_id (FK)   │
│ url             │       │ tag             │
│ thumbnail_url   │       └─────────────────┘
│ title           │
│ description     │       ┌─────────────────┐
│ credit          │       │    members      │
│ show_id (FK)    │       ├─────────────────┤
│ created_at      │       │ id (PK)         │
└─────────────────┘       │ name            │
                          │ role            │
┌─────────────────┐       │ bio             │
│   subscribers   │       │ photo_url       │
├─────────────────┤       │ is_active       │
│ id (PK)         │       │ joined_date     │
│ email           │       │ gear            │
│ name            │       │ social_links    │
│ subscribed_at   │       └─────────────────┘
│ source          │
│ is_active       │       ┌─────────────────┐
│ preferences     │       │   press_kit     │
└─────────────────┘       ├─────────────────┤
                          │ id (PK)         │
┌─────────────────┐       │ type            │
│    products     │       │ file_url        │
├─────────────────┤       │ description     │
│ id (PK)         │       │ created_at      │
│ name            │       └─────────────────┘
│ description     │
│ price           │       ┌─────────────────┐
│ category        │       │   admin_users   │
│ images          │       ├─────────────────┤
│ is_active       │       │ id (PK)         │
│ created_at      │       │ email           │
└─────────────────┘       │ password_hash   │
        │                 │ role            │
        │                 │ created_at      │
        ▼                 └─────────────────┘
┌─────────────────┐
│ product_variants│       ┌─────────────────┐
├─────────────────┤       │  contact_forms  │
│ id (PK)         │       ├─────────────────┤
│ product_id (FK) │       │ id (PK)         │
│ size            │       │ type            │
│ color           │       │ name            │
│ sku             │       │ email           │
│ stock           │       │ message         │
│ price_override  │       │ status          │
└─────────────────┘       │ created_at      │
                          └─────────────────┘
```

---

## 5. API Specification

### Base URL
- **Production:** `https://api.unholyrodents.com`
- **Staging:** `https://api-staging.unholyrodents.com`

### Public Endpoints (No Auth)

```
GET  /api/v1/shows                    # List upcoming shows
GET  /api/v1/shows/:id                # Single show details
GET  /api/v1/shows/past               # Past shows archive
GET  /api/v1/releases                 # All releases
GET  /api/v1/releases/:id             # Single release with tracks
GET  /api/v1/media                    # Media gallery
GET  /api/v1/media/:id                # Single media item
GET  /api/v1/members                  # Band members
GET  /api/v1/press-kit                # Press kit files
POST /api/v1/contact                  # Submit contact form
POST /api/v1/subscribe                # Mailing list signup
GET  /api/v1/products                 # Merch products (Phase 2)
```

### Admin Endpoints (Auth Required)

```
POST   /api/v1/auth/login             # Admin login
POST   /api/v1/auth/logout            # Admin logout
GET    /api/v1/auth/me                # Current admin user

# Shows Management
POST   /api/v1/admin/shows            # Create show
PUT    /api/v1/admin/shows/:id        # Update show
DELETE /api/v1/admin/shows/:id        # Delete show

# Releases Management
POST   /api/v1/admin/releases         # Create release
PUT    /api/v1/admin/releases/:id     # Update release
DELETE /api/v1/admin/releases/:id     # Delete release

# Media Management
POST   /api/v1/admin/media            # Upload media
PUT    /api/v1/admin/media/:id        # Update media
DELETE /api/v1/admin/media/:id        # Delete media

# Subscribers
GET    /api/v1/admin/subscribers      # List subscribers
DELETE /api/v1/admin/subscribers/:id  # Remove subscriber

# Contact Forms
GET    /api/v1/admin/contacts         # List submissions
PUT    /api/v1/admin/contacts/:id     # Update status

# Products (Phase 2)
POST   /api/v1/admin/products         # Create product
PUT    /api/v1/admin/products/:id     # Update product
DELETE /api/v1/admin/products/:id     # Delete product
```

---

## 6. Project Structure

```
UR/
├── frontend/                     # Next.js App (Vercel)
│   ├── app/
│   │   ├── (public)/            # Public routes
│   │   │   ├── page.tsx         # Home
│   │   │   ├── shows/
│   │   │   ├── music/
│   │   │   ├── media/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── merch/
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── shows/
│   │   │   ├── releases/
│   │   │   ├── media/
│   │   │   └── subscribers/
│   │   ├── api/                 # Next.js API routes (minimal)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── home/                # Home page components
│   │   │   ├── Hero.tsx
│   │   │   ├── NextShow.tsx
│   │   │   ├── LatestRelease.tsx
│   │   │   └── SocialFeed.tsx
│   │   ├── shows/               # Shows components
│   │   │   ├── ShowCard.tsx
│   │   │   ├── ShowMap.tsx
│   │   │   └── ShowList.tsx
│   │   ├── music/               # Music components
│   │   │   ├── AlbumCard.tsx
│   │   │   ├── TrackList.tsx
│   │   │   └── Player.tsx
│   │   └── effects/             # Visual effects
│   │       ├── GlitchText.tsx
│   │       ├── Scanlines.tsx
│   │       └── NoiseOverlay.tsx
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useShows.ts
│   │   ├── useReleases.ts
│   │   └── useMedia.ts
│   ├── styles/
│   │   ├── variables.css
│   │   └── animations.css
│   ├── public/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── textures/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                      # Node.js API (Railway)
│   ├── src/
│   │   ├── index.ts             # Entry point
│   │   ├── app.ts               # Express app setup
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── shows.ts
│   │   │   ├── releases.ts
│   │   │   ├── media.ts
│   │   │   ├── members.ts
│   │   │   ├── contact.ts
│   │   │   ├── subscribe.ts
│   │   │   └── admin/
│   │   │       ├── index.ts
│   │   │       ├── auth.ts
│   │   │       ├── shows.ts
│   │   │       ├── releases.ts
│   │   │       └── media.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validation.ts
│   │   ├── services/
│   │   │   ├── email.ts
│   │   │   ├── storage.ts
│   │   │   ├── instagram.ts
│   │   │   └── stripe.ts
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── helpers.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── package.json
│
├── shared/                       # Shared types/utilities
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── index.ts
│
├── docs/                         # Documentation
│   ├── DESIGN.md                # This file
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── .github/
│   └── workflows/
│       ├── frontend-deploy.yml
│       └── backend-deploy.yml
│
├── .gitignore
├── README.md
└── package.json                  # Monorepo root (optional)
```

---

## 7. Tech Stack Summary

### Frontend (Vercel)
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| React Query | Data fetching/caching |
| Zustand | State management |

### Backend (Railway)
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express/Fastify | API framework |
| TypeScript | Type safety |
| Prisma | ORM |
| PostgreSQL | Database |
| Redis | Caching/sessions |

### External Services
| Service | Purpose |
|---------|---------|
| Cloudinary | Image/video hosting |
| Stripe | Payments (Phase 2) |
| Mailchimp/Resend | Email marketing |
| Vercel Analytics | Frontend analytics |

---

## 8. Deployment Configuration

### Vercel (Frontend)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_INSTAGRAM_TOKEN": "@instagram-token"
  }
}
```

### Railway (Backend)
```yaml
# railway.toml
[build]
  builder = "dockerfile"
  dockerfilePath = "./Dockerfile"

[deploy]
  healthcheckPath = "/health"
  healthcheckTimeout = 300
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 10
```

---

## 9. Growth Roadmap

### Phase 1 - Launch (MVP)
- [ ] Core pages (Home, Shows, Music, About, Contact)
- [ ] Admin dashboard for content management
- [ ] Mailing list integration
- [ ] Social media embeds
- [ ] Basic SEO

### Phase 2 - E-Commerce
- [ ] Merch store with Stripe
- [ ] Order management
- [ ] Inventory tracking
- [ ] Email notifications

### Phase 3 - Community
- [ ] Fan accounts
- [ ] Exclusive content
- [ ] Pre-sale access
- [ ] Fan submissions

### Phase 4 - Advanced
- [ ] Live streaming integration
- [ ] Podcast/video series
- [ ] Mobile app (React Native)
- [ ] Advanced analytics

---

## 10. Security Considerations

- HTTPS everywhere
- JWT authentication for admin
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable management
- Regular dependency updates
- Database backups (Railway automatic)

---

**Design Version:** 1.0
**Last Updated:** 2026-01-17
**Author:** Claude Code
