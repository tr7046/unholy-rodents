import { Router } from 'express';
import prisma from '../../db';

const router = Router();

// GET /api/v1/admin/messages
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactForm.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.contactForm.count({ where }),
      prisma.contactForm.count({ where: { status: 'new_msg' } })
    ]);

    res.json({
      success: true,
      data: messages,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// GET /api/v1/admin/messages/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, byStatus, byType] = await Promise.all([
      prisma.contactForm.count(),
      prisma.contactForm.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.contactForm.groupBy({
        by: ['type'],
        _count: true
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// GET /api/v1/admin/messages/:id
router.get('/:id', async (req, res) => {
  try {
    const message = await prisma.contactForm.findUnique({
      where: { id: req.params.id }
    });

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch message' });
  }
});

// PATCH /api/v1/admin/messages/:id
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['new_msg', 'read', 'replied', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const message = await prisma.contactForm.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ success: false, error: 'Failed to update message' });
  }
});

// DELETE /api/v1/admin/messages/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.contactForm.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

// POST /api/v1/admin/messages/mark-read
router.post('/mark-read', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No message IDs provided' });
    }

    await prisma.contactForm.updateMany({
      where: { id: { in: ids } },
      data: { status: 'read' }
    });

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
  }
});

export default router;
