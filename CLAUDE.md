# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GRIDLOCK API is a Node.js/Express backend for a car enthusiasts meetup platform. It manages events, participants, real-time chat, and media uploads. Written in TypeScript.

## Commands

```bash
# Development
npm run dev                  # Start dev server with tsx (auto-reload, no build step needed)
npm run build                # Compile TypeScript to dist/
npm start                    # Start production server (requires npm run build first)

# Database
npm run prisma:generate      # Regenerate Prisma client after schema changes
npm run prisma:migrate       # Run migrations (uses DATABASE_URL from .env)
npx prisma studio            # Open Prisma visual DB browser
```

There are no test or lint scripts defined — if adding them, use Jest and ESLint.

## Environment Setup

Copy `.env.example` to `.env` and fill in values. Required vars:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — signing secrets
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` — for file uploads (optional)
- `PORT` — defaults to 3000

Environment variables are validated with Zod at startup in `src/config/env.ts`. Missing required vars will crash the process with a clear error.

## Architecture

**Entry flow:** `src/server.ts` → creates HTTP server + Socket.io → `src/app.ts` (Express app with routes mounted).

**Module pattern:** Each feature lives in `src/modules/<name>/` with three files:
- `*.routes.ts` — Express router, wires paths to controller functions
- `*.controller.ts` — parses req/res, calls service, sends response
- `*.service.ts` — business logic + Prisma queries (no req/res here)

**Modules:**
- `auth` — register, login, refresh token (JWT, implemented)
- `users` — user profiles and car garage (stub)
- `events` — event CRUD and participant management (stub)
- `chat` — message persistence (Socket.io real-time is in server.ts, stub module)
- `moderation` — admin event approval workflow (stub)

**Middlewares:**
- `auth.middleware.ts` — validates Bearer JWT, attaches `{ id, role }` to `req.user`
- `role.middleware.ts` — factory `roleMiddleware(...roles: Role[])` used to guard routes by Prisma Role enum
- `upload.middleware.ts` — multer + S3 setup (stub)

**Shared infrastructure:**
- `src/config/db.ts` — singleton `prisma` client (import this, never instantiate PrismaClient directly)
- `src/config/env.ts` — exports typed `env` object (use instead of `process.env`)
- `src/utils/errors.ts` — `AppError` class with `message` + `statusCode` (throw this in services)
- `src/types/express.d.ts` — augments `Express.Request` to include `user?: { id, role }`

**Database:** PostgreSQL via Prisma. Schema at `prisma/schema.prisma`. Key models: `User`, `Car`, `Event`, `EventParticipant`, `ChatMessage`, `ModerationLog`. Key enums: `Role` (PARTICIPANT, ORGANIZER, ADMIN), `EventStatus`, `ParticipantStatus`.

**Real-time chat:** Socket.io in `server.ts` organizes rooms as `event:{eventId}`. Events: `join:event`, `event:message`, `disconnect`.

**Auth tokens:** Access token expires in 15 min, refresh token in 7 days. Both signed with separate secrets from `env`.

## Docker

```bash
docker build -t gridlock-api .
docker run -p 3000:3000 --env-file .env gridlock-api
```

The Dockerfile uses a multi-stage build: stage 1 compiles TypeScript, stage 2 runs `dist/server.js` with production deps only.
