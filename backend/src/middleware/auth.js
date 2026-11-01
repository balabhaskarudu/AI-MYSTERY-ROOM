import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ success: false, message: 'Please sign in to continue.', code: 'UNAUTHENTICATED' });
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (payload.tokenUse !== 'access') return res.status(401).json({ success: false, message: 'Please sign in to continue.', code: 'UNAUTHENTICATED' });
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash');
    if (!user) return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.', code: 'UNAUTHENTICATED' });
    req.user = user;
    next();
  } catch { res.status(401).json({ success: false, message: 'Session expired. Please sign in again.', code: 'UNAUTHENTICATED' }); }
}
