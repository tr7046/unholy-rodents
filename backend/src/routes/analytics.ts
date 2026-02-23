import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { randomUUID } from 'crypto';

const router = Router();

// POST /analytics/pageview - Record a page view
router.post('/pageview', async (req: Request, res: Response) => {
  try {
    const { path, referrer, sessionId } = req.body;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ success: false, error: 'path is required' });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO page_views (id, path, referrer, user_agent, ip, session_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      randomUUID(),
      path.slice(0, 500),
      referrer ? String(referrer).slice(0, 1000) : null,
      (req.headers['user-agent'] || '').slice(0, 500) || null,
      (req.ip || req.headers['x-forwarded-for'] as string || '').slice(0, 45) || null,
      sessionId ? String(sessionId).slice(0, 100) : null,
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[analytics] pageview error:', error);
    res.status(500).json({ success: false, error: 'Failed to record page view' });
  }
});

// POST /analytics/play - Record a track play
router.post('/play', async (req: Request, res: Response) => {
  try {
    const { trackId, trackName, releaseId, releaseName, sessionId } = req.body;

    if (!trackId || !trackName) {
      return res.status(400).json({ success: false, error: 'trackId and trackName are required' });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO track_plays (id, track_id, track_name, release_id, release_name, session_id, ip, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      randomUUID(),
      String(trackId).slice(0, 200),
      String(trackName).slice(0, 500),
      releaseId ? String(releaseId).slice(0, 200) : null,
      releaseName ? String(releaseName).slice(0, 500) : null,
      sessionId ? String(sessionId).slice(0, 100) : null,
      (req.ip || req.headers['x-forwarded-for'] as string || '').slice(0, 45) || null,
    );

    res.json({ success: true });
  } catch (error) {
    console.error('[analytics] play error:', error);
    res.status(500).json({ success: false, error: 'Failed to record play' });
  }
});

// GET /analytics/plays - Get play counts (public, for displaying on music pages)
router.get('/plays', async (_req: Request, res: Response) => {
  try {
    const trackPlays = await prisma.$queryRawUnsafe<{ track_id: string; count: string }[]>(
      `SELECT track_id, COUNT(*)::text as count FROM track_plays GROUP BY track_id ORDER BY COUNT(*) DESC`
    );

    const releasePlays = await prisma.$queryRawUnsafe<{ release_id: string; count: string }[]>(
      `SELECT release_id, COUNT(*)::text as count FROM track_plays WHERE release_id IS NOT NULL GROUP BY release_id ORDER BY COUNT(*) DESC`
    );

    const tracks: Record<string, number> = {};
    for (const t of trackPlays) {
      tracks[t.track_id] = parseInt(t.count);
    }

    const releases: Record<string, number> = {};
    for (const r of releasePlays) {
      releases[r.release_id] = parseInt(r.count);
    }

    res.json({ tracks, releases });
  } catch (error) {
    console.error('[analytics] plays error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch play counts' });
  }
});

export default router;
