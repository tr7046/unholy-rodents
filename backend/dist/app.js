"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Trust proxy for Railway/Vercel deployments (required for rate limiting behind proxy)
app.set('trust proxy', true);
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to be loaded from other origins
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
// Rate limiting (disabled validation for Railway proxy)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, error: 'Too many requests, slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false, // Disable validation to work behind Railway proxy
});
app.use('/api', limiter);
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'public', 'uploads')));
// Body parsing (but not for multipart - we handle that manually in upload route)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/v1', routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Not found' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map