# Music System Research Report
**Date:** 2026-02-22

---

## Executive Summary

Your site has a **complete music management admin panel** (add releases, upload cover art, manage tracks, configure streaming links) but **NO audio playback** — songs can't actually be played on your site. The system is metadata + external links only. Additionally, there is **no private/unlisted URL slug system** for pre-releases.

---

## Question 1: What are we set up to play songs with?

### Answer: Nothing. No audio player exists.

**Current state:**
- No audio library in `package.json` (no Howler.js, no WaveSurfer, no react-player)
- Play button icons on the music page are **purely decorative** — they don't do anything
- The music page just shows cover art, track listings, and links to external streaming platforms (Spotify, Apple Music, Bandcamp, YouTube)
- The `Track` model in Prisma has `previewUrl` and `spotifyId` fields, but **neither is used anywhere**

**What visitors see today:** Album art, track names/durations, and buttons that redirect to Spotify/Apple Music/etc. No embedded playback.

---

## Question 2: Where can I add songs in the admin portal?

### Answer: `/hailsquatan/music` — but it's metadata only, no audio upload.

**What the admin music page CAN do:**
- Create releases (album, EP, single) via "Drop a Banger" button
- Set release title, type, and date
- Upload cover art (image upload via Cloudinary)
- Add track listings (title + duration as text, e.g. "3:45")
- Configure streaming platform links (Spotify URL, Apple Music URL, etc.)
- Edit and delete releases
- Manage streaming platform list

**What it CANNOT do:**
- Upload actual audio files (mp3, wav, etc.)
- Play audio previews
- Host songs for streaming on your site
- Create private/unlisted release links

---

## Question 3: Where can I upload album art?

### Answer: Already works in the music admin page.

The release modal has an "Upload Image" button that:
- Uploads to Cloudinary under `unholy-rodents/media/`
- Shows a 128x128 preview in the form
- Stores the Cloudinary URL in the release's `coverArt` field
- Displays on the public music page

**Supported formats:** JPEG, PNG, GIF, WebP

---

## Question 4: Can I upload audio files?

### Answer: Not currently, but Cloudinary supports it.

**Current restrictions:**
- Frontend upload validation only allows image MIME types
- Backend `MediaType` enum only has: `photo`, `video`, `flyer` (no `audio`)
- No audio MIME type validation exists

**Cloudinary capabilities (already your host):**
- Supports MP3, OGG, WAV, AAC uploads
- Audio files use `resource_type: "video"` in the API (Cloudinary groups audio with video)
- 100MB file size limit per upload
- Can convert between audio formats on delivery
- Can optimize/compress audio automatically
- Your upload endpoint already uses `resource_type: 'auto'` — so audio would work if the frontend validation was removed

**What needs to change to enable audio upload:**
1. Add audio MIME types to upload validation (`audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/aac`)
2. Add `audio` to the `MediaType` enum (or just use the music release system)
3. Add an audio file input to the release/track form
4. Store the Cloudinary audio URL on the track

---

## Question 5: What should it play with? (Industry Standard)

### Recommended: Howler.js with a custom player component

**Why Howler.js:**
- Most popular audio library for web (2M+ weekly npm downloads)
- Works perfectly with Next.js/React
- Handles cross-browser compatibility, HTML5 Audio + Web Audio API fallback
- Supports seeking, volume, playlists, audio sprites
- Lightweight (~7KB gzipped)
- You get full control over the UI to match your dark/blood-red aesthetic

**Alternatives considered:**

| Library | Pros | Cons |
|---------|------|------|
| **Howler.js** | Full control, lightweight, battle-tested | Need to build custom UI |
| **@madzadev/audio-player** | Plug-and-play with playlist | Hard to match your custom aesthetic |
| **react-player** | Multi-platform (YouTube, SoundCloud) | Overkill if hosting on Cloudinary |
| **Vidstack** | Modern, accessible, modular | More complex setup |
| **react-h5-audio-player** | Simple, TypeScript | Limited customization |
| **Custom HTML5 `<audio>`** | Zero dependencies | Cross-browser issues, no playlist |

**Recommendation:** Howler.js — lets you build a player that matches your site's brand exactly while handling all the audio complexity under the hood.

---

## Question 6: Private URL Slug for Pre-Releases

### Answer: Does not exist. Needs to be built.

**Current routing:**
- Public music page: `/music` (shows all releases)
- No concept of "unlisted" or "private" releases
- No slug-based release URLs (everything is on one page)
- No individual release detail pages exist

**Industry standard approach:**

1. **Private/unlisted link pattern:** `/music/releases/{slug}` where the release has a `visibility` field:
   - `public` — shows on the main music page
   - `unlisted` — accessible via direct link only, not listed anywhere
   - `private` — requires a password or auth token

2. **Slug generation:** Auto-generate from release title (e.g., "Blood Moon EP" -> `blood-moon-ep`) with option to customize

3. **How bands typically do this:**
   - Upload the release with tracks to the admin panel
   - Set visibility to "unlisted"
   - Share the direct link (`yoursite.com/music/releases/blood-moon-ep`) with press, blogs, collaborators
   - When ready, flip to "public" and it appears on the main page
   - Blogs/press prefer **private SoundCloud links** or **direct playback links** over download links

4. **Pre-save pages:** Smart link pages where fans can pre-save before release day (services like [ListenTo](https://li.sten.to/), [iMusician Release Pages](https://imusician.pro/en/products/artist-hub/release-page))

---

## Architecture Recommendation

### What needs to be built:

**1. Audio Upload (extend existing Cloudinary system)**
- Allow audio MIME types in upload validation
- Add audio file input to release track form
- Store Cloudinary audio URL on each track
- Cloudinary delivers optimized streaming URLs automatically

**2. Audio Player Component (Howler.js)**
- Persistent bottom bar or inline player
- Play/pause, seek, volume, track progress
- Playlist support (play full album/EP)
- Mini-player that persists across page navigation
- Match your dark theme + blood red (#c41e3a) aesthetic

**3. Individual Release Pages**
- Route: `/music/releases/[slug]`
- Full release detail: cover art, track list with play buttons, streaming links, release notes
- Slug auto-generated from title, editable in admin

**4. Release Visibility System**
- Add `visibility` field to releases: `public` | `unlisted` | `private`
- Add `slug` field to releases (auto-generated, admin-editable)
- Public releases show on `/music` page
- Unlisted releases only accessible via direct `/music/releases/{slug}` link
- Private releases require a password (entered on the page)
- Admin UI: visibility dropdown in release form

**5. Admin Enhancements**
- Audio file upload per track (drag & drop or file picker)
- Audio preview in admin (play uploaded file to verify)
- Visibility toggle (public/unlisted/private)
- Shareable private link display + copy button
- Optional: password field for private releases

---

## File Impact Summary

| Area | Files to Create | Files to Modify |
|------|----------------|-----------------|
| Audio Player | 1 component | package.json |
| Release Pages | 1 page + 1 API route | music/page.tsx |
| Upload System | 0 | upload route, schemas |
| Visibility | 0 | music admin, music API, release schema |
| Private Slugs | 0 | release schema, music admin |

---

## Sources

- [Cloudinary Audio Support](https://support.cloudinary.com/hc/en-us/articles/115003361672-Can-I-upload-audio-files-to-my-Cloudinary-account)
- [Cloudinary Audio Transformations](https://cloudinary.com/documentation/audio_transformations)
- [Cloudinary Audio Optimization](https://cloudinary.com/documentation/audio_optimization)
- [Howler.js + Next.js Example](https://github.com/designly1/next-audio-player-example)
- [@madzadev/audio-player](https://github.com/madzadev/audio-player)
- [ListenTo Smart Links](https://li.sten.to/)
- [iMusician Release Pages](https://imusician.pro/en/products/artist-hub/release-page)
- [Bandzoogle Smart Links Guide](https://bandzoogle.com/blog/how-to-create-a-smart-link-for-your-music-release)
- [Pre-Release Strategies for Musicians](https://cyberprmusic.com/2024/02/13/pre-release-strategies-2/)
- [Cloudinary Audio Streaming with Web Audio API](https://cloudinary.com/blog/guest_post/building-a-music-streaming-app-with-web-audio-api-and-cloudinary)
