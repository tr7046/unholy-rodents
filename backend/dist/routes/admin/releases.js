"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../../db"));
const router = (0, express_1.Router)();
const trackSchema = zod_1.z.object({
    title: zod_1.z.string(),
    trackNumber: zod_1.z.number(),
    duration: zod_1.z.number().optional(),
    lyrics: zod_1.z.string().optional(),
    spotifyId: zod_1.z.string().optional(),
    previewUrl: zod_1.z.string().url().optional()
});
const releaseSchema = zod_1.z.object({
    title: zod_1.z.string(),
    type: zod_1.z.enum(['album', 'ep', 'single', 'demo', 'split']),
    releaseDate: zod_1.z.string().transform(s => new Date(s)),
    coverArtUrl: zod_1.z.string().url().optional().nullable(),
    spotifyUrl: zod_1.z.string().url().optional().nullable(),
    bandcampUrl: zod_1.z.string().url().optional().nullable(),
    appleMusicUrl: zod_1.z.string().url().optional().nullable(),
    youtubeUrl: zod_1.z.string().url().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    tracks: zod_1.z.array(trackSchema).optional()
});
// GET /api/v1/admin/releases
router.get('/', async (req, res) => {
    try {
        const releases = await db_1.default.release.findMany({
            include: { tracks: { orderBy: { trackNumber: 'asc' } } },
            orderBy: { releaseDate: 'desc' }
        });
        res.json({ success: true, data: releases });
    }
    catch (error) {
        console.error('Error fetching releases:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch releases' });
    }
});
// POST /api/v1/admin/releases - Create release
router.post('/', async (req, res) => {
    try {
        const result = releaseSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const { tracks, ...releaseData } = result.data;
        const release = await db_1.default.release.create({
            data: {
                ...releaseData,
                tracks: tracks ? { create: tracks } : undefined
            },
            include: { tracks: { orderBy: { trackNumber: 'asc' } } }
        });
        res.status(201).json({ success: true, data: release });
    }
    catch (error) {
        console.error('Error creating release:', error);
        res.status(500).json({ success: false, error: 'Failed to create release' });
    }
});
// PUT /api/v1/admin/releases/:id - Update release
router.put('/:id', async (req, res) => {
    try {
        const result = releaseSchema.partial().safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const { tracks, ...releaseData } = result.data;
        const release = await db_1.default.release.update({
            where: { id: req.params.id },
            data: {
                ...releaseData,
                tracks: tracks ? {
                    deleteMany: {},
                    create: tracks
                } : undefined
            },
            include: { tracks: { orderBy: { trackNumber: 'asc' } } }
        });
        res.json({ success: true, data: release });
    }
    catch (error) {
        console.error('Error updating release:', error);
        res.status(500).json({ success: false, error: 'Failed to update release' });
    }
});
// DELETE /api/v1/admin/releases/:id - Delete release
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.release.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Release deleted' });
    }
    catch (error) {
        console.error('Error deleting release:', error);
        res.status(500).json({ success: false, error: 'Failed to delete release' });
    }
});
exports.default = router;
//# sourceMappingURL=releases.js.map