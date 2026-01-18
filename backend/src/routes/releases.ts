import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/v1/releases - All releases
router.get('/', async (req, res) => {
  try {
    const releases = await prisma.release.findMany({
      include: {
        tracks: { orderBy: { trackNumber: 'asc' } }
      },
      orderBy: { releaseDate: 'desc' }
    });

    res.json({ success: true, data: releases });
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch releases' });
  }
});

// GET /api/v1/releases/:id - Single release with tracks
router.get('/:id', async (req, res) => {
  try {
    const release = await prisma.release.findUnique({
      where: { id: req.params.id },
      include: {
        tracks: { orderBy: { trackNumber: 'asc' } }
      }
    });

    if (!release) {
      return res.status(404).json({ success: false, error: 'Release not found' });
    }

    res.json({ success: true, data: release });
  } catch (error) {
    console.error('Error fetching release:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch release' });
  }
});

export default router;
