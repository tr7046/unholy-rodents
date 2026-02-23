import { Router } from 'express';
import showsRouter from './shows';
import releasesRouter from './releases';
import mediaRouter from './media';
import membersRouter from './members';
import contactRouter from './contact';
import subscribeRouter from './subscribe';
import contentRouter from './content';
import analyticsRouter from './analytics';
import adminRouter from './admin';
import { prisma } from '../db';

const router = Router();

// Public routes
router.use('/shows', showsRouter);
router.use('/releases', releasesRouter);
router.use('/media', mediaRouter);
router.use('/members', membersRouter);
router.use('/contact', contactRouter);
router.use('/subscribe', subscribeRouter);
router.use('/content', contentRouter);
router.use('/analytics', analyticsRouter);

// Public payment config (publishable keys only — no secrets)
router.get('/payment-config/public', async (_req, res) => {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: 'payment_config' },
    });

    if (!content) {
      return res.json({ activeProvider: null, configured: false });
    }

    const config = content.value as Record<string, unknown>;
    const activeProvider = config.activeProvider as string | null;

    if (!activeProvider) {
      return res.json({ activeProvider: null, configured: false });
    }

    const providerConfig = config[activeProvider] as Record<string, unknown> | undefined;
    if (!providerConfig) {
      return res.json({ activeProvider: null, configured: false });
    }

    // Only expose non-secret fields per provider
    const safeFields: Record<string, string[]> = {
      stripe: ['publishableKey', 'mode', 'isConfigured'],
      square: ['applicationId', 'locationId', 'mode', 'isConfigured'],
      paypal: ['clientId', 'mode', 'isConfigured'],
    };

    const fields = safeFields[activeProvider] || [];
    const publicConfig: Record<string, unknown> = {};
    for (const field of fields) {
      publicConfig[field] = providerConfig[field];
    }

    res.json({ activeProvider, configured: !!providerConfig.isConfigured, config: publicConfig });
  } catch (error) {
    console.error('[payment-config] GET /public failed:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment config' });
  }
});

// Admin routes
router.use('/admin', adminRouter);

export default router;
