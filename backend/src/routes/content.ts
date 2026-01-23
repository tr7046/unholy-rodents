import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/v1/content/:key - Get public content by key
router.get('/:key', async (req: Request<{ key: string }>, res: Response) => {
  try {
    const key = req.params.key;

    const content = await prisma.siteContent.findUnique({
      where: { key },
    });

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Set cache headers for public content
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute cache
    res.json(content.value);
  } catch (error) {
    console.error(`[content] GET /${req.params.key} failed:`, error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

export default router;
