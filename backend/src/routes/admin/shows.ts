import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../db';

const router = Router();

const showSchema = z.object({
  venueId: z.string(),
  date: z.string().transform(s => new Date(s)),
  doorsTime: z.string().optional(),
  startTime: z.string().optional(),
  ticketUrl: z.string().url().optional().nullable(),
  ticketPrice: z.number().optional().nullable(),
  ageRestriction: z.string().optional().nullable(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
  notes: z.string().optional().nullable(),
  bands: z.array(z.object({
    bandName: z.string(),
    setOrder: z.number(),
    isHeadliner: z.boolean().optional()
  })).optional()
});

const venueSchema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string().optional(),
  capacity: z.number().optional(),
  website: z.string().url().optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
});

// GET /api/v1/admin/shows - All shows (including cancelled)
router.get('/', async (req, res) => {
  try {
    const shows = await prisma.show.findMany({
      include: {
        venue: true,
        bands: { orderBy: { setOrder: 'asc' } }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: shows });
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch shows' });
  }
});

// POST /api/v1/admin/shows - Create show
router.post('/', async (req, res) => {
  try {
    const result = showSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const { bands, ...showData } = result.data;

    const show = await prisma.show.create({
      data: {
        ...showData,
        bands: bands ? {
          create: bands.map(band => ({
            bandName: band.bandName,
            setOrder: band.setOrder,
            isHeadliner: band.isHeadliner || false
          }))
        } : undefined
      },
      include: {
        venue: true,
        bands: { orderBy: { setOrder: 'asc' } }
      }
    });

    res.status(201).json({ success: true, data: show });
  } catch (error) {
    console.error('Error creating show:', error);
    res.status(500).json({ success: false, error: 'Failed to create show' });
  }
});

// PUT /api/v1/admin/shows/:id - Update show
router.put('/:id', async (req, res) => {
  try {
    const result = showSchema.partial().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const { bands, ...showData } = result.data;

    // Update show and optionally replace bands
    const show = await prisma.show.update({
      where: { id: req.params.id },
      data: {
        ...showData,
        bands: bands ? {
          deleteMany: {},
          create: bands.map(band => ({
            bandName: band.bandName,
            setOrder: band.setOrder,
            isHeadliner: band.isHeadliner || false
          }))
        } : undefined
      },
      include: {
        venue: true,
        bands: { orderBy: { setOrder: 'asc' } }
      }
    });

    res.json({ success: true, data: show });
  } catch (error) {
    console.error('Error updating show:', error);
    res.status(500).json({ success: false, error: 'Failed to update show' });
  }
});

// DELETE /api/v1/admin/shows/:id - Delete show
router.delete('/:id', async (req, res) => {
  try {
    await prisma.show.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Show deleted' });
  } catch (error) {
    console.error('Error deleting show:', error);
    res.status(500).json({ success: false, error: 'Failed to delete show' });
  }
});

// Venue management
// GET /api/v1/admin/shows/venues
router.get('/venues', async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch venues' });
  }
});

// POST /api/v1/admin/shows/venues - Create venue
router.post('/venues', async (req, res) => {
  try {
    const result = venueSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const venue = await prisma.venue.create({
      data: result.data
    });

    res.status(201).json({ success: true, data: venue });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ success: false, error: 'Failed to create venue' });
  }
});

export default router;
