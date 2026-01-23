"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET /api/v1/media - Media gallery
router.get('/', async (req, res) => {
    try {
        const type = req.query.type;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = type ? { type: type } : {};
        const [media, total] = await Promise.all([
            db_1.default.media.findMany({
                where,
                include: { tags: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db_1.default.media.count({ where })
        ]);
        res.json({
            success: true,
            data: media,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch media' });
    }
});
// GET /api/v1/media/:id - Single media item
router.get('/:id', async (req, res) => {
    try {
        const media = await db_1.default.media.findUnique({
            where: { id: req.params.id },
            include: { tags: true, show: { include: { venue: true } } }
        });
        if (!media) {
            return res.status(404).json({ success: false, error: 'Media not found' });
        }
        res.json({ success: true, data: media });
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch media' });
    }
});
exports.default = router;
//# sourceMappingURL=media.js.map