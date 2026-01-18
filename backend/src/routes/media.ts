import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/v1/media - Media gallery
router.get('/', async (req, res) => {
  try {
    const type = req.query.type as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where = type ? { type: type as 'photo' | 'video' | 'flyer' } : {};

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        include: { tags: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.media.count({ where })
    ]);

    res.json({
      success: true,
      data: media,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch media' });
  }
});

// GET /api/v1/media/:id - Single media item
router.get('/:id', async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
      include: { tags: true, show: { include: { venue: true } } }
    });

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch media' });
  }
});

export default router;
