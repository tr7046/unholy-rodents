import { Router } from 'express';
import authRouter from './auth';
import showsRouter from './shows';
import releasesRouter from './releases';
import mediaRouter from './media';
import subscribersRouter from './subscribers';
import messagesRouter from './messages';
import contentRouter from './content';
import uploadRouter from './upload';
import paymentConfigRouter from './payment-config';
import analyticsRouter from './analytics';
import { authenticate, authenticateInternal } from '../../middleware/auth';

const router = Router();

// Auth routes (no authentication required)
router.use('/auth', authRouter);

// Protected routes - accepts JWT or internal API key (frontend server-to-server)
router.use('/shows', authenticateInternal, showsRouter);
router.use('/releases', authenticateInternal, releasesRouter);
router.use('/media', authenticateInternal, mediaRouter);
router.use('/subscribers', authenticateInternal, subscribersRouter);
router.use('/messages', authenticateInternal, messagesRouter);
router.use('/upload', authenticateInternal, uploadRouter);
router.use('/payment-config', authenticateInternal, paymentConfigRouter);
router.use('/content', authenticateInternal, contentRouter);
router.use('/analytics', authenticateInternal, analyticsRouter);

export default router;
