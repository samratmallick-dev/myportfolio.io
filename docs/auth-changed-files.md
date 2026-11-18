# Authentication — Changed-File Report

Scope: production-grade auth upgrade (backend + frontend), integrated without breaking portfolio
features. Generated from `git status` on 2026-11-18.

Legend: **A** = added · **M** = modified · **T** = newly tracked (file existed but was hidden by
`.gitignore` test rules) · **U** = pre-existing user edit, preserved.

---

## 1. Backend — modified (10)

| File | Change |
| --- | --- |
| `backend/src/routes/v1Routes/admin.routes.js` | **A/M** Rewritten: removed public `POST /initialize`; added `/bootstrap`, `/refresh`, `/logout-all`, `/me`, `/sessions`, `/sessions/:id`, `/change-password`, `/create`; per-endpoint rate limits, `verifyBrowserOrigin`, expanded validators, `rejectUnknownFields`; kept legacy `/get-admin-user` and all OTP routes |
| `backend/src/controllers/admin.controller.js` | **M** New handlers (bootstrap/login/refresh/logout/logout-all/me/sessions/change-password/create-admin); raw refresh token → cookie only; legacy-cookie cleanup; OTP handlers preserved (password OTP now clears the cookie too) |
| `backend/src/service/admin.service.js` | **M** Rewritten: atomic bootstrap with in-process lock + `E11000` mapping; session-based login; CAS refresh rotation with grace-window vs reuse-revoke; logout/logout-all; session listing/revocation; password-change session policy; OTP flows preserved (now async bcrypt, `$set/$unset` updates) |
| `backend/src/model/admin.model.js` | **M** `select:false` secrets, sparse-unique `bootstrapKey`, `role/isActive/lastLogin/passwordChangedAt`, `comparePassword` via async utility, hardened `toJSON` |
| `backend/src/repository/admin.repository.js` | **M** `findByEmailWithPassword`, `adminExists`, atomic `createInitialAdmin`, secret-selecting lookups |
| `backend/src/middleware/auth.middleware.js` | **M** Now a backwards-compatible re-export of the new session-aware `authenticate` (existing importers unchanged) |
| `backend/src/middleware/error.middleware.js` | **M** `res.headersSent` guard (reference bug #4), no internal leakage on unexpected 5xx, Multer/JWT mapping kept |
| `backend/src/middleware/validation.middleware.js` | **M** Added `validateBootstrap`, `validateChangePassword`, `validateCreateAdmin`, `validateSessionId`, `rejectUnknownFields`; password policy 8–72; login keeps 1+ (legacy passwords) |
| `backend/src/app.js` | **M** CORS allowed-header `X-Admin-Bootstrap-Secret`; CORS rejection now **403** instead of 500 |
| `backend/src/server.js` | **M/U+M** User's graceful-shutdown edit preserved **and** `createServer` + `initializeSocket(httpServer)` restored (Socket.IO was missing); `validateEnvironment()` runs before listening |
| `backend/.gitignore` | **M** Removed `**/__tests__`, `**/test`, `**/*.test.js`, `**/*.spec.js` so the test suite is actually versioned; added `coverage/` |
| `README.md` | **M** Auth flow, API routes, setup (bootstrap curl), env vars, and development notes updated |

> `backend/src/config/db/config.db.js` is a **pre-existing user edit** (simplified `connectDb`) —
> left untouched.

## 2. Backend — added (12 + tests)

| File | Purpose |
| --- | --- |
| `backend/src/model/adminSession.model.js` | **A** Session document: SHA-256 refresh hash, rotation history, expiry/revocation, TTL index, `toSafeObject()` |
| `backend/src/repository/adminSession.repository.js` | **A** Atomic rotation (`findOneAndUpdate` CAS), conditional revokes, active-session queries |
| `backend/src/middleware/admin-auth.middleware.js` | **A** `authenticate`: JWT (alg/iss/aud) → admin active → `passwordChangedAt` vs `iat` → live session → `req.admin` |
| `backend/src/middleware/admin-authorization.middleware.js` | **A** `requireAdminRole(...)` / `requireAdmin` |
| `backend/src/middleware/csrf.middleware.js` | **A** `verifyBrowserOrigin` for cookie-relying mutations |
| `backend/src/middleware/rate-limit.middleware.js` | **A** Single shared limiter factory + login/bootstrap/refresh/password/create/OTP limiters, test opt-out |
| `backend/src/utilities/password.utility.js` | **A** Async bcrypt only, 72-byte guard, rehash detection |
| `backend/src/utilities/token.utility.js` | **A** Access-token sign/verify (pinned HS256, issuer/audience, ≥32-char secret), refresh generation/SHA-256, constant-time compare |
| `backend/src/utilities/cookie.utility.js` | **A** Single source of truth for refresh-cookie set/clear + legacy `token` cookie cleanup |
| `backend/src/utilities/audit.util.js` | **A** Redacting security audit log |
| `backend/src/config/env.config.js` | **A** Fail-fast startup validation of auth/cookie/bootstrap configuration |
| `backend/.env.example` | **A** Fully commented environment template (placeholders only, no secrets) |

### Backend tests (7 files)

- **A** `backend/tests/admin-auth-flow.test.js` (22) · `auth-token.test.js` (13) ·
  `auth-password.test.js` (6) · `auth-cookie.test.js` (9) · `csrf.test.js` (4)
- **T** `backend/tests/cache.test.js` (8) · `pagination.test.js` (6) — pre-existing, now tracked

## 3. Frontend — modified (8)

| File | Change |
| --- | --- |
| `frontend/src/store/auth.slice.js` | **M** Rewritten: memory-only access token, `isInitializing`, `initializeAuth`/`ensureAuthInitialized`/`resetAuthInitialization`, refresh/session/password/create thunks, every failure path clears local state; **zero localStorage use**; OTP flows preserved |
| `frontend/src/store/store.js` | **M** Injects the auth bridge (`configureAuthApi`) so Axios can read memory state / trigger refresh without a circular import |
| `frontend/src/config/api.js` | **M** Expanded `adminAuthEndpoints` (refresh/me/sessions/change-password/logout-all/create); request interceptor reads memory token; response interceptor with **single-flight refresh**, retry-once, skip lists, loop-proof redirect; auth helpers all use `cache: false` |
| `frontend/src/components/common/CheckAuth.jsx` | **M** Waits for server-side initialization, then routes; no trust in browser storage |
| `frontend/src/pages/admin-view/settings.jsx` | **M** New **Active Sessions** card (list / revoke / sign-out-everywhere); password min-length aligned to 8 |
| `frontend/src/components/admin-view/sidebar.jsx` | **M** Logout always lands on login (state cleared even on network failure) |
| `frontend/src/main.jsx` | **M** Kicks off `ensureAuthInitialized` before first render |
| `frontend/.gitignore` | **M** Removed test-ignore rules; added `coverage` |

Unchanged but load-bearing (verified, not edited): `pages/auth/login.jsx`,
`components/common/form.jsx`, `config/allFormIndex.js`, `config/api.js` cache adapter,
`utils/httpCache.js`, `utils/sectionCache.js`, `hooks/usePortfolioSync.js`, `hooks/useSocket.js`.

## 4. Frontend — added (tests)

- **A** `frontend/src/config/api.interceptors.test.js` (10) ·
  `frontend/src/store/auth.slice.test.js` (14) · `frontend/src/test/setup.js`
  (recreated — the configured Vitest setup file was missing).
- **T** previously-ignored, now tracked: `src/test/{httpCache,sectionCache,publicSlice,projectSlice}.test.js`,
  `src/store/__tests__/{public,project}.slice.test.js`,
  `src/pages/client-view/__tests__/project-listing.test.jsx`,
  `src/hooks/__tests__/useLazySection.test.jsx`,
  `src/utils/__tests__/{imageOptimization,performance}.test.js`.

## 5. Documentation

- **A** `docs/auth-architecture.md` — flows (before/after), API contract map, components,
  concurrency, reference-bug fixes, security properties.
- **A** `docs/auth-migration-deployment.md` — env vars, zero-data migration, deploy + bootstrap
  steps, verification checklist, rollback.
- **A** `docs/auth-testing-report.md` — suite inventory and requirement→test mapping.
- **A** `docs/auth-changed-files.md` — this report.
- **M** `README.md` (see above).

## 6. Not changed (explicitly preserved)

- All portfolio CRUD routes/services/controllers/repositories (hero, about, education, skills,
  services, projects, contact, messages), uploads (Multer/Cloudinary), Socket.IO config,
  email/OTP infrastructure, response envelope, HTTP/section caching layers.
- Existing `admins` documents and password hashes (no migration required).
- No new runtime dependencies (`package.json` files untouched).
- Root `.gitignore`, `src.zip`, `backend/.env`, `frontend/.env` — untouched / never committed.

## 7. Known pre-existing state (not introduced by this work)

- `backend/src/config/db/config.db.js` — user edit left as-is.
- Test files were previously untracked due to `.gitignore`; now included so the suite ships.
