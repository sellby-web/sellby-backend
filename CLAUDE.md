# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sellby Backend** is a NestJS-based REST API for a classified marketplace platform. Users can create and browse advertisements, upload images via Supabase Storage, message each other, and manage wishlists of favorite listings. Authentication uses JWT tokens stored in HTTP-only cookies.

**Stack:** NestJS 11 · TypeScript · PostgreSQL (Supabase) · Prisma ORM · Supabase Storage · Jest + Supertest

## Architecture

### Module Structure

Each domain is a self-contained NestJS feature module with its own controller, service, and DTOs:

```
src/
├── auth/           # Signup, signin, logout — issues JWT cookie
├── user/           # User CRUD, search, soft-delete
├── advertisement/  # Marketplace listing management (minimal)
├── asset/          # Supabase signed URL generation for uploads/downloads
├── message/        # User-to-user messaging (stub)
├── wishlist/       # Favorite advertisements (stub)
├── supabase/       # Supabase client singleton
├── prisma/         # PrismaService (database connection)
└── app.module.ts   # Root module
```

### Request Flow

Client → Controller (HTTP decorators) → DTO validation (class-validator) → Service → PrismaService → PostgreSQL

### Key Patterns

- **Response DTOs** always exclude `password`. See `UserResponseDto` as the reference pattern.
- **Soft deletes** via `isDeleted` flag on User and Message — no hard deletes.
- **Cookie auth:** JWT stored as HTTP-only cookie named `Authentication`. Cookie security options (sameSite, secure) are driven by env vars, defaulting to lax/false for local dev.
- **Signed URLs:** Asset module generates 1-hour signed URLs via Supabase Storage for upload and view operations.
- **Prisma adapter:** Uses `@prisma/adapter-pg` for connection pooling (not the default Prisma engine).

### Database Schema (prisma/schema.prisma)

- **User:** email (unique), hashed password, role, soft-delete flag
- **Advertisement:** title, description, price, createdBy → User
- **Asset:** url, position, advertisementId, createdBy, soft-delete with deletion timestamp
- **Message:** senderId, receiverId, text, read flag, soft-delete
- **Wishlist / WishlistAdvertisement:** user's saved ads; junction table with unique(wishlistId, advertisementId)

## Commands

### Development

```bash
npm install          # Install deps (triggers `prisma generate` via postinstall)
npm run start:dev    # Watch mode with hot reload (recommended)
npm run start:debug  # Watch + Node inspector
```

Server starts on `process.env.PORT ?? 3001`. CORS is hardcoded to `http://localhost:5173`.

### Build

```bash
npm run build        # Compile TypeScript → dist/
npm run start:prod   # Run compiled output (dist/main.js)
```

### Code Quality

```bash
npm run lint         # ESLint with auto-fix
npm run format       # Prettier
```

### Testing

```bash
npm test                                        # All unit tests (*.spec.ts in src/)
npm test -- user.service.spec.ts               # Single file
npm test -- --testNamePattern="should.*"       # By name pattern
npm run test:watch                              # Watch mode
npm run test:cov                                # Coverage report → coverage/
npm run test:e2e                                # E2E tests (test/jest-e2e.json)
```

### Prisma

```bash
npx prisma generate                           # Regenerate client (after schema changes)
npx prisma migrate dev --name <name>         # Create + apply migration (dev)
npx prisma migrate deploy                    # Apply pending migrations (production)
npx prisma studio                            # GUI database browser
```

Generated client lives in `generated/prisma/client/`.

## Configuration

Required `.env` variables:

```
DATABASE_URL=postgresql://...       # Supabase PostgreSQL connection string
SUPABASE_URL=https://...            # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=...       # Supabase service role key
BUCKET_NAME=ad-images               # Supabase storage bucket
JWT_SECRET=...                      # JWT signing secret
JWT_EXPIRES_IN=1d                   # Token expiry (default: 1d)
NODE_ENV=development|production
PORT=3001                           # Optional
```

Optional cookie overrides: `AUTH_COOKIE_NAME`, `COOKIE_SECURE`, `COOKIE_SAMESITE`, `COOKIE_MAX_AGE`.

## REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/signup | Register + set JWT cookie |
| POST | /auth/signin | Login + set JWT cookie |
| POST | /auth/logout | Clear cookie |
| GET | /users | List users (paginated) |
| GET | /users/search | Search by name/email |
| GET | /users/:id | Get user |
| PATCH | /users/:id | Update user |
| DELETE | /users/:id | Soft delete |
| POST | /advertisements | Create listing |
| GET | /advertisements | List listings |
| GET | /assets/upload-url/:fileName | Signed upload URL |
| GET | /assets/view-url/:path | Signed view URL |
| POST | /messages | Send message |
| GET | /messages/:userId | Conversation with user |
| POST | /wishlists | Create wishlist |
| POST | /wishlists/:id/advertisements | Add ad to wishlist |

`advertisement`, `message`, and `wishlist` modules are minimal stubs needing expansion.

## Adding a New Module

1. Create `src/<feature>/` with `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`
2. Add models to `prisma/schema.prisma` and run `npx prisma migrate dev`
3. Create DTOs in `src/<feature>/dto/` with class-validator decorators
4. Import the module in `app.module.ts`
