import { Router, Request, Response } from 'express';
import { prisma } from '../../db';

const router = Router();

// GET /api/v1/admin/content/:key - Get content by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const content = await prisma.siteContent.findUnique({
      where: { key },
    });

    if (!content) {
      // Return default empty content for new keys
      return res.json({ key, value: null });
    }

    res.json(content);
  } catch (error) {
    console.error(`[content] GET /${req.params.key} failed:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

// PUT /api/v1/admin/content/:key - Update or create content
router.put('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ success: false, error: 'Value is required' });
    }

    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json({ success: true, content });
  } catch (error) {
    console.error(`[content] PUT /${req.params.key} failed:`, error);
    res.status(500).json({ success: false, error: 'Failed to save content' });
  }
});

// PATCH /api/v1/admin/content/:key - Partial update (merge with existing)
router.patch('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const updates = req.body;

    // Get existing content
    const existing = await prisma.siteContent.findUnique({
      where: { key },
    });

    const currentValue = (existing?.value as object) || {};
    const newValue = { ...currentValue, ...updates };

    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value: newValue },
      create: { key, value: newValue },
    });

    res.json({ success: true, content });
  } catch (error) {
    console.error(`[content] PATCH /${req.params.key} failed:`, error);
    res.status(500).json({ success: false, error: 'Failed to update content' });
  }
});

export default router;
