"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shows_1 = __importDefault(require("./shows"));
const releases_1 = __importDefault(require("./releases"));
const media_1 = __importDefault(require("./media"));
const members_1 = __importDefault(require("./members"));
const contact_1 = __importDefault(require("./contact"));
const subscribe_1 = __importDefault(require("./subscribe"));
const content_1 = __importDefault(require("./content"));
const admin_1 = __importDefault(require("./admin"));
const router = (0, express_1.Router)();
// Public routes
router.use('/shows', shows_1.default);
router.use('/releases', releases_1.default);
router.use('/media', media_1.default);
router.use('/members', members_1.default);
router.use('/contact', contact_1.default);
router.use('/subscribe', subscribe_1.default);
router.use('/content', content_1.default);
// Admin routes
router.use('/admin', admin_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map