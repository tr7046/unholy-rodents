"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../../db"));
const router = (0, express_1.Router)();
const mediaSchema = zod_1.z.object({
    type: zod_1.z.enum(['photo', 'video', 'flyer']),
    url: zod_1.z.string().url(),
    thumbnailUrl: zod_1.z.string().url().optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    credit: zod_1.z.string().optional(),
    showId: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// GET /api/v1/admin/media
router.get('/', async (req, res) => {
    try {
        const media = await db_1.default.media.findMany({
            include: { tags: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: media });
    }
    catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch media' });
    }
});
// POST /api/v1/admin/media - Create media
router.post('/', async (req, res) => {
    try {
        const result = mediaSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const { tags, ...mediaData } = result.data;
        const media = await db_1.default.media.create({
            data: {
                ...mediaData,
                tags: tags ? {
                    create: tags.map(tag => ({ tag }))
                } : undefined
            },
            include: { tags: true }
        });
        res.status(201).json({ success: true, data: media });
    }
    catch (error) {
        console.error('Error creating media:', error);
        res.status(500).json({ success: false, error: 'Failed to create media' });
    }
});
// PUT /api/v1/admin/media/:id - Update media
router.put('/:id', async (req, res) => {
    try {
        const result = mediaSchema.partial().safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const { tags, ...mediaData } = result.data;
        const media = await db_1.default.media.update({
            where: { id: req.params.id },
            data: {
                ...mediaData,
                tags: tags ? {
                    deleteMany: {},
                    create: tags.map(tag => ({ tag }))
                } : undefined
            },
            include: { tags: true }
        });
        res.json({ success: true, data: media });
    }
    catch (error) {
        console.error('Error updating media:', error);
        res.status(500).json({ success: false, error: 'Failed to update media' });
    }
});
// DELETE /api/v1/admin/media/:id - Delete media
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.media.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Media deleted' });
    }
    catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ success: false, error: 'Failed to delete media' });
    }
});
exports.default = router;
//# sourceMappingURL=media.js.map