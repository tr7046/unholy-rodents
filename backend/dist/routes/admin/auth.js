"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../db"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
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
        const user = await db_1.default.adminUser.findUnique({
            where: { email: result.data.email }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        const validPassword = await bcryptjs_1.default.compare(result.data.password, user.passwordHash);
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});
// POST /api/v1/admin/auth/logout
router.post('/logout', auth_1.authenticate, (req, res) => {
    // In a more complete implementation, you'd invalidate the token
    res.json({ success: true, message: 'Logged out' });
});
// GET /api/v1/admin/auth/me
router.get('/me', auth_1.authenticate, (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map