"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const initKey_1 = require("./initKey");
const dotenv_1 = __importDefault(require("dotenv"));
// Carga variables de entorno
dotenv_1.default.config();
const router = (0, express_1.Router)();
const activeSessions = new Map();
const VALID_USER = {
    username: process.env.VALID_USERNAME || '',
    password: process.env.VALID_PASSWORD || '',
};
// Validación opcional para evitar valores vacíos en producción
if (!VALID_USER.username || !VALID_USER.password) {
    console.error('Las credenciales del usuario no están definidas en las variables de entorno.');
    process.exit(1);
}
// POST /auth/login
const loginHandler = (req, res) => {
    const { username, password, rememberMe = false } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required.' });
        return;
    }
    if (username !== VALID_USER.username || password !== VALID_USER.password) {
        res.status(401).json({ message: 'Invalid credentials.' });
        return;
    }
    const loginDate = Math.floor(Date.now() / 1000);
    const { publicKey } = (0, initKey_1.generateDerivedKeyFromDate)(username, loginDate.toString());
    activeSessions.set(username, loginDate);
    res.status(200).json({
        message: 'Login successful',
        user: { username, rememberMe, publicKey, loginDate },
    });
};
router.post('/login', loginHandler);
// GET /auth/sessions — protegido con ADMIN_SECRET
const sessionsHandler = (req, res) => {
    const providedSecret = req.header('x-admin-secret');
    if (!providedSecret || providedSecret !== process.env.ADMIN_SECRET) {
        res.status(403).json({ message: 'Forbidden: Invalid admin secret.' });
        return;
    }
    const sessions = Array.from(activeSessions.entries()).map(([username, loginDate]) => ({ username, loginDate }));
    res.status(200).json({ sessions });
};
router.post('/sessions', sessionsHandler);
// GET /auth/logout
const logoutHandler = (_req, res) => {
    res.status(200).json({ message: 'Logout successful (no real session yet)' });
};
router.get('/logout', logoutHandler);
exports.default = router;
