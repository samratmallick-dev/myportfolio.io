# Authentication — Migration & Deployment Guide

This guide moves an existing deployment (legacy `token` cookie + `localStorage adminToken`) to the new
rotating-refresh-token system with **zero data migration for admin documents**.

---

## 1. What changes for existing data

| Data | Migration needed? |
| --- | --- |
| `admins` collection | **None.** Existing bcrypt password hashes keep working — login just verifies against them. `password`, `email`, `username` are untouched. New optional fields (`role`, `isActive`, `passwordChangedAt`, `bootstrapKey`) get defaults on read. |
| Old `token` cookies in browsers | **None.** Cleared automatically on the next login/logout (`clearLegacyTokenCookie`). Old JWTs are simply no longer accepted (`authenticate` requires the new claim shape). |
| Old `localStorage adminToken` / `adminUser` | **None.** The new frontend never reads them; they become inert. They are not written again. |
| `adminsessions` collection | **Created automatically** by Mongoose on first use (TTL index on `expiresAt`). |
| Sessions after deploy | All users are logged out once and must sign in again (old tokens are invalid by design). |

> No script, no downtime, no backfill required. Deploy backend first, then frontend.

---

## 2. Environment variables

Copy the template and fill it in:

```bash
cp backend/.env.example backend/.env
```

Required **new** values (see `backend/.env.example` for the full commented list):

```bash
# Access-token signing (REQUIRED, >= 32 chars, no fallback):
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_ACCESS_SECRET=<paste>
JWT_ISSUER=portfolio-backend
JWT_AUDIENCE=portfolio-admin
JWT_ACCESS_EXPIRES_IN=15m

# One-time first-admin bootstrap (backend only, NEVER a VITE_ variable):
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
ADMIN_BOOTSTRAP_SECRET=<paste>

# Refresh cookie
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECURE=true          # required when COOKIE_SAME_SITE=none
COOKIE_SAME_SITE=none       # cross-site deployments (Vercel frontend <-> API host)

# Optional hardening/tuning
BCRYPT_ROUNDS=12            # cost for NEW hashes (10-15); existing hashes unaffected
REFRESH_RACE_GRACE_MS=10000 # benign concurrent-refresh window
```

Notes:

- `JWT_SECRET` (old) is **deprecated and ignored**; a warning is logged if present. Remove it when convenient.
- Frontend needs **no new variables** — no secret may ever appear in a `VITE_*` variable.
- `ALLOWED_ORIGINS` / `CLIENT_URL` must list every frontend origin (comma separated); they drive both CORS and the CSRF origin check.
- Startup fails fast (`src/config/env.config.js`) when `JWT_ACCESS_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE` are missing/short or cookie settings are contradictory — the process exits before serving traffic.

---

## 3. Backend deployment

```bash
cd backend
npm ci
npm test                 # must be green (68 tests)
# set the environment variables above (host-specific: Render/Railway/Docker/…)
npm start                # validateEnvironment() runs before the HTTP server opens
```

### 3.1 First admin (fresh deployment only)

```http
POST https://<api-host>/api/v1/admin/bootstrap
Content-Type: application/json
X-Admin-Bootstrap-Secret: <ADMIN_BOOTSTRAP_SECRET>

{
  "username": "admin",
  "email": "you@example.com",
  "password": "at-least-8-characters"
}
```

```bash
curl -X POST https://<api-host>/api/v1/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "X-Admin-Bootstrap-Secret: $ADMIN_BOOTSTRAP_SECRET" \
  -d '{"username":"admin","email":"you@example.com","password":"a-strong-password"}'
```

- `201` → first admin created (endpoint is now permanently dead: subsequent calls → `409`).
- `400` missing/invalid payload · `403` missing/wrong secret · `429` rate limited.
- The bootstrap call does **not** sign anyone in.
- Afterwards you may unset `ADMIN_BOOTSTRAP_SECRET` (it only enables the one-shot endpoint).

### 3.2 Existing deployment with an admin already present

Skip bootstrap entirely — the old admin document already exists and can log in immediately
(`POST /admin/initialize` no longer exists; nothing calls it).

---

## 4. Frontend deployment

```bash
cd frontend
npm ci
npm test                 # must be green (85 tests)
npm run lint
npm run build
npm run preview          # smoke test, then deploy dist/
```

No environment changes. `VITE_API_BASE_URL` / `VITE_API_BASE_URL_LOCAL` / `VITE_SOCKET_URL` stay as-is.

**Cross-site cookie requirement**: the frontend (e.g. Vercel) and API (e.g. Render) are different
origins, so `COOKIE_SECURE=true` + `COOKIE_SAME_SITE=none` are mandatory — otherwise browsers will
drop the refresh cookie and every refresh fails. Same-origin deployments can use `COOKIE_SAME_SITE=lax`.

---

## 5. Post-deploy verification checklist

1. `GET /health` → `200 {status:"healthy"}` (server passed env validation).
2. Open the site → you land on the public portfolio (no redirect loops, no console auth errors).
3. `/auth/login` → sign in with the admin credentials → redirected to `/admin/dashboard`.
4. DevTools → Application → Cookies: `refreshToken` is present, **HTTP-only**, `Path=/api/v1/admin`,
   `Secure` in production. No `adminToken` in Local Storage.
5. DevTools → Network: `POST /api/v1/admin/refresh` returns `{data:{accessToken}}` —
   the response body contains **no** refresh token.
6. Wait >15 min (or temporarily set `JWT_ACCESS_EXPIRES_IN=1m`) → next API call silently refreshes
   once and retries (single `refresh` request even with several tabs).
7. Settings → **Active Sessions** lists the current device; "Sign out everywhere" works.
8. Change password → you are signed out everywhere and the old password no longer works.
9. `POST /api/v1/admin/initialize` → `404`.
10. `curl -X POST …/api/v1/admin/bootstrap` without the secret header → `400/403`, no admin created.
11. Logs: no secrets/tokens/passwords appear (audit entries are redacted).

---

## 6. Operational notes

- **Rate limits** are in-memory per instance (`express-rate-limit`). Behind a proxy `trust proxy` is
  already set. Tune via `*_RATE_LIMIT_*` env vars; never disable outside tests (`RATE_LIMIT_DISABLED`).
- **Sessions cleanup**: MongoDB TTL index deletes expired sessions (≤60 s lag); authorization always
  re-checks `expiresAt`/`revokedAt`, so the lag is never a security gap.
- **Token theft response**: revoke via Settings → Active Sessions, or "Sign out everywhere", or change
  the password (revokes every session and invalidates all outstanding access tokens).
- **Secret rotation**: changing `JWT_ACCESS_SECRET` invalidates all access tokens instantly (users
  transparently refresh). Changing `ADMIN_BOOTSTRAP_SECRET` only matters before the first bootstrap.
- **Logs**: audit events (`audit:admin.login.success`, `audit:admin.refresh.reuse_detected`,
  `audit:csrf.reject`, …) go to Winston (`logs/info.log` + console).

---

## 7. Rollback

1. Redeploy the previous backend/frontend commits.
2. Old backend accepts its legacy `token` cookie again; new cookies are ignored (different name/path).
3. No data was destructively changed: the `admins` documents are compatible both ways, and the new
   `adminsessions` collection is simply unused by the old code (it can be dropped).
4. Remove the new env vars if you must (`JWT_ACCESS_SECRET`, `ADMIN_BOOTSTRAP_SECRET`, …).
