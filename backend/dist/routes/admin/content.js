"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const router = (0, express_1.Router)();
// GET /api/v1/admin/content/:key - Get content by key
router.get('/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const content = await db_1.prisma.siteContent.findUnique({
            where: { key },
        });
        if (!content) {
            // Return default empty content for new keys
            return res.json({ key, value: null });
        }
        res.json(content);
    }
    catch (error) {
        console.error(`[content] GET /${req.params.key} failed:`, error);
        res.status(500).json({ success: false, error: 'Failed to fetch content' });
    }
});
// PUT /api/v1/admin/content/:key - Update or create content
router.put('/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const { value } = req.body;
        if (value === undefined) {
            return res.status(400).json({ success: false, error: 'Value is required' });
        }
        const content = await db_1.prisma.siteContent.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
        res.json({ success: true, content });
    }
    catch (error) {
        console.error(`[content] PUT /${req.params.key} failed:`, error);
        res.status(500).json({ success: false, error: 'Failed to save content' });
    }
});
// PATCH /api/v1/admin/content/:key - Partial update (merge with existing)
router.patch('/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const updates = req.body;
        // Get existing content
        const existing = await db_1.prisma.siteContent.findUnique({
            where: { key },
        });
        const currentValue = existing?.value || {};
        const newValue = { ...currentValue, ...updates };
        const content = await db_1.prisma.siteContent.upsert({
            where: { key },
            update: { value: newValue },
            create: { key, value: newValue },
        });
        res.json({ success: true, content });
    }
    catch (error) {
        console.error(`[content] PATCH /${req.params.key} failed:`, error);
        res.status(500).json({ success: false, error: 'Failed to update content' });
    }
});
exports.default = router;
//# sourceMappingURL=content.js.map