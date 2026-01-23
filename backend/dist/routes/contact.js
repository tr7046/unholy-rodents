"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
const contactSchema = zod_1.z.object({
    type: zod_1.z.enum(['booking', 'press', 'general', 'merch']),
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    email: zod_1.z.string().email('Invalid email'),
    subject: zod_1.z.string().max(200).optional(),
    message: zod_1.z.string().min(10, 'Message must be at least 10 characters').max(5000)
});
// POST /api/v1/contact - Submit contact form
router.post('/', async (req, res) => {
    try {
        const result = contactSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: result.error.flatten().fieldErrors
            });
        }
        const contact = await db_1.default.contactForm.create({
            data: {
                type: result.data.type,
                name: result.data.name,
                email: result.data.email,
                subject: result.data.subject,
                message: result.data.message
            }
        });
        // TODO: Send email notification to band
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { id: contact.id }
        });
    }
    catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ success: false, error: 'Failed to submit message' });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map