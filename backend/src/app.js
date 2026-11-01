import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import { env } from './config/env.js';
import { User, Mystery, MysterySolution, InvestigationSession, GenerationJob } from './models/index.js';
import { login, register, refresh, logout, refreshCookieOptions } from './services/auth.js';
import { runGeneration } from './services/generator.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(pinoHttp({ redact: ['req.headers.authorization'] }));
app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
app.post('/api/v1/auth/register', authLimit, wrap(async (req, res) => { const { refreshToken, ...data } = await register(req.body); res.cookie('afterlight-refresh', refreshToken, refreshCookieOptions); res.status(201).json({ success: true, data }); }));
app.post('/api/v1/auth/login', authLimit, wrap(async (req, res) => { const { refreshToken, ...data } = await login(req.body); res.cookie('afterlight-refresh', refreshToken, refreshCookieOptions); res.json({ success: true, data }); }));
app.post('/api/v1/auth/refresh', authLimit, wrap(async (req, res) => { const { refreshToken, ...data } = await refresh(req.cookies['afterlight-refresh']); res.cookie('afterlight-refresh', refreshToken, refreshCookieOptions); res.json({ success: true, data }); }));
app.post('/api/v1/auth/logout', requireAuth, wrap(async (req, res) => { await logout(req.user); res.clearCookie('afterlight-refresh', { ...refreshCookieOptions, maxAge: undefined }); res.json({ success: true, data: {} }); }));
app.get('/api/v1/auth/me', requireAuth, (req, res) => res.json({ success: true, data: { user: req.user } }));
app.get('/api/v1/users/me', requireAuth, (req, res) => res.json({ success: true, data: { user: req.user } }));
app.patch('/api/v1/users/me', requireAuth, wrap(async (req, res) => {
  const { name } = z.object({ name: z.string().trim().min(2).max(80) }).parse(req.body);
  req.user.name = name; await req.user.save();
  res.json({ success: true, data: { user: { id: req.user.id, name: req.user.name, email: req.user.email, avatar: req.user.avatar } } });
}));

app.post('/api/v1/mysteries/generate', requireAuth, wrap(async (req, res) => {
  const input = z.object({ scenario: z.string().trim().min(30).max(2000), title: z.string().trim().max(100).optional(), category: z.enum(['THEFT','MURDER_MYSTERY','MISSING_PERSON','CORPORATE_ESPIONAGE','CYBER_MYSTERY','RELATIONSHIP_MYSTERY','HISTORICAL_MYSTERY','GENERAL']).default('GENERAL'), difficulty: z.enum(['EASY','MEDIUM','HARD']).default('MEDIUM'), suspectCount: z.coerce.number().int().min(3).max(6).default(4), evidenceTypes: z.array(z.enum(['CHAT','IMAGE','CCTV','DOCUMENT','WITNESS_STATEMENT'])).optional() }).parse(req.body);
  const mystery = await Mystery.create({ ownerId: req.user.id, title: input.title || 'An untitled case', description: input.scenario, category: input.category, difficulty: input.difficulty, status: 'GENERATING' });
  const job = await GenerationJob.create({ userId: req.user.id, mysteryId: mystery.id, status: 'PENDING', currentStage: 'SCENARIO_ANALYSIS' });
  setImmediate(() => runGeneration(job.id, input));
  res.status(202).json({ success: true, data: { jobId: job.id, mysteryId: mystery.id, status: job.status } });
}));
app.get('/api/v1/mysteries/generation/:jobId', requireAuth, wrap(async (req, res) => {
  const job = await GenerationJob.findOne({ _id: req.params.jobId, userId: req.user.id });
  if (!job) return res.status(404).json({ success: false, message: 'Generation job not found.', code: 'NOT_FOUND' });
  res.json({ success: true, data: { jobId: job.id, mysteryId: job.mysteryId, status: job.status, currentStage: job.currentStage, errorCode: job.errorCode, errorMessage: job.errorMessage, errorDetails: job.errorDetails } });
}));
app.get('/api/v1/mysteries', requireAuth, wrap(async (req, res) => {
  const status = ['READY','GENERATING','FAILED'].includes(req.query.status) ? req.query.status : undefined;
  const mysteries = await Mystery.find({ ownerId: req.user.id, ...(status ? { status } : {}) }).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, data: { mysteries } });
}));
app.get('/api/v1/mysteries/:id', requireAuth, wrap(async (req, res) => {
  const mystery = await Mystery.findOne({ _id: req.params.id, ownerId: req.user.id }).lean();
  if (!mystery) return res.status(404).json({ success: false, message: 'Case not found.', code: 'NOT_FOUND' });
  res.json({ success: true, data: { mystery } });
}));
app.delete('/api/v1/mysteries/:id', requireAuth, wrap(async (req, res) => {
  const mystery = await Mystery.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
  if (!mystery) return res.status(404).json({ success: false, message: 'Case not found.', code: 'NOT_FOUND' });
  await Promise.all([MysterySolution.deleteOne({ mysteryId: mystery.id }), InvestigationSession.deleteMany({ mysteryId: mystery.id }), GenerationJob.deleteMany({ mysteryId: mystery.id })]);
  res.json({ success: true, data: {} });
}));

async function ownedMystery(userId, mysteryId) {
  const mystery = await Mystery.findOne({ _id: mysteryId, ownerId: userId });
  if (!mystery) { const error = new Error('Case not found.'); error.status = 404; throw error; }
  if (mystery.status !== 'READY') { const error = new Error('This case is not ready yet.'); error.status = 409; throw error; }
  return mystery;
}
app.post('/api/v1/investigations/:mysteryId/start', requireAuth, wrap(async (req, res) => {
  await ownedMystery(req.user.id, req.params.mysteryId);
  const session = await InvestigationSession.findOneAndUpdate({ userId: req.user.id, mysteryId: req.params.mysteryId }, { $setOnInsert: { status: 'IN_PROGRESS' }, $set: { lastAccessedAt: new Date() } }, { new: true, upsert: true });
  res.json({ success: true, data: { session } });
}));
app.get('/api/v1/investigations/:mysteryId', requireAuth, wrap(async (req, res) => {
  const mystery = await ownedMystery(req.user.id, req.params.mysteryId);
  const session = await InvestigationSession.findOne({ userId: req.user.id, mysteryId: mystery.id });
  if (!session) return res.status(404).json({ success: false, message: 'Start this investigation first.', code: 'SESSION_NOT_FOUND' });
  res.json({ success: true, data: { mystery, session } });
}));
app.patch('/api/v1/investigations/:mysteryId/progress', requireAuth, wrap(async (req, res) => {
  const { viewedEvidenceIds } = z.object({ viewedEvidenceIds: z.array(z.string()).max(100) }).parse(req.body);
  const mystery = await ownedMystery(req.user.id, req.params.mysteryId);
  if (viewedEvidenceIds.some(id => !mystery.evidence.some(item => item.evidenceId === id))) return res.status(400).json({ success: false, message: 'One or more evidence items do not belong to this case.', code: 'INVALID_EVIDENCE' });
  const session = await InvestigationSession.findOneAndUpdate({ userId: req.user.id, mysteryId: mystery.id, status: 'IN_PROGRESS' }, { viewedEvidenceIds, lastAccessedAt: new Date() }, { new: true });
  if (!session) return res.status(404).json({ success: false, message: 'Investigation session not found.', code: 'SESSION_NOT_FOUND' });
  res.json({ success: true, data: { session } });
}));
app.patch('/api/v1/investigations/:mysteryId/notes', requireAuth, wrap(async (req, res) => {
  const { notes } = z.object({ notes: z.string().max(10000) }).parse(req.body);
  const session = await InvestigationSession.findOneAndUpdate({ userId: req.user.id, mysteryId: req.params.mysteryId, status: 'IN_PROGRESS' }, { notes, lastAccessedAt: new Date() }, { new: true });
  if (!session) return res.status(404).json({ success: false, message: 'Investigation session not found.', code: 'SESSION_NOT_FOUND' });
  res.json({ success: true, data: { session } });
}));
app.get('/api/v1/mysteries/:mysteryId/evidence', requireAuth, wrap(async (req, res) => {
  const mystery = await ownedMystery(req.user.id, req.params.mysteryId);
  const session = await InvestigationSession.findOne({ userId: req.user.id, mysteryId: mystery.id });
  if (!session) return res.status(403).json({ success: false, message: 'Start this investigation first.', code: 'FORBIDDEN' });
  res.json({ success: true, data: { evidence: mystery.evidence } });
}));
app.get('/api/v1/mysteries/:mysteryId/evidence/:evidenceId', requireAuth, wrap(async (req, res) => {
  const mystery = await ownedMystery(req.user.id, req.params.mysteryId);
  const session = await InvestigationSession.findOne({ userId: req.user.id, mysteryId: mystery.id });
  const evidence = mystery.evidence.find(item => item.evidenceId === req.params.evidenceId);
  if (!session) return res.status(403).json({ success: false, message: 'Start this investigation first.', code: 'FORBIDDEN' });
  if (!evidence) return res.status(404).json({ success: false, message: 'Evidence not found.', code: 'NOT_FOUND' });
  res.json({ success: true, data: { evidence } });
}));
app.post('/api/v1/investigations/:mysteryId/accuse', requireAuth, wrap(async (req, res) => {
  const { suspectId } = z.object({ suspectId: z.string().min(1) }).parse(req.body);
  const mystery = await ownedMystery(req.user.id, req.params.mysteryId);
  if (!mystery.suspects.some(s => s.suspectId === suspectId)) return res.status(400).json({ success: false, message: 'Choose a suspect in this case.', code: 'INVALID_SUSPECT' });
  const session = await InvestigationSession.findOne({ userId: req.user.id, mysteryId: mystery.id });
  if (!session) return res.status(404).json({ success: false, message: 'Investigation session not found.', code: 'SESSION_NOT_FOUND' });
  if (session.status === 'COMPLETED') return res.status(409).json({ success: false, message: 'This accusation has already been submitted.', code: 'ALREADY_COMPLETED' });
  const solution = await MysterySolution.findOne({ mysteryId: mystery.id });
  if (!solution) return res.status(500).json({ success: false, message: 'The case solution is unavailable.', code: 'SOLUTION_MISSING' });
  session.status = 'COMPLETED'; session.selectedSuspectId = suspectId; session.isCorrect = suspectId === solution.culpritSuspectId; session.submittedAt = new Date(); await session.save();
  res.json({ success: true, data: { ...resultPayload(mystery, solution, session) } });
}));
app.get('/api/v1/investigations/:mysteryId/result', requireAuth, wrap(async (req, res) => {
  const mystery = await Mystery.findOne({ _id: req.params.mysteryId, ownerId: req.user.id });
  const session = await InvestigationSession.findOne({ userId: req.user.id, mysteryId: req.params.mysteryId });
  if (!mystery || !session) return res.status(404).json({ success: false, message: 'Investigation not found.', code: 'NOT_FOUND' });
  if (session.status !== 'COMPLETED') return res.status(409).json({ success: false, message: 'Submit your accusation to see the report.', code: 'RESULT_NOT_READY' });
  const solution = await MysterySolution.findOne({ mysteryId: mystery.id });
  res.json({ success: true, data: resultPayload(mystery, solution, session) });
}));
function resultPayload(mystery, solution, session) {
  return { isCorrect: session.isCorrect, selectedSuspect: mystery.suspects.find(s => s.suspectId === session.selectedSuspectId), actualCulprit: mystery.suspects.find(s => s.suspectId === solution.culpritSuspectId), solution: { motive: solution.motive, opportunity: solution.opportunity, completeExplanation: solution.completeExplanation, incidentReconstruction: solution.incidentReconstruction, decisiveEvidenceIds: solution.decisiveEvidenceIds, supportingEvidenceIds: solution.supportingEvidenceIds, redHerrings: solution.redHerrings, suspectVerdicts: solution.suspectVerdicts } };
}

app.use(notFound);
app.use(errorHandler);
export default app;
