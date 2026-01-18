import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/v1/members - Band members
router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active !== 'false';

    const members = await prisma.member.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { joinedDate: 'asc' }
    });

    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch members' });
  }
});

// GET /api/v1/members/:id - Single member
router.get('/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch member' });
  }
});

export default router;
