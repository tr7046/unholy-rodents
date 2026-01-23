"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
const subscribeSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    name: zod_1.z.string().max(100).optional(),
    source: zod_1.z.enum(['website', 'show', 'merch', 'other']).optional(),
    preferences: zod_1.z.object({
        showAlerts: zod_1.z.boolean().optional(),
        newReleases: zod_1.z.boolean().optional(),
        merchDrops: zod_1.z.boolean().optional(),
        newsletter: zod_1.z.boolean().optional()
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
        const existing = await db_1.default.subscriber.findUnique({
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
            await db_1.default.subscriber.update({
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
        await db_1.default.subscriber.create({
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
    }
    catch (error) {
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
        const subscriber = await db_1.default.subscriber.findUnique({
            where: { email }
        });
        if (!subscriber) {
            return res.status(404).json({ success: false, error: 'Email not found' });
        }
        await db_1.default.subscriber.update({
            where: { email },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Successfully unsubscribed' });
    }
    catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ success: false, error: 'Failed to unsubscribe' });
    }
});
exports.default = router;
//# sourceMappingURL=subscribe.js.map