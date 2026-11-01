import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/index.js';

const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.email(), password: z.string().min(8).max(100) });
const loginSchema = z.object({ email: z.email(), password: z.string().min(1) });
export const publicUser = user => ({ id: user.id, name: user.name, email: user.email, avatar: user.avatar });
const hashToken = token => createHash('sha256').update(token).digest('hex');
export const refreshCookieOptions = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/v1/auth', maxAge: 7 * 24 * 60 * 60 * 1000 };
async function issueTokens(user) {
  const token = jwt.sign({ sub: user.id, tokenUse: 'access' }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const refreshToken = randomBytes(48).toString('base64url');
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { user: publicUser(user), token, refreshToken };
}
export async function register(input) {
  const data = registerSchema.parse(input);
  const user = await User.create({ name: data.name, email: data.email.toLowerCase(), passwordHash: await bcrypt.hash(data.password, 12) });
  return issueTokens(user);
}
export async function login(input) {
  const data = loginSchema.parse(input);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) { const e = new Error('Email or password is incorrect.'); e.status = 401; throw e; }
  return issueTokens(user);
}
export async function refresh(refreshToken) {
  if (!refreshToken) { const error = new Error('Your session expired. Please sign in again.'); error.status = 401; throw error; }
  const hash = hashToken(refreshToken);
  const user = await User.findOne({ refreshTokenHash: hash });
  if (!user) { const error = new Error('Your session expired. Please sign in again.'); error.status = 401; throw error; }
  user.refreshTokenHash = undefined;
  return issueTokens(user);
}
export async function logout(user) { await User.updateOne({ _id: user.id }, { $unset: { refreshTokenHash: 1 } }); }
