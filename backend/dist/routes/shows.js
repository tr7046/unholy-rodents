"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET /api/v1/shows - List upcoming shows
router.get('/', async (req, res) => {
    try {
        const shows = await db_1.default.show.findMany({
            where: {
                date: { gte: new Date() },
                status: { not: 'cancelled' }
            },
            include: {
                venue: true,
                bands: { orderBy: { setOrder: 'asc' } }
            },
            orderBy: { date: 'asc' }
        });
        res.json({ success: true, data: shows });
    }
    catch (error) {
        console.error('Error fetching shows:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch shows' });
    }
});
// GET /api/v1/shows/past - Past shows
router.get('/past', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [shows, total] = await Promise.all([
            db_1.default.show.findMany({
                where: { date: { lt: new Date() } },
                include: {
                    venue: true,
                    bands: { orderBy: { setOrder: 'asc' } }
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit
            }),
            db_1.default.show.count({ where: { date: { lt: new Date() } } })
        ]);
        res.json({
            success: true,
            data: shows,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        console.error('Error fetching past shows:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch past shows' });
    }
});
// GET /api/v1/shows/:id - Single show
router.get('/:id', async (req, res) => {
    try {
        const show = await db_1.default.show.findUnique({
            where: { id: req.params.id },
            include: {
                venue: true,
                bands: { orderBy: { setOrder: 'asc' } },
                media: true
            }
        });
        if (!show) {
            return res.status(404).json({ success: false, error: 'Show not found' });
        }
        res.json({ success: true, data: show });
    }
    catch (error) {
        console.error('Error fetching show:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch show' });
    }
});
exports.default = router;
//# sourceMappingURL=shows.js.map