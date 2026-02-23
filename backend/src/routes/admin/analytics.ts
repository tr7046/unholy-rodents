import { Router, Request, Response } from 'express';
import { prisma } from '../../db';

const router = Router();

// Type-safe prisma access for new models (types generated at build time)
const db = prisma as any;

// GET /admin/analytics/overview - Dashboard overview stats
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      totalPageViews,
      totalPlays,
      recentPageViews,
      recentPlays,
      uniqueVisitors,
    ] = await Promise.all([
      db.pageView.count(),
      db.trackPlay.count(),
      db.pageView.count({ where: { createdAt: { gte: since } } }),
      db.trackPlay.count({ where: { createdAt: { gte: since } } }),
      db.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: since }, sessionId: { not: null } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalPageViews,
        totalPlays,
        recentPageViews,
        recentPlays,
        uniqueVisitors: (uniqueVisitors as any[]).length,
        period: days,
      },
    });
  } catch (error) {
    console.error('[admin/analytics] overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics overview' });
  }
});

// GET /admin/analytics/pageviews - Page view trends
router.get('/pageviews', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get daily page view counts using raw SQL for date grouping
    const dailyViews = await prisma.$queryRawUnsafe<
      { date: string; count: string }[]
    >(
      `SELECT DATE(created_at) as date, COUNT(*)::text as count
       FROM page_views
       WHERE created_at >= $1
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      since
    );

    // Top pages
    const topPages: any[] = await db.pageView.groupBy({
      by: ['path'],
      _count: { id: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    // Top referrers
    const topReferrers: any[] = await db.pageView.groupBy({
      by: ['referrer'],
      _count: { id: true },
      where: {
        createdAt: { gte: since },
        referrer: { not: null },
      },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        daily: dailyViews.map((d) => ({
          date: d.date,
          views: parseInt(d.count),
        })),
        topPages: topPages.map((p: any) => ({
          path: p.path,
          views: p._count.id,
        })),
        topReferrers: topReferrers
          .filter((r: any) => r.referrer)
          .map((r: any) => ({
            referrer: r.referrer,
            views: r._count.id,
          })),
      },
    });
  } catch (error) {
    console.error('[admin/analytics] pageviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch page view data' });
  }
});

// GET /admin/analytics/plays - Track play analytics
router.get('/plays', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Daily play counts
    const dailyPlays = await prisma.$queryRawUnsafe<
      { date: string; count: string }[]
    >(
      `SELECT DATE(created_at) as date, COUNT(*)::text as count
       FROM track_plays
       WHERE created_at >= $1
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      since
    );

    // Top tracks
    const topTracks: any[] = await db.trackPlay.groupBy({
      by: ['trackId', 'trackName'],
      _count: { id: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    // Top releases
    const topReleases: any[] = await db.trackPlay.groupBy({
      by: ['releaseId', 'releaseName'],
      _count: { id: true },
      where: {
        createdAt: { gte: since },
        releaseId: { not: null },
      },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Total plays all time
    const totalPlays = await db.trackPlay.count();

    res.json({
      success: true,
      data: {
        daily: dailyPlays.map((d) => ({
          date: d.date,
          plays: parseInt(d.count),
        })),
        topTracks: topTracks.map((t: any) => ({
          trackId: t.trackId,
          trackName: t.trackName,
          plays: t._count.id,
        })),
        topReleases: topReleases
          .filter((r: any) => r.releaseId)
          .map((r: any) => ({
            releaseId: r.releaseId,
            releaseName: r.releaseName,
            plays: r._count.id,
          })),
        totalPlays,
      },
    });
  } catch (error) {
    console.error('[admin/analytics] plays error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch play data' });
  }
});

// GET /admin/analytics/realtime - Recent activity
router.get('/realtime', async (_req: Request, res: Response) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [activeNow, lastHourViews, lastHourPlays, recentPlays] = await Promise.all([
      db.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: fiveMinAgo }, sessionId: { not: null } },
      }),
      db.pageView.count({ where: { createdAt: { gte: oneHourAgo } } }),
      db.trackPlay.count({ where: { createdAt: { gte: oneHourAgo } } }),
      db.trackPlay.findMany({
        where: { createdAt: { gte: oneHourAgo } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          trackName: true,
          releaseName: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        activeVisitors: (activeNow as any[]).length,
        lastHourViews,
        lastHourPlays,
        recentPlays,
      },
    });
  } catch (error) {
    console.error('[admin/analytics] realtime error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch realtime data' });
  }
});

export default router;
