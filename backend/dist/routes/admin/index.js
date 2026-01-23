"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const shows_1 = __importDefault(require("./shows"));
const releases_1 = __importDefault(require("./releases"));
const media_1 = __importDefault(require("./media"));
const subscribers_1 = __importDefault(require("./subscribers"));
const content_1 = __importDefault(require("./content"));
const upload_1 = __importDefault(require("./upload"));
const auth_2 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Auth routes (no authentication required)
router.use('/auth', auth_1.default);
// Protected routes (authentication required)
router.use('/shows', auth_2.authenticate, shows_1.default);
router.use('/releases', auth_2.authenticate, releases_1.default);
router.use('/media', auth_2.authenticate, media_1.default);
router.use('/subscribers', auth_2.authenticate, subscribers_1.default);
router.use('/content', auth_2.authenticate, content_1.default);
router.use('/upload', auth_2.authenticate, upload_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map