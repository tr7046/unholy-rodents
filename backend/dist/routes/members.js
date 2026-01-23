"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET /api/v1/members - Band members
router.get('/', async (req, res) => {
    try {
        const activeOnly = req.query.active !== 'false';
        const members = await db_1.default.member.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { joinedDate: 'asc' }
        });
        res.json({ success: true, data: members });
    }
    catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch members' });
    }
});
// GET /api/v1/members/:id - Single member
router.get('/:id', async (req, res) => {
    try {
        const member = await db_1.default.member.findUnique({
            where: { id: req.params.id }
        });
        if (!member) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        res.json({ success: true, data: member });
    }
    catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch member' });
    }
});
exports.default = router;
//# sourceMappingURL=members.js.map