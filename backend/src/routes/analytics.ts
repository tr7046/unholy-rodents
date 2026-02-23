import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// Type-safe prisma access for new models (types generated at build time)
const db = prisma as any;

// POST /analytics/pageview - Record a page view
router.post('/pageview', async (req: Request, res: Response) => {
  try {
    const { path, referrer, sessionId } = req.body;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ success: false, error: 'path is required' });
    }

    await db.pageView.create({
      data: {
        path: path.slice(0, 500),
        referrer: referrer ? String(referrer).slice(0, 1000) : null,
        userAgent: (req.headers['user-agent'] || '').slice(0, 500) || null,
        ip: (req.ip || req.headers['x-forwarded-for'] as string || '').slice(0, 45) || null,
        sessionId: sessionId ? String(sessionId).slice(0, 100) : null,
      },
    });

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

    await db.trackPlay.create({
      data: {
        trackId: String(trackId).slice(0, 200),
        trackName: String(trackName).slice(0, 500),
        releaseId: releaseId ? String(releaseId).slice(0, 200) : null,
        releaseName: releaseName ? String(releaseName).slice(0, 500) : null,
        sessionId: sessionId ? String(sessionId).slice(0, 100) : null,
        ip: (req.ip || req.headers['x-forwarded-for'] as string || '').slice(0, 45) || null,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[analytics] play error:', error);
    res.status(500).json({ success: false, error: 'Failed to record play' });
  }
});

// GET /analytics/plays - Get play counts (public, for displaying on music pages)
router.get('/plays', async (_req: Request, res: Response) => {
  try {
    // Get total plays per track
    const trackPlays: any[] = await db.trackPlay.groupBy({
      by: ['trackId', 'trackName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Get total plays per release
    const releasePlays: any[] = await db.trackPlay.groupBy({
      by: ['releaseId', 'releaseName'],
      _count: { id: true },
      where: { releaseId: { not: null } },
      orderBy: { _count: { id: 'desc' } },
    });

    const tracks: Record<string, number> = {};
    for (const t of trackPlays) {
      tracks[t.trackId] = t._count.id;
    }

    const releases: Record<string, number> = {};
    for (const r of releasePlays) {
      if (r.releaseId) {
        releases[r.releaseId] = r._count.id;
      }
    }

    res.json({ tracks, releases });
  } catch (error) {
    console.error('[analytics] plays error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch play counts' });
  }
});

export default router;
