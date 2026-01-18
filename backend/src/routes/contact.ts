import { Router } from 'express';
import { z } from 'zod';
import prisma from '../db';

const router = Router();

const contactSchema = z.object({
  type: z.enum(['booking', 'press', 'general', 'merch']),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000)
});

// POST /api/v1/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const result = contactSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
    }

    const contact = await prisma.contactForm.create({
      data: {
        type: result.data.type,
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject,
        message: result.data.message
      }
    });

    // TODO: Send email notification to band

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { id: contact.id }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, error: 'Failed to submit message' });
  }
});

export default router;
