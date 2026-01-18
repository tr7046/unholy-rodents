import { Router } from 'express';
import { z } from 'zod';
import prisma from '../db';

const router = Router();

const subscribeSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().max(100).optional(),
  source: z.enum(['website', 'show', 'merch', 'other']).optional(),
  preferences: z.object({
    showAlerts: z.boolean().optional(),
    newReleases: z.boolean().optional(),
    merchDrops: z.boolean().optional(),
    newsletter: z.boolean().optional()
  }).optional()
});

// POST /api/v1/subscribe - Subscribe to mailing list
router.post('/', async (req, res) => {
  try {
    const result = subscribeSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: { email: result.data.email }
    });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          error: 'Email already subscribed'
        });
      }

      // Reactivate inactive subscriber
      await prisma.subscriber.update({
        where: { email: result.data.email },
        data: {
          isActive: true,
          subscribedAt: new Date(),
          name: result.data.name || existing.name,
          preferences: result.data.preferences ? JSON.parse(JSON.stringify(result.data.preferences)) : undefined
        }
      });

      return res.json({
        success: true,
        message: 'Welcome back! Subscription reactivated.'
      });
    }

    await prisma.subscriber.create({
      data: {
        email: result.data.email,
        name: result.data.name,
        source: result.data.source || 'website',
        preferences: result.data.preferences || {
          showAlerts: true,
          newReleases: true,
          merchDrops: true,
          newsletter: true
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed!'
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ success: false, error: 'Failed to subscribe' });
  }
});

// DELETE /api/v1/subscribe - Unsubscribe
router.delete('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (!subscriber) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    await prisma.subscriber.update({
      where: { email },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
  }
});

export default router;
