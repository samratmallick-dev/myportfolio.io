# Authentication — Testing Report

Date: 2026-11-18 · Branch: `main` · All suites green.

| Suite | Command | Result |
| --- | --- | --- |
| Backend | `cd backend && npm test` (`node --test tests/`) | **68/68 pass**, 0 fail (7 files) |
| Frontend | `cd frontend && npm test` (`vitest run`) | **85/85 pass**, 0 fail (12 files) |
| Lint | `cd frontend && npm run lint` (`eslint .`) | **0 errors, 0 warnings** |
| Build | `cd frontend && npm run build` (`vite build`) | **✓ built in ~32 s** |
| Syntax | `node --check` on 21 changed/new backend files | **21/21 OK** |

No tests were skipped, skipped-over, or suppressed. `.gitignore` was corrected so test files are
actually tracked (they were previously excluded by `**/*.test.js` / `**/test/` rules — see
[changed-files report](auth-changed-files.md)).

---

## 1. Backend test inventory (68 tests / 7 files)

### `tests/admin-auth-flow.test.js` — 22 tests (new)
Full HTTP integration: the real Express app (routes → validation → CSRF → rate-limit → middleware →
controller → service → JWT/cookie/bcrypt utilities) over `http.createServer`, with **only** the two
repositories replaced by an in-memory store (no MongoDB needed).

| Area | Verified |
| --- | --- |
| Bootstrap | missing secret header → 400 · wrong secret → 403 · unknown privileged field (`role`) → 400 · password < 8 → 400 · success → 201 with **no password/hash/`bootstrapKey`** in JSON · stored value is a bcrypt hash, not plaintext · second attempt → 409 · concurrent-duplicate simulated via `E11000` mapping |
| Removed surface | `POST /api/v1/admin/initialize` → **404** |
| Login | wrong password → 401 with a non-enumerating message · success → 200 with `accessToken` in JSON and **raw refresh token only in the `Set-Cookie`** (asserted absent from the body) · cookie is `HttpOnly` + `Path=/api/v1/admin` |
| Access control | `/me` without token → 401 · garbage token → 401 · valid token → 200 profile without secrets |
| Refresh | no cookie → 401 · rotation → new access token + **new** cookie value + same session document (no second session) + token absent from JSON |
| Replay handling | immediate replay of the pre-rotation token → 401 **without** revoking (benign race) · replay after the grace window → 401 `reuse` + **session revoked** · revoked session cannot refresh with its newest token |
| CSRF | cross-site `Origin` on `/refresh` → 403 |
| Sessions | `GET /sessions` → 200, no `refreshTokenHash`/raw token material in the payload |
| Logout | cookie cleared (`Max-Age=0`/epoch `Expires`) + subsequent refresh → 401 · `logout-all` → 200, all sessions revoked, `/me` → 401 |
| Password change | wrong current password → 401 **and no revocation** · short new password → 400 · success → 200, all sessions revoked, old access token → 401 (`password_changed_after_issue`), old password → 401, new password → 200 |

### `tests/auth-token.test.js` — 13 tests (new)
Access-token round-trip and claims (`sub/sid/role/type/iss/aud`, no sensitive claims) · tampered
signature · foreign-secret signature · `alg=none` attack · wrong issuer/audience · structurally
incomplete payloads (missing `sid`, wrong `type`) · expired token · session-id required ·
minimum secret length · refresh token uniqueness/shape · SHA-256 digest determinism and
non-reversibility · malformed refresh input · constant-time comparison semantics.

### `tests/auth-password.test.js` — 6 tests (new)
Async bcrypt hash + round-trip · work-factor validation/fallback · length policy (8 min / 72 bytes)
· unsafe input rejected · `comparePassword` never throws on malformed/missing hashes ·
`needsRehash` for weaker/legacy/non-bcrypt values.

### `tests/auth-cookie.test.js` — 9 tests (new)
HTTP-only + path + TTL options · raw token stored (never a hash) · empty/non-string rejected ·
clear uses **identical** name/path/flags (and drops `maxAge`) so the cookie actually dies ·
legacy `token` cookie cleanup · cookie reader · `SameSite=None` without `Secure` rejected ·
invalid same-site rejected · TTL range validated.

### `tests/csrf.test.js` — 4 tests (new)
No `Origin` allowed (server-to-server) · allow-listed origin allowed · cross-site origin → `ApiError`
403 · same-host origin allowed.

### `tests/cache.test.js` — 8 · `tests/pagination.test.js` — 6 (pre-existing, unchanged)
Regression: caching, ETags, section invalidation, socket broadcast interplay, pagination math —
all still pass after the refactor (proves the HTTP cache layer was not broken).

---

## 2. Frontend test inventory (85 tests / 12 files)

### `src/store/auth.slice.test.js` — 14 tests (new)
- Initial state: unauthenticated, `isInitializing`, **no token anywhere**.
- Login success → admin + access token in memory, `user` mirrors `admin`, **`localStorage.length === 0`**.
- Login failure → server message surfaced, nothing authenticated.
- Refresh success/failure semantics (failure = signed out, not an error state).
- `initializeAuth`: marks ready after refresh, always finishes even without a session,
  `ensureAuthInitialized` runs **once** (Strict Mode safe — asserted via call count).
- Logout/logout-all clear local state **even when the API call fails**.
- `changePassword` and OTP password update clear the session (server revoked everything).
- Storage hygiene: after login + refresh, a dump of local/session storage contains **no** access
  token, no refreshed token, and no submitted password.

### `src/config/api.interceptors.test.js` — 10 tests (new)
Exercises the **real** Axios interceptors with a scripted adapter:
- Request interceptor attaches `Bearer <memory token>` (and nothing when signed out).
- **Single-flight**: 6 concurrent 401s → exactly **1** refresh → all 6 retried and succeed.
- Each failed request retried exactly once with the new token.
- Failed refresh → session ended (`onAuthFailure`), **no recursion/loop** (refresh count = 1).
- Auth endpoints (login/refresh/logout) never trigger the refresh path.
- Public `/public/` 401s never trigger refresh or forced logout.
- Non-401 failures never trigger refresh.
- Endpoint contract: `/me`, no register/initialize endpoint, `withCredentials: true`.

### Pre-existing suites (61 tests, all still green)
`test/httpCache.test.js` (9) · `test/sectionCache.test.js` (9) · `test/publicSlice.test.js` (11) ·
`test/projectSlice.test.js` (5) · `store/__tests__/public.slice.test.js` (7) ·
`store/__tests__/project.slice.test.js` (5) · `pages/client-view/__tests__/project-listing.test.jsx` (1) ·
`hooks/__tests__/useLazySection.test.jsx` (2) · `utils/__tests__/imageOptimization.test.js` (6) ·
`utils/__tests__/performance.test.js` (6).

These prove the caching (`httpCache`/`sectionCache`), socket-versioning, and portfolio features
kept working through the auth rewrite. `src/test/setup.js` (jest-dom + jsdom polyfills) was
recreated because the configured setup file was missing.

---

## 3. Security requirement → test mapping

| Requirement | Covered by |
| --- | --- |
| One-time bootstrap with secret header | `admin-auth-flow` bootstrap tests (400/403/409/201) + DB-level `bootstrapKey` unique index |
| Concurrency-safe first admin | `E11000` → 409 path exercised; in-process lock + sparse unique index |
| No public registration (anywhere) | `/initialize` → 404; frontend endpoint map has no register/initialize; settings/sidebar contain no signup UI |
| Access token 15 min, memory only | `auth-token` TTL/claims tests; `auth.slice` storage assertions; `api.interceptors` header test |
| Refresh token crypto-random, SHA-256 hashed, cookie-only | `auth-token` (shape/hash), `auth-cookie` (HTTP-only set/clear), `admin-auth-flow` (absent from JSON) |
| Rotated + reuse-detected | `admin-auth-flow` rotation/benign-race/reuse-revoke tests |
| Never in JSON or localStorage | `admin-auth-flow` body assertions + `auth.slice` storage dump |
| Rate limiting | limiter factory present on login/bootstrap/refresh/password/OTP routes (disabled only inside tests via `RATE_LIMIT_DISABLED`) |
| Origin/CSRF checks | `csrf.test.js` unit tests + `admin-auth-flow` cross-origin 403 |
| `res.headersSent` fix, no internal leakage | error-middleware behavior exercised throughout the flow suite (all failures return the envelope, 5xx hides internals) |
| Portfolio/caching/socket features intact | pre-existing backend + frontend suites (14 + 61 tests) |

---

## 4. Manual verification performed

- `node --check` on every changed backend file (21/21).
- Module smoke-load of routes/service/middleware/token utility in isolation (imports resolve, JWT
  round-trip claims verified).
- `npm run build` (production bundle) and `npm run lint` clean.
- Env validation exercised implicitly by tests (`env.config.js` fails fast; test files set the
  required secrets before import).

## 5. Recommended pre-release checks (staging)

See the 11-step checklist in [auth-migration-deployment.md §5](auth-migration-deployment.md#5-post-deploy-verification-checklist) —
cookie flags in DevTools, silent 15-minute refresh, session list, logout-everywhere, password
change revocation, and `/initialize` → 404.
