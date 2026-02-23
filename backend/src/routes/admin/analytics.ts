import { Router, Request, Response } from 'express';
import { prisma } from '../../db';

const router = Router();

// GET /admin/analytics/overview - Dashboard overview stats
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const stats = await prisma.$queryRawUnsafe<{
      total_page_views: string;
      total_plays: string;
      recent_page_views: string;
      recent_plays: string;
      unique_visitors: string;
    }[]>(
      `SELECT
        (SELECT COUNT(*) FROM page_views)::text AS total_page_views,
        (SELECT COUNT(*) FROM track_plays)::text AS total_plays,
        (SELECT COUNT(*) FROM page_views WHERE created_at >= NOW() - INTERVAL '1 day' * $1)::text AS recent_page_views,
        (SELECT COUNT(*) FROM track_plays WHERE created_at >= NOW() - INTERVAL '1 day' * $1)::text AS recent_plays,
        (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at >= NOW() - INTERVAL '1 day' * $1 AND session_id IS NOT NULL)::text AS unique_visitors`,
      days
    );

    const s = stats[0];

    res.json({
      success: true,
      data: {
        totalPageViews: parseInt(s.total_page_views),
        totalPlays: parseInt(s.total_plays),
        recentPageViews: parseInt(s.recent_page_views),
        recentPlays: parseInt(s.recent_plays),
        uniqueVisitors: parseInt(s.unique_visitors),
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

    const dailyViews = await prisma.$queryRawUnsafe<{ date: string; count: string }[]>(
      `SELECT DATE(created_at)::text as date, COUNT(*)::text as count
       FROM page_views
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      days
    );

    const topPages = await prisma.$queryRawUnsafe<{ path: string; count: string }[]>(
      `SELECT path, COUNT(*)::text as count
       FROM page_views
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY path
       ORDER BY COUNT(*) DESC
       LIMIT 20`,
      days
    );

    const topReferrers = await prisma.$queryRawUnsafe<{ referrer: string; count: string }[]>(
      `SELECT referrer, COUNT(*)::text as count
       FROM page_views
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1 AND referrer IS NOT NULL
       GROUP BY referrer
       ORDER BY COUNT(*) DESC
       LIMIT 10`,
      days
    );

    res.json({
      success: true,
      data: {
        daily: dailyViews.map((d) => ({
          date: d.date,
          views: parseInt(d.count),
        })),
        topPages: topPages.map((p) => ({
          path: p.path,
          views: parseInt(p.count),
        })),
        topReferrers: topReferrers.map((r) => ({
          referrer: r.referrer,
          views: parseInt(r.count),
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

    const dailyPlays = await prisma.$queryRawUnsafe<{ date: string; count: string }[]>(
      `SELECT DATE(created_at)::text as date, COUNT(*)::text as count
       FROM track_plays
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      days
    );

    const topTracks = await prisma.$queryRawUnsafe<{ track_id: string; track_name: string; count: string }[]>(
      `SELECT track_id, track_name, COUNT(*)::text as count
       FROM track_plays
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY track_id, track_name
       ORDER BY COUNT(*) DESC
       LIMIT 20`,
      days
    );

    const topReleases = await prisma.$queryRawUnsafe<{ release_id: string; release_name: string; count: string }[]>(
      `SELECT release_id, release_name, COUNT(*)::text as count
       FROM track_plays
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1 AND release_id IS NOT NULL
       GROUP BY release_id, release_name
       ORDER BY COUNT(*) DESC
       LIMIT 10`,
      days
    );

    const totalResult = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*)::text as count FROM track_plays`
    );

    res.json({
      success: true,
      data: {
        daily: dailyPlays.map((d) => ({
          date: d.date,
          plays: parseInt(d.count),
        })),
        topTracks: topTracks.map((t) => ({
          trackId: t.track_id,
          trackName: t.track_name,
          plays: parseInt(t.count),
        })),
        topReleases: topReleases.map((r) => ({
          releaseId: r.release_id,
          releaseName: r.release_name,
          plays: parseInt(r.count),
        })),
        totalPlays: parseInt(totalResult[0]?.count || '0'),
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
    const realtimeStats = await prisma.$queryRawUnsafe<{
      active_visitors: string;
      last_hour_views: string;
      last_hour_plays: string;
    }[]>(
      `SELECT
        (SELECT COUNT(DISTINCT session_id) FROM page_views WHERE created_at >= NOW() - INTERVAL '5 minutes' AND session_id IS NOT NULL)::text AS active_visitors,
        (SELECT COUNT(*) FROM page_views WHERE created_at >= NOW() - INTERVAL '1 hour')::text AS last_hour_views,
        (SELECT COUNT(*) FROM track_plays WHERE created_at >= NOW() - INTERVAL '1 hour')::text AS last_hour_plays`
    );

    const recentPlays = await prisma.$queryRawUnsafe<{
      track_name: string;
      release_name: string | null;
      created_at: Date;
    }[]>(
      `SELECT track_name, release_name, created_at
       FROM track_plays
       WHERE created_at >= NOW() - INTERVAL '1 hour'
       ORDER BY created_at DESC
       LIMIT 10`
    );

    const s = realtimeStats[0];

    res.json({
      success: true,
      data: {
        activeVisitors: parseInt(s.active_visitors),
        lastHourViews: parseInt(s.last_hour_views),
        lastHourPlays: parseInt(s.last_hour_plays),
        recentPlays: recentPlays.map((p) => ({
          trackName: p.track_name,
          releaseName: p.release_name,
          createdAt: p.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('[admin/analytics] realtime error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch realtime data' });
  }
});

export default router;
