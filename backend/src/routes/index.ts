import { Router } from 'express';
import showsRouter from './shows';
import releasesRouter from './releases';
import mediaRouter from './media';
import membersRouter from './members';
import contactRouter from './contact';
import subscribeRouter from './subscribe';
import adminRouter from './admin';

const router = Router();

// Public routes
router.use('/shows', showsRouter);
router.use('/releases', releasesRouter);
router.use('/media', mediaRouter);
router.use('/members', membersRouter);
router.use('/contact', contactRouter);
router.use('/subscribe', subscribeRouter);

// Admin routes
router.use('/admin', adminRouter);

export default router;
