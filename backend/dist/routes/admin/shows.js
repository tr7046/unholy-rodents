"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../../db"));
const router = (0, express_1.Router)();
const showSchema = zod_1.z.object({
    venueId: zod_1.z.string(),
    date: zod_1.z.string().transform(s => new Date(s)),
    doorsTime: zod_1.z.string().optional(),
    startTime: zod_1.z.string().optional(),
    ticketUrl: zod_1.z.string().url().optional().nullable(),
    ticketPrice: zod_1.z.number().optional().nullable(),
    ageRestriction: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
    notes: zod_1.z.string().optional().nullable(),
    bands: zod_1.z.array(zod_1.z.object({
        bandName: zod_1.z.string(),
        setOrder: zod_1.z.number(),
        isHeadliner: zod_1.z.boolean().optional()
    })).optional()
});
const venueSchema = zod_1.z.object({
    name: zod_1.z.string(),
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    country: zod_1.z.string().optional(),
    capacity: zod_1.z.number().optional(),
    website: zod_1.z.string().url().optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional()
});
// GET /api/v1/admin/shows - All shows (including cancelled)
router.get('/', async (req, res) => {
    try {
        const shows = await db_1.default.show.findMany({
            include: {
                venue: true,
                bands: { orderBy: { setOrder: 'asc' } }
            },
            orderBy: { date: 'desc' }
        });
        res.json({ success: true, data: shows });
    }
    catch (error) {
        console.error('Error fetching shows:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch shows' });
    }
});
// POST /api/v1/admin/shows - Create show
router.post('/', async (req, res) => {
    try {
        const result = showSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const { bands, ...showData } = result.data;
        const show = await db_1.default.show.create({
            data: {
                ...showData,
                bands: bands ? {
                    create: bands.map(band => ({
                        bandName: band.bandName,
                        setOrder: band.setOrder,
                        isHeadliner: band.isHeadliner || false
                    }))
                } : undefined
            },
            include: {
                venue: true,
                bands: { orderBy: { setOrder: 'asc' } }
            }
        });
        res.status(201).json({ success: true, data: show });
    }
    catch (error) {
        console.error('Error creating show:', error);
        res.status(500).json({ success: false, error: 'Failed to create show' });
    }
});
// PUT /api/v1/admin/shows/:id - Update show
router.put('/:id', async (req, res) => {
    try {
        const result = showSchema.partial().safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const { bands, ...showData } = result.data;
        // Update show and optionally replace bands
        const show = await db_1.default.show.update({
            where: { id: req.params.id },
            data: {
                ...showData,
                bands: bands ? {
                    deleteMany: {},
                    create: bands.map(band => ({
                        bandName: band.bandName,
                        setOrder: band.setOrder,
                        isHeadliner: band.isHeadliner || false
                    }))
                } : undefined
            },
            include: {
                venue: true,
                bands: { orderBy: { setOrder: 'asc' } }
            }
        });
        res.json({ success: true, data: show });
    }
    catch (error) {
        console.error('Error updating show:', error);
        res.status(500).json({ success: false, error: 'Failed to update show' });
    }
});
// DELETE /api/v1/admin/shows/:id - Delete show
router.delete('/:id', async (req, res) => {
    try {
        await db_1.default.show.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Show deleted' });
    }
    catch (error) {
        console.error('Error deleting show:', error);
        res.status(500).json({ success: false, error: 'Failed to delete show' });
    }
});
// Venue management
// GET /api/v1/admin/shows/venues
router.get('/venues', async (req, res) => {
    try {
        const venues = await db_1.default.venue.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: venues });
    }
    catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch venues' });
    }
});
// POST /api/v1/admin/shows/venues - Create venue
router.post('/venues', async (req, res) => {
    try {
        const result = venueSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const venue = await db_1.default.venue.create({
            data: result.data
        });
        res.status(201).json({ success: true, data: venue });
    }
    catch (error) {
        console.error('Error creating venue:', error);
        res.status(500).json({ success: false, error: 'Failed to create venue' });
    }
});
exports.default = router;
//# sourceMappingURL=shows.js.map