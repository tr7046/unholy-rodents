import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db';

const router = Router();

const mediaSchema = z.object({
  type: z.enum(['photo', 'video', 'flyer']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  credit: z.string().optional(),
  showId: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// GET /api/v1/admin/media
router.get('/', async (req, res) => {
  try {
    const media = await prisma.media.findMany({
      include: { tags: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch media' });
  }
});

// POST /api/v1/admin/media - Create media
router.post('/', async (req, res) => {
  try {
    const result = mediaSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const { tags, ...mediaData } = result.data;

    const media = await prisma.media.create({
      data: {
        ...mediaData,
        tags: tags ? {
          create: tags.map(tag => ({ tag }))
        } : undefined
      },
      include: { tags: true }
    });

    res.status(201).json({ success: true, data: media });
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json({ success: false, error: 'Failed to create media' });
  }
});

// PUT /api/v1/admin/media/:id - Update media
router.put('/:id', async (req, res) => {
  try {
    const result = mediaSchema.partial().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const { tags, ...mediaData } = result.data;

    const media = await prisma.media.update({
      where: { id: req.params.id },
      data: {
        ...mediaData,
        tags: tags ? {
          deleteMany: {},
          create: tags.map(tag => ({ tag }))
        } : undefined
      },
      include: { tags: true }
    });

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ success: false, error: 'Failed to update media' });
  }
});

// DELETE /api/v1/admin/media/:id - Delete media
router.delete('/:id', async (req, res) => {
  try {
    await prisma.media.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ success: false, error: 'Failed to delete media' });
  }
});

export default router;
