import { Router } from 'express';
import authRouter from './auth';
import showsRouter from './shows';
import releasesRouter from './releases';
import mediaRouter from './media';
import subscribersRouter from './subscribers';
import contentRouter from './content';
import uploadRouter from './upload';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Auth routes (no authentication required)
router.use('/auth', authRouter);

// Protected routes (authentication required)
router.use('/shows', authenticate, showsRouter);
router.use('/releases', authenticate, releasesRouter);
router.use('/media', authenticate, mediaRouter);
router.use('/subscribers', authenticate, subscribersRouter);
router.use('/upload', authenticate, uploadRouter);

// Content routes - frontend handles auth via session cookie
router.use('/content', contentRouter);

export default router;
