"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../../db"));
const router = (0, express_1.Router)();
// GET /api/v1/admin/subscribers
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const activeOnly = req.query.active !== 'false';
        const where = activeOnly ? { isActive: true } : {};
        const [subscribers, total] = await Promise.all([
            db_1.default.subscriber.findMany({
                where,
                orderBy: { subscribedAt: 'desc' },
                skip,
                take: limit
            }),
            db_1.default.subscriber.count({ where })
        ]);
        res.json({
            success: true,
            data: subscribers,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch subscribers' });
    }
});
// GET /api/v1/admin/subscribers/stats
router.get('/stats', async (req, res) => {
    try {
        const [total, active, bySource] = await Promise.all([
            db_1.default.subscriber.count(),
            db_1.default.subscriber.count({ where: { isActive: true } }),
            db_1.default.subscriber.groupBy({
                by: ['source'],
                _count: true,
                where: { isActive: true }
            })
        ]);
        res.json({
            success: true,
            data: {
                total,
                active,
                inactive: total - active,
                bySource: bySource.reduce((acc, item) => {
                    acc[item.source] = item._count;
                    return acc;
                }, {})
            }
        });
    }
    catch (error) {
        console.error('Error fetching subscriber stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});
// DELETE /api/v1/admin/subscribers/:id
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.subscriber.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Subscriber deleted' });
    }
    catch (error) {
        console.error('Error deleting subscriber:', error);
        res.status(500).json({ success: false, error: 'Failed to delete subscriber' });
    }
});
exports.default = router;
//# sourceMappingURL=subscribers.js.map