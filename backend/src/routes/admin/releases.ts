import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db';

const router = Router();

const trackSchema = z.object({
  title: z.string(),
  trackNumber: z.number(),
  duration: z.number().optional(),
  lyrics: z.string().optional(),
  spotifyId: z.string().optional(),
  previewUrl: z.string().url().optional()
});

const releaseSchema = z.object({
  title: z.string(),
  type: z.enum(['album', 'ep', 'single', 'demo', 'split']),
  releaseDate: z.string().transform(s => new Date(s)),
  coverArtUrl: z.string().url().optional().nullable(),
  spotifyUrl: z.string().url().optional().nullable(),
  bandcampUrl: z.string().url().optional().nullable(),
  appleMusicUrl: z.string().url().optional().nullable(),
  youtubeUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  tracks: z.array(trackSchema).optional()
});

// GET /api/v1/admin/releases
router.get('/', async (req, res) => {
  try {
    const releases = await prisma.release.findMany({
      include: { tracks: { orderBy: { trackNumber: 'asc' } } },
      orderBy: { releaseDate: 'desc' }
    });

    res.json({ success: true, data: releases });
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch releases' });
  }
});

// POST /api/v1/admin/releases - Create release
router.post('/', async (req, res) => {
  try {
    const result = releaseSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const { tracks, ...releaseData } = result.data;

    const release = await prisma.release.create({
      data: {
        ...releaseData,
        tracks: tracks ? { create: tracks } : undefined
      },
      include: { tracks: { orderBy: { trackNumber: 'asc' } } }
    });

    res.status(201).json({ success: true, data: release });
  } catch (error) {
    console.error('Error creating release:', error);
    res.status(500).json({ success: false, error: 'Failed to create release' });
  }
});

// PUT /api/v1/admin/releases/:id - Update release
router.put('/:id', async (req, res) => {
  try {
    const result = releaseSchema.partial().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const { tracks, ...releaseData } = result.data;

    const release = await prisma.release.update({
      where: { id: req.params.id },
      data: {
        ...releaseData,
        tracks: tracks ? {
          deleteMany: {},
          create: tracks
        } : undefined
      },
      include: { tracks: { orderBy: { trackNumber: 'asc' } } }
    });

    res.json({ success: true, data: release });
  } catch (error) {
    console.error('Error updating release:', error);
    res.status(500).json({ success: false, error: 'Failed to update release' });
  }
});

// DELETE /api/v1/admin/releases/:id - Delete release
router.delete('/:id', async (req, res) => {
  try {
    await prisma.release.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Release deleted' });
  } catch (error) {
    console.error('Error deleting release:', error);
    res.status(500).json({ success: false, error: 'Failed to delete release' });
  }
});

export default router;
