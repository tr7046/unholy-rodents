"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET /api/v1/releases - All releases
router.get('/', async (req, res) => {
    try {
        const releases = await db_1.default.release.findMany({
            include: {
                tracks: { orderBy: { trackNumber: 'asc' } }
            },
            orderBy: { releaseDate: 'desc' }
        });
        res.json({ success: true, data: releases });
    }
    catch (error) {
        console.error('Error fetching releases:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch releases' });
    }
});
// GET /api/v1/releases/:id - Single release with tracks
router.get('/:id', async (req, res) => {
    try {
        const release = await db_1.default.release.findUnique({
            where: { id: req.params.id },
            include: {
                tracks: { orderBy: { trackNumber: 'asc' } }
            }
        });
        if (!release) {
            return res.status(404).json({ success: false, error: 'Release not found' });
        }
        res.json({ success: true, data: release });
    }
    catch (error) {
        console.error('Error fetching release:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch release' });
    }
});
exports.default = router;
//# sourceMappingURL=releases.js.map