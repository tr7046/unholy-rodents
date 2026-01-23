"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/v1/content/:key - Get public content by key
router.get('/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const content = await db_1.prisma.siteContent.findUnique({
            where: { key },
        });
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }
        // Set cache headers for public content
        res.set('Cache-Control', 'public, max-age=60'); // 1 minute cache
        res.json(content.value);
    }
    catch (error) {
        console.error(`[content] GET /${req.params.key} failed:`, error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
exports.default = router;
//# sourceMappingURL=content.js.map