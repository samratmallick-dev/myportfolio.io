# Authentication & Authorization — Architecture

> Production-grade admin auth for the Fullstack Portfolio platform.
> Reference implementation: `src.zip` (bugs fixed — see [§6](#6-fixed-reference-implementation-bugs)).

---

## 1. Goals & non-goals

**Goals**

- One-time, secret-protected admin bootstrap. No public registration anywhere (frontend or backend).
- Short-lived JWT access token (15 min) held **in Redux memory only**.
- Opaque refresh token, **crypto-random**, stored **SHA-256 hashed** in MongoDB, raw value only inside an **HTTP-only cookie**, **rotated on every refresh**, **reuse-detected** (replay ⇒ session revoked).
- Preserve the existing layered architecture: `Routes → Middleware → Controller → Service → Repository → Model`.
- Preserve every existing portfolio feature: caching (`httpCache.js`, `sectionCache.js`, `usePortfolioSync.js`), Socket.IO, uploads, and the `{success, message, data, timestamp}` response envelope.
- No new runtime dependencies; no hardcoded secrets; no suppressed tests.

**Non-goals**

- Public/user registration or multi-tenant RBAC (single `admin` role; role plumbing exists for future roles).
- Refresh tokens in `localStorage` (explicitly rejected by the threat model).

---

## 2. Current vs proposed flows

### Before (legacy)

```
POST /api/v1/admin/initialize        ← PUBLIC, no secret: anyone could create an admin
POST /api/v1/admin/login             → 1-day JWT written to a `token` cookie + returned in JSON
                                       (token also duplicated into localStorage `adminToken`)
GET  /api/v1/admin/get-admin-user    → authenticate checks ONLY the JWT signature
                                       (no session, no account-status, no revocation)
Frontend CheckAuth                    → trusts localStorage `adminToken` (forgeable, never expires)
Logout                               → clears cookie only; token stays valid until expiry
```

Weaknesses: unbounded token lifetime, no revocation, client-side trust, public admin creation, secret fallback (`JWT_SECRET || "fallback_secret_key"`).

### After (this implementation)

```
┌──────────────┐  POST /admin/bootstrap (X-Admin-Bootstrap-Secret)  ┌──────────────┐
│ first admin  │ ─────────────────────────────────────────────────► │ Admin (1×)   │
└──────────────┘   atomic: sparse-unique `bootstrapKey` index       └──────────────┘

LOGIN
  POST /admin/login ──► bcrypt compare ──► AdminSession created
        │   response : { admin, accessToken }        (JSON — access token only)
        │   Set-Cookie: refreshToken=<raw>           (HTTP-only, Path=/api/v1/admin)
        └── raw refresh token is NEVER in JSON, NEVER in localStorage

REFRESH (access token expired / app boot)
  POST /admin/refresh (cookie only)
        │   hash(cookie) → find session → CAS rotation (single winner)
        │   response : { admin, accessToken }  +  Set-Cookie: refreshToken=<new raw>
        └── replay of a rotated token:
              • within REFRESH_RACE_GRACE_MS of rotation → 401 (benign race, session kept)
              • outside the grace window               → 401 + session revoked (reuse)

EVERY PROTECTED REQUEST
  Authorization: Bearer <access JWT>
  authenticate → verify JWT (alg/iss/aud) → admin exists & isActive
               → passwordChangedAt not newer than iat → session alive (sid)
               → req.admin = { id, username, email, role, sessionId }

LOGOUT
  POST /admin/logout       revokes the session behind the cookie/Bearer, clears cookie
  POST /admin/logout-all   revokes every session of the admin
```

### Frontend state machine

```
isInitializing=true ──(main.jsx: ensureAuthInitialized)──┐
        │                                                │
        ▼                                                ▼
 POST /admin/refresh ──fail──► signed out (isInitializing=false)
        │ok
        ▼
 GET /admin/me ──► { admin, accessToken } in Redux MEMORY only
        │
        ▼
 401 on any request ──► single-flight refresh (ONE refresh for N concurrent 401s)
        │fail
        ▼
 clearAuthState + redirect /auth/login
```

---

## 3. API contract map

Base: `/api/v1/admin`

| Method | Path | Auth | Rate limit | Origin check | Notes |
| --- | --- | --- | --- | --- | --- |
| POST | `/bootstrap` | `X-Admin-Bootstrap-Secret` header | 5/h | ✔ | Creates first admin; 409 forever after; unknown fields → 400 |
| POST | `/login` | — | 10/15min | ✔ | Returns `{admin, accessToken}`; sets refresh cookie; clears legacy `token` cookie |
| POST | `/refresh` | refresh cookie | 60/15min | ✔ | Rotates refresh token; returns `{admin, accessToken}` |
| POST | `/logout` | cookie and/or Bearer | — | ✔ | Idempotent; clears cookies |
| POST | `/logout-all` | Bearer | — | ✔ | Revokes all sessions |
| GET | `/me` (alias `/get-admin-user`) | Bearer | — | — | `{admin}` without password/OTP fields |
| GET | `/sessions` | Bearer | — | — | Active sessions, no token material, `isCurrent` flag |
| DELETE | `/sessions/:id` | Bearer | — | — | Revoke one of own sessions |
| PATCH | `/change-password` | Bearer | 5/15min | ✔ | Requires current password; revokes **all** sessions |
| POST | `/create` | Bearer + role | 10/h | ✔ | Role never accepted from the client |
| POST | `/generate-otp` | Bearer | 8/15min | — | existing flow preserved |
| POST | `/verify-otp-update-email` | Bearer | 8/15min | — | existing flow preserved |
| POST | `/verify-otp-update-password` | Bearer | 8+5/15min | — | existing flow preserved; revokes all sessions |

**Removed:** `POST /initialize` (public admin creation) — returns 404.

**Response envelope** unchanged: `{success, message, data?, timestamp}` (errors add `errors[]`).

### Token & cookie contracts

| Artifact | Format | Lifetime | Storage | Rotation |
| --- | --- | --- | --- | --- |
| Access token | JWT HS256, claims `{sub, sid, role, type, iss, aud, iat, exp}` | 15 min (`JWT_ACCESS_EXPIRES_IN`) | Redux memory only | New token on every refresh/login |
| Refresh token | `base64url(64 random bytes)` | 7 d (`REFRESH_TOKEN_TTL_DAYS`) | HTTP-only cookie `refreshToken`, `Path=/api/v1/admin`; only SHA-256 digest in `AdminSession.refreshTokenHash` | Rotated on every refresh; history kept (`previousTokenHashes`, last 20) |
| Legacy cookie `token` | old 1-day JWT | — | cleared on login/logout | — |

---

## 4. Backend components

```
routes/v1Routes/admin.routes.js
   │  rate limits → verifyBrowserOrigin → validators → handlers
   ▼
controllers/admin.controller.js        (cookies in/out, envelope, no business logic)
   ▼
service/admin.service.js               (bootstrap lock, login, rotation/reuse, session policy)
   ▼
repository/admin.repository.js         (Admin CRUD; atomic bootstrap insert)
repository/adminSession.repository.js  (CAS rotation, conditional revokes)
   ▼
model/admin.model.js                   (bcrypt hash, password select:false, sparse-unique bootstrapKey)
model/adminSession.model.js            (hash only, TTL index, isUsable(), toSafeObject())
```

**Middleware**

| File | Responsibility |
| --- | --- |
| `middleware/admin-auth.middleware.js` | `authenticate`: JWT verify (alg/iss/aud) → admin exists/isActive → `passwordChangedAt` vs `iat` → live session → `req.admin` |
| `middleware/auth.middleware.js` | Backwards-compatible re-export (existing routes unchanged) |
| `middleware/admin-authorization.middleware.js` | `requireAdminRole(...)` / `requireAdmin` — must run after `authenticate` |
| `middleware/csrf.middleware.js` | `verifyBrowserOrigin` for every cookie-relying state-changing route |
| `middleware/rate-limit.middleware.js` | Single shared factory + per-endpoint limiters; `RATE_LIMIT_DISABLED=true` only in tests |
| `middleware/validation.middleware.js` | express-validator chains incl. bootstrap/change-password/create-admin + `rejectUnknownFields` |
| `middleware/error.middleware.js` | `res.headersSent` guard (reference bug fixed), no internal leakage on 5xx |

**Utilities**

| File | Responsibility |
| --- | --- |
| `utilities/password.utility.js` | async bcrypt only, 72-byte guard, `needsRehash`, no plaintext logging |
| `utilities/token.utility.js` | access-token sign/verify (explicit secret ≥32 chars, pinned HS256, issuer/audience), refresh generation/hash, `timingSafeEqualStrings` |
| `utilities/cookie.utility.js` | one definition of cookie name/path/secure/sameSite for set **and** clear; raw-token-only setter |
| `utilities/audit.util.js` | redacting audit log (passwords/tokens/OTP/hashes never logged) |
| `config/env.config.js` | fail-fast startup validation of all auth secrets |

**Data model**

- `Admin`: adds `role`, `isActive`, `lastLogin`, `passwordChangedAt`, sparse-unique `bootstrapKey` (DB-level single-bootstrap guarantee), `select:false` on password/OTP fields, `toJSON()` strips secrets.
- `AdminSession`: `refreshTokenHash` (unique), `previousTokenHashes[]`, `expiresAt` (+ TTL index), `revokedAt`, `lastUsedAt`, `userAgent`, `ipAddress`. Authorization always re-checks expiry/revocation explicitly (TTL cleanup is best-effort, up to 60 s late).

### Concurrency & atomicity

- **Bootstrap**: in-process promise lock *plus* the sparse-unique `bootstrapKey` insert — a concurrent duplicate loses with `E11000` → mapped to 409. Safe across multiple backend instances.
- **Refresh rotation**: `findOneAndUpdate({_id, refreshTokenHash: presented, revokedAt: null, expiresAt: {$gt: now}}, …)` — only one concurrent request can win; losers go through the replay handler.
- **Session revocation**: all revokes are conditional updates (`revokedAt: null` filter).

---

## 5. Frontend components

| File | Change |
| --- | --- |
| `store/auth.slice.js` | Rewritten: memory-only `accessToken`, `isInitializing`, `initializeAuth`/`ensureAuthInitialized` (single-flight, Strict Mode safe), session/password thunks; every failure path clears local state; **no localStorage reads/writes** |
| `store/store.js` | Injects the auth bridge into Axios (`configureAuthApi`) — avoids the `store ↔ api` circular import |
| `config/api.js` | `adminAuthEndpoints` expanded; request interceptor reads token from memory; response interceptor implements **single-flight refresh** (N concurrent 401 → 1 refresh → retry-once each), skips auth/public URLs, no redirect loop |
| `main.jsx` | Kicks off `ensureAuthInitialized(store.dispatch)` before first render |
| `components/common/CheckAuth.jsx` | Waits for `isInitializing`, then redirects; never trusts browser storage |
| `pages/auth/login.jsx` | Unchanged contract (works with new thunk); redirects once authenticated |
| `pages/admin-view/settings.jsx` | New **Active Sessions** card (list/revoke/sign-out-everywhere); password policy aligned to 8 chars |
| `components/admin-view/sidebar.jsx` | Logout always lands on the login screen (local state cleared even on network failure) |

HTTP caching is untouched: the cache adapter only applies to `cache: true` or `/public/` URLs (`isPublicUrl`), and auth endpoints pass `cache: false`.

---

## 6. Fixed reference-implementation bugs

| # | Reference bug | Fix here |
| --- | --- | --- |
| 1 | `setRefreshTokenCookies` received the **hashed** token after rotation | Controller passes the **new raw** token from the service (`setRefreshTokenCookie(res, refreshToken)`) |
| 2 | Raw refresh token returned in the JSON body | JSON carries only `{admin, accessToken}`; raw token only in the HTTP-only cookie |
| 3 | `bcrypt.hashSync/compareSync` inside `async` functions (blocks the event loop) | `utilities/password.utility.js` uses async bcrypt exclusively |
| 4 | `req.headerSent` (always `undefined`) | `res.headersSent` in `error.middleware.js` |
| 5 | `logout-all` route mapped to the single-logout handler | Distinct `POST /logout-all` → `adminController.logoutAll` |
| 6 | Fallback secret `process.env.JWT_SECRET \|\| "fallback_secret_key"` | Fail-fast validation; `JWT_ACCESS_SECRET` ≥32 chars required, no fallback |
| 7 | CORS rejection surfaced as HTTP 500 | Rejected origins now get a clean **403** (`ApiError.forbidden`) |

---

## 7. Security properties summary

- **No public registration**: `/initialize` removed; `/bootstrap` needs a 32+ char backend-only secret (constant-time compare), one-shot at the DB level.
- **No secret in code**: everything from environment; startup fails fast when missing/unsafe.
- **No token in localStorage/sessionStorage**: verified by automated tests that dump browser storage.
- **No refresh token in JSON/logs**: audit logger redacts `token|secret|password|otp|hash|cookie|…` keys.
- **Revocation**: password change, OTP password update, logout, logout-all, and reuse detection all revoke sessions; `passwordChangedAt` kills outstanding access tokens within one request.
- **CSRF**: HTTP-only cookie + explicit `Origin` validation on every cookie-relying mutation (plus CORS allow-list).
- **Brute force**: per-endpoint rate limits (login 10/15 min, bootstrap 5/h, refresh 60/15 min, password change 5/15 min).
- **Enumeration**: identical "Invalid email or password" for unknown email vs wrong password.
