# Afterlight — AI Mystery Room

An investigation experience for fictional, AI-generated cases. The React client talks to an Express API; MongoDB stores accounts, cases, private solutions, progress, and generation jobs.

## Run locally

1. Install Node.js 20+ and MongoDB.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, a strong `JWT_SECRET`, and `GEMINI_API_KEY`.
3. From this directory run `npm install` (the root npm workspace installs all packages).
4. Run `npm run dev`. The client is at `http://localhost:5173`; the API is at `http://localhost:4000`.

Gemini is required for case generation. Cases are generated asynchronously and validated before publication. Image generation is optional; evidence viewers use designed text treatments when no media provider is configured.

## API

API root: `/api/v1`. Register or sign in for a 15-minute bearer access token and an HttpOnly rotating refresh cookie. Main routes include `POST /auth/refresh`, `POST /auth/logout`, `POST /mysteries/generate`, `GET /mysteries`, `GET /mysteries/generation/:jobId`, `POST /investigations/:mysteryId/start`, progress and notes PATCH routes, evidence GET routes, and `POST /investigations/:mysteryId/accuse`.

The investigation room is available at `/mysteries/:id`. It opens the selected case from the authenticated dashboard and loads the existing public mystery and session endpoints. `/case/:id` remains available for the earlier room view.

## Implementation notes

The hidden solution is stored in its own collection. Public mystery responses omit it. Accusations are evaluated against the stored culprit in backend code, once per session. Generation uses a truth-first prompt and Zod validation, with bounded retries and a job record. See `spec.md` for the complete product contract and phased acceptance criteria.
