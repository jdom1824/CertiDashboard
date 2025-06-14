import { Router, RequestHandler } from 'express';
import { generateDerivedKeyFromDate } from './initKey';
import dotenv from 'dotenv';

// Carga variables de entorno
dotenv.config();

const router = Router();
const activeSessions = new Map<string, number>();

// Usuario fijo para validación
type User = { username: string; password: string };
const VALID_USER: User = {
  username: process.env.VALID_USERNAME || '',
  password: process.env.VALID_PASSWORD || '',
};

// Validación opcional para evitar valores vacíos en producción
if (!VALID_USER.username || !VALID_USER.password) {
  console.error('Las credenciales del usuario no están definidas en las variables de entorno.');
  process.exit(1);
}

// Tipos de request y response
type LoginRequest = { username: string; password: string; rememberMe?: boolean };
type LoginResponse = {
  message: string;
  user: { username: string; rememberMe: boolean; publicKey: string; loginDate: number };
};

// POST /auth/login
const loginHandler: RequestHandler<{}, LoginResponse | { message: string }, LoginRequest> = (req, res) => {
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
  const { publicKey } = generateDerivedKeyFromDate(username, loginDate.toString());
  activeSessions.set(username, loginDate);
  res.status(200).json({
    message: 'Login successful',
    user: { username, rememberMe, publicKey, loginDate },
  });
};
router.post('/login', loginHandler);

// GET /auth/sessions — protegido con ADMIN_SECRET
const sessionsHandler: RequestHandler = (req, res) => {
  const providedSecret = req.header('x-admin-secret');
  if (!providedSecret || providedSecret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ message: 'Forbidden: Invalid admin secret.' });
    return;
  }
  const sessions = Array.from(activeSessions.entries()).map(([username, loginDate]) => ({ username, loginDate }));
  res.status(200).json({ sessions });
};
router.get('/sessions', sessionsHandler);

// GET /auth/logout
const logoutHandler: RequestHandler = (_req, res) => {
  res.status(200).json({ message: 'Logout successful (no real session yet)' });
};
router.get('/logout', logoutHandler);

export default router;