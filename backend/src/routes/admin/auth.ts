import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../db';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// POST /api/v1/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: result.data.email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const validPassword = await bcrypt.compare(result.data.password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// POST /api/v1/admin/auth/logout
router.post('/logout', authenticate, (req, res) => {
  // In a more complete implementation, you'd invalidate the token
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/v1/admin/auth/me
router.get('/me', authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

export default router;
