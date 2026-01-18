import { Router } from 'express';
import prisma from '../../db';

const router = Router();

// GET /api/v1/admin/subscribers
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const activeOnly = req.query.active !== 'false';

    const where = activeOnly ? { isActive: true } : {};

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.subscriber.count({ where })
    ]);

    res.json({
      success: true,
      data: subscribers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscribers' });
  }
});

// GET /api/v1/admin/subscribers/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, active, bySource] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { isActive: true } }),
      prisma.subscriber.groupBy({
        by: ['source'],
        _count: true,
        where: { isActive: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        bySource: bySource.reduce((acc, item) => {
          acc[item.source] = item._count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Error fetching subscriber stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// DELETE /api/v1/admin/subscribers/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.subscriber.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Subscriber deleted' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ success: false, error: 'Failed to delete subscriber' });
  }
});

export default router;
