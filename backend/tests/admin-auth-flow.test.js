import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

/*
 * End-to-end authentication flow tests.
 *
 * The Express app is exercised over real HTTP; only the two repositories are
 * replaced with an in-memory store so no MongoDB instance is required. Every
 * other layer (routes, validation, CSRF, rate limiting, middleware, service,
 * JWT/cookie utilities, bcrypt) runs exactly as in production.
 */

process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_DISABLED = 'true';
process.env.JWT_ACCESS_SECRET = 'integration-test-secret-'.padEnd(64, 'x');
process.env.JWT_ISSUER = 'portfolio-backend-test';
process.env.JWT_AUDIENCE = 'portfolio-admin-test';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.ADMIN_BOOTSTRAP_SECRET = 'super-secret-bootstrap-value-1234567890';
process.env.BCRYPT_ROUNDS = '10';
process.env.COOKIE_SECURE = 'false';
process.env.COOKIE_SAME_SITE = 'lax';
process.env.REFRESH_TOKEN_TTL_DAYS = '7';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
delete process.env.CLIENT_URL;

// The upload module validates these at import time; dummy values are enough
// because no upload ever happens in these tests.
process.env.CLOUD_NAME = 'test-cloud';
process.env.CLOUD_API_KEY = 'test-key';
process.env.CLOUD_API_SECRET = 'test-secret';

const adminRepository = (await import('../src/repository/admin.repository.js')).default;
const adminSessionRepository = (await import('../src/repository/adminSession.repository.js')).default;
const app = (await import('../src/app.js')).default;

// --- In-memory store --------------------------------------------------------

let idCounter = 0;
const nextId = () => (++idCounter).toString(16).padStart(24, '0');

const admins = [];
const sessions = [];

const makeAdmin = ({ username, email, password, isActive = true }) => ({
      _id: nextId(),
      username,
      email,
      password,
      role: 'admin',
      isActive,
      lastLogin: null,
      passwordChangedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON() {
            const clone = { ...this };
            delete clone.password;
            delete clone.otp;
            delete clone.otpExpiry;
            delete clone.newEmail;
            delete clone.bootstrapKey;
            delete clone.__v;
            return clone;
      },
});

const makeSession = ({ adminId, refreshTokenHash, expiresAt, userAgent = '', ipAddress = '' }) => ({
      _id: nextId(),
      adminId,
      refreshTokenHash,
      previousTokenHashes: [],
      expiresAt,
      revokedAt: null,
      lastUsedAt: new Date(),
      userAgent,
      ipAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpired(now = new Date()) {
            return !this.expiresAt || this.expiresAt.getTime() <= now.getTime();
      },
      isRevoked() {
            return Boolean(this.revokedAt);
      },
      isUsable(now = new Date()) {
            return !this.isRevoked() && !this.isExpired(now);
      },
      toSafeObject() {
            return {
                  id: this._id,
                  adminId: String(this.adminId),
                  userAgent: this.userAgent,
                  ipAddress: this.ipAddress,
                  createdAt: this.createdAt,
                  updatedAt: this.updatedAt,
                  lastUsedAt: this.lastUsedAt,
                  expiresAt: this.expiresAt,
                  revokedAt: this.revokedAt,
                  isActive: this.isUsable(),
            };
      },
});

// --- Repository fakes -------------------------------------------------------

adminRepository.adminExists = async () => admins.length > 0;
adminRepository.countAdmins = async () => admins.length;
adminRepository.createInitialAdmin = async (data) => {
      if (admins.length > 0) {
            const err = new Error('E11000 duplicate key');
            err.code = 11000;
            throw err;
      }
      const admin = makeAdmin(data);
      admins.push(admin);
      return admin;
};
adminRepository.create = async (data) => {
      if (admins.some((a) => a.email === data.email || a.username === data.username)) {
            const err = new Error('E11000 duplicate key');
            err.code = 11000;
            throw err;
      }
      const admin = makeAdmin(data);
      admins.push(admin);
      return admin;
};
adminRepository.findByEmail = async (email) => admins.find((a) => a.email === email) || null;
adminRepository.findByEmailWithPassword = async (email) =>
      admins.find((a) => a.email === email) || null;
adminRepository.findByUsername = async (username) =>
      admins.find((a) => a.username === username) || null;
adminRepository.findById = async (id) => admins.find((a) => String(a._id) === String(id)) || null;
adminRepository.findByIdWithSecrets = async (id) =>
      admins.find((a) => String(a._id) === String(id)) || null;
adminRepository.updateLastLogin = async (id) => {
      const admin = admins.find((a) => String(a._id) === String(id));
      if (admin) admin.lastLogin = new Date();
      return admin;
};
adminRepository.updateById = async (id, update) => {
      const admin = admins.find((a) => String(a._id) === String(id));
      if (!admin) return null;
      const { $set, $unset, ...plain } = update;
      Object.assign(admin, plain, $set || {});
      if ($unset) for (const key of Object.keys($unset)) delete admin[key];
      admin.updatedAt = new Date();
      return admin;
};

adminSessionRepository.create = async (data) => {
      const session = makeSession(data);
      sessions.push(session);
      return session;
};
adminSessionRepository.findById = async (id) =>
      sessions.find((s) => String(s._id) === String(id)) || null;
adminSessionRepository.findActiveById = async (id, now = new Date()) =>
      sessions.find((s) => String(s._id) === String(id) && s.isUsable(now)) || null;
adminSessionRepository.findByRefreshTokenHash = async (hash) =>
      sessions.find((s) => s.refreshTokenHash === hash) || null;
adminSessionRepository.findByPreviousTokenHash = async (hash) =>
      sessions.find((s) => s.previousTokenHashes.includes(hash)) || null;
adminSessionRepository.listActiveForAdmin = async (adminId, now = new Date()) =>
      sessions.filter((s) => String(s.adminId) === String(adminId) && s.isUsable(now));
adminSessionRepository.rotate = async ({ sessionId, currentHash, nextHash, expiresAt, userAgent, ipAddress }) => {
      const session = sessions.find((s) => String(s._id) === String(sessionId));
      const now = new Date();
      if (!session || session.refreshTokenHash !== currentHash || session.revokedAt || session.isExpired(now)) {
            return null;
      }
      session.previousTokenHashes.push(currentHash);
      session.refreshTokenHash = nextHash;
      session.expiresAt = expiresAt;
      session.lastUsedAt = now;
      session.userAgent = userAgent;
      session.ipAddress = ipAddress;
      session.updatedAt = now;
      return session;
};
adminSessionRepository.touch = async () => ({ acknowledged: true });
adminSessionRepository.revokeById = async (id) => {
      const session = sessions.find((s) => String(s._id) === String(id));
      if (!session || session.revokedAt) return null;
      session.revokedAt = new Date();
      return session;
};
adminSessionRepository.revokeByHashes = async (hashes = []) => {
      for (const session of sessions) {
            if (session.revokedAt) continue;
            if (hashes.includes(session.refreshTokenHash) || session.previousTokenHashes.some((h) => hashes.includes(h))) {
                  session.revokedAt = new Date();
            }
      }
      return { modifiedCount: 1 };
};
adminSessionRepository.revokeAllForAdmin = async (adminId) => {
      let count = 0;
      for (const session of sessions) {
            if (String(session.adminId) === String(adminId) && !session.revokedAt) {
                  session.revokedAt = new Date();
                  count += 1;
            }
      }
      return { modifiedCount: count };
};
adminSessionRepository.revokeSessionForAdmin = async (sessionId, adminId) => {
      const session = sessions.find(
            (s) => String(s._id) === String(sessionId) && String(s.adminId) === String(adminId)
      );
      if (!session || session.revokedAt) return null;
      session.revokedAt = new Date();
      return session;
};

// --- HTTP helpers ------------------------------------------------------------

let server;
let baseUrl;

const getSetCookies = (res) => {
      if (typeof res.headers.getSetCookie === 'function') return res.headers.getSetCookie();
      const single = res.headers.get('set-cookie');
      return single ? [single] : [];
};

const extractRefreshCookie = (res) => {
      const entry = getSetCookies(res).find((c) => c.startsWith('refreshToken='));
      if (!entry) return null;
      const value = entry.split(';')[0].slice('refreshToken='.length);
      return value || null;
};

const isRefreshCookieCleared = (res) =>
      getSetCookies(res).some(
            (c) => c.startsWith('refreshToken=;') && /(max-age=0|expires=thu, 01 jan 1970)/i.test(c)
      );

const request = async (path, { method = 'GET', body, headers = {}, cookie = null } = {}) => {
      const res = await fetch(`${baseUrl}${path}`, {
            method,
            headers: {
                  ...(body ? { 'Content-Type': 'application/json' } : {}),
                  ...(cookie ? { Cookie: cookie } : {}),
                  ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json().catch(() => null);
      return { status: res.status, json, setCookies: getSetCookies(res), refreshCookie: extractRefreshCookie(res), cleared: isRefreshCookieCleared(res), raw: res };
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

let currentState = { accessToken: null, refreshCookie: null, sessionId: null };
let preRotationCookie = null;

const VALID_CREDENTIALS = {
      username: 'testadmin',
      email: 'admin@example.com',
      password: 'super-secret-password',
};

before(async () => {
      server = createServer(app);
      await new Promise((resolve) => server.listen(0, resolve));
      baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
      await new Promise((resolve) => server.close(resolve));
});

// --- Tests -------------------------------------------------------------------

test('bootstrap is disabled without the secret header', async () => {
      const res = await request('/api/v1/admin/bootstrap', {
            method: 'POST',
            body: VALID_CREDENTIALS,
      });

      assert.equal(res.status, 400);
      assert.equal(res.json.success, false);
      assert.equal(admins.length, 0);
});

test('bootstrap rejects an incorrect secret', async () => {
      const res = await request('/api/v1/admin/bootstrap', {
            method: 'POST',
            body: VALID_CREDENTIALS,
            headers: { 'X-Admin-Bootstrap-Secret': 'wrong-secret-value-'.padEnd(32, 'y') },
      });

      assert.equal(res.status, 403);
      assert.equal(admins.length, 0);
});

test('bootstrap rejects unknown privileged fields', async () => {
      const res = await request('/api/v1/admin/bootstrap', {
            method: 'POST',
            body: { ...VALID_CREDENTIALS, role: 'superadmin' },
            headers: { 'X-Admin-Bootstrap-Secret': process.env.ADMIN_BOOTSTRAP_SECRET },
      });

      assert.equal(res.status, 400);
      assert.equal(admins.length, 0);
});

test('bootstrap rejects passwords below the policy length', async () => {
      const res = await request('/api/v1/admin/bootstrap', {
            method: 'POST',
            body: { ...VALID_CREDENTIALS, password: 'short' },
            headers: { 'X-Admin-Bootstrap-Secret': process.env.ADMIN_BOOTSTRAP_SECRET },
      });

      assert.equal(res.status, 400);
      assert.equal(admins.length, 0);
});

test('bootstrap creates exactly one admin and never returns the password hash', async () => {
      const res = await request('/api/v1/admin/bootstrap', {
            method: 'POST',
            body: VALID_CREDENTIALS,
            headers: { 'X-Admin-Bootstrap-Secret': process.env.ADMIN_BOOTSTRAP_SECRET },
      });

      assert.equal(res.status, 201);
      assert.equal(res.json.success, true);
      assert.equal(res.json.data.admin.email, VALID_CREDENTIALS.email);
      assert.equal(res.json.data.admin.password, undefined);
      assert.equal(res.json.data.admin.bootstrapKey, undefined);
      assert.equal(admins.length, 1);
      // The stored value must be a bcrypt hash, never the plaintext.
      assert.match(admins[0].password, /^\$2[aby]\$/);
      assert.notEqual(admins[0].password, VALID_CREDENTIALS.password);
});

test('a second bootstrap attempt is rejected (one-time only)', async () => {
      const res = await request('/api/v1/admin/bootstrap', {
            method: 'POST',
            body: { ...VALID_CREDENTIALS, email: 'other@example.com' },
            headers: { 'X-Admin-Bootstrap-Secret': process.env.ADMIN_BOOTSTRAP_SECRET },
      });

      assert.equal(res.status, 409);
      assert.equal(admins.length, 1);
});

test('the legacy public admin-initialization route no longer exists', async () => {
      const res = await request('/api/v1/admin/initialize', {
            method: 'POST',
            body: VALID_CREDENTIALS,
      });

      assert.equal(res.status, 404);
      assert.equal(admins.length, 1);
});

test('login with wrong credentials fails without leaking which field was wrong', async () => {
      const res = await request('/api/v1/admin/login', {
            method: 'POST',
            body: { email: VALID_CREDENTIALS.email, password: 'not-the-password' },
      });

      assert.equal(res.status, 401);
      assert.equal(res.json.success, false);
      assert.match(res.json.message, /invalid email or password/i);
      assert.equal(res.refreshCookie, null);
});

test('login succeeds, returns an access token in memory and the refresh token only as a cookie', async () => {
      const res = await request('/api/v1/admin/login', {
            method: 'POST',
            body: { email: VALID_CREDENTIALS.email, password: VALID_CREDENTIALS.password },
      });

      assert.equal(res.status, 200);
      const { admin, accessToken } = res.json.data;
      assert.ok(accessToken, 'access token must be returned for in-memory storage');
      assert.equal(admin.email, VALID_CREDENTIALS.email);
      assert.equal(admin.password, undefined);

      // The raw refresh token must exist ONLY in the HTTP-only cookie.
      assert.ok(res.refreshCookie, 'refresh cookie must be set');
      const serialized = JSON.stringify(res.json);
      assert.equal(serialized.includes(res.refreshCookie), false);
      assert.equal(serialized.includes('"refreshToken"'), false);

      const refreshCookieEntry = res.setCookies.find((c) => c.startsWith('refreshToken='));
      assert.match(refreshCookieEntry, /httponly/i);
      assert.match(refreshCookieEntry, /path=\/api\/v1\/admin/i);

      // Remember for later tests.
      currentState = {
            accessToken,
            refreshCookie: `refreshToken=${res.refreshCookie}`,
            sessionId: sessions[sessions.length - 1]._id,
      };
});

test('protected endpoints reject requests without an access token', async () => {
      const res = await request('/api/v1/admin/me');
      assert.equal(res.status, 401);
});

test('protected endpoints reject a garbage access token', async () => {
      const res = await request('/api/v1/admin/me', { headers: bearer('not.a.jwt') });
      assert.equal(res.status, 401);
});

test('GET /me returns the admin profile for a valid token', async () => {
      const res = await request('/api/v1/admin/me', { headers: bearer(currentState.accessToken) });

      assert.equal(res.status, 200);
      assert.equal(res.json.data.admin.email, VALID_CREDENTIALS.email);
      assert.equal(res.json.data.admin.password, undefined);
});

test('refresh without a cookie is rejected', async () => {
      const res = await request('/api/v1/admin/refresh', { method: 'POST' });
      assert.equal(res.status, 401);
});

test('refresh rotates the token and issues a new access token', async () => {
      const before = sessions.length;
      preRotationCookie = currentState.refreshCookie;
      const res = await request('/api/v1/admin/refresh', {
            method: 'POST',
            cookie: currentState.refreshCookie,
      });

      assert.equal(res.status, 200);
      assert.ok(res.json.data.accessToken);
      assert.ok(res.refreshCookie);
      assert.notEqual(res.refreshCookie, currentState.refreshCookie.split('=')[1]);
      assert.equal(JSON.stringify(res.json).includes(res.refreshCookie), false);
      assert.equal(sessions.length, before, 'rotation must not create a second session');

      currentState = {
            ...currentState,
            accessToken: res.json.data.accessToken,
            refreshCookie: `refreshToken=${res.refreshCookie}`,
      };
});

test('replaying the immediately-preceding token is rejected but does not kill the session', async () => {
      const res = await request('/api/v1/admin/refresh', {
            method: 'POST',
            cookie: preRotationCookie,
      });

      assert.equal(res.status, 401);
      assert.equal(sessions[sessions.length - 1].revokedAt, null, 'benign race must not revoke');
});

test('confirmed refresh-token reuse revokes the whole session', async () => {
      // Age the rotation so it falls outside the benign-race grace window.
      sessions[sessions.length - 1].updatedAt = new Date(Date.now() - 60 * 60 * 1000);

      const res = await request('/api/v1/admin/refresh', {
            method: 'POST',
            cookie: preRotationCookie,
      });

      assert.equal(res.status, 401);
      assert.match(res.json.message, /reuse/i);
      assert.ok(sessions[sessions.length - 1].revokedAt, 'reuse must revoke the session');
});

test('a revoked session cannot refresh even with its newest token', async () => {
      const res = await request('/api/v1/admin/refresh', {
            method: 'POST',
            cookie: currentState.refreshCookie,
      });
      assert.equal(res.status, 401);
});

test('CSRF: a cross-origin refresh attempt is rejected', async () => {
      const res = await request('/api/v1/admin/refresh', {
            method: 'POST',
            cookie: currentState.refreshCookie,
            headers: { Origin: 'https://evil.example' },
      });

      assert.equal(res.status, 403);
});

test('session list is available to the authenticated admin', async () => {
      const login = await request('/api/v1/admin/login', {
            method: 'POST',
            body: { email: VALID_CREDENTIALS.email, password: VALID_CREDENTIALS.password },
      });
      assert.equal(login.status, 200);

      currentState = {
            accessToken: login.json.data.accessToken,
            refreshCookie: `refreshToken=${login.refreshCookie}`,
            sessionId: sessions[sessions.length - 1]._id,
      };

      const res = await request('/api/v1/admin/sessions', {
            headers: bearer(currentState.accessToken),
      });

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.json.data.sessions));
      assert.ok(res.json.data.sessions.length >= 1);
      // No refresh-token material may ever appear in the payload.
      assert.equal(JSON.stringify(res.json).includes('refreshTokenHash'), false);
      assert.equal(JSON.stringify(res.json).includes(currentState.refreshCookie.split('=')[1]), false);
});

test('logout clears the cookie and revokes the session', async () => {
      const res = await request('/api/v1/admin/logout', {
            method: 'POST',
            cookie: currentState.refreshCookie,
            headers: bearer(currentState.accessToken),
      });

      assert.equal(res.status, 200);
      assert.equal(res.cleared, true);

      const afterLogout = await request('/api/v1/admin/refresh', {
            method: 'POST',
            cookie: currentState.refreshCookie,
      });
      assert.equal(afterLogout.status, 401);
});

test('logout-all revokes every remaining session', async () => {
      const login = await request('/api/v1/admin/login', {
            method: 'POST',
            body: { email: VALID_CREDENTIALS.email, password: VALID_CREDENTIALS.password },
      });
      const token = login.json.data.accessToken;
      const activeBefore = sessions.filter((s) => !s.revokedAt).length;
      assert.ok(activeBefore >= 1);

      const res = await request('/api/v1/admin/logout-all', {
            method: 'POST',
            headers: bearer(token),
      });

      assert.equal(res.status, 200);
      assert.equal(sessions.filter((s) => !s.revokedAt).length, 0);

      const me = await request('/api/v1/admin/me', { headers: bearer(token) });
      assert.equal(me.status, 401);
});

test('change-password requires the current password and invalidates every session', async () => {
      const login = await request('/api/v1/admin/login', {
            method: 'POST',
            body: { email: VALID_CREDENTIALS.email, password: VALID_CREDENTIALS.password },
      });
      const token = login.json.data.accessToken;

      const wrong = await request('/api/v1/admin/change-password', {
            method: 'PATCH',
            headers: bearer(token),
            body: { currentPassword: 'definitely-wrong-password', newPassword: 'another-strong-password' },
      });
      assert.equal(wrong.status, 401);
      assert.equal(sessions.filter((s) => !s.revokedAt).length, 1, 'failed attempt must not revoke');

      const tooShort = await request('/api/v1/admin/change-password', {
            method: 'PATCH',
            headers: bearer(token),
            body: { currentPassword: VALID_CREDENTIALS.password, newPassword: 'short' },
      });
      assert.equal(tooShort.status, 400);

      const ok = await request('/api/v1/admin/change-password', {
            method: 'PATCH',
            headers: bearer(token),
            body: { currentPassword: VALID_CREDENTIALS.password, newPassword: 'another-strong-password' },
      });
      assert.equal(ok.status, 200);
      assert.equal(sessions.filter((s) => !s.revokedAt).length, 0);

      // The old access token is dead because passwordChangedAt moved forward.
      const me = await request('/api/v1/admin/me', { headers: bearer(token) });
      assert.equal(me.status, 401);

      // The old password no longer opens a session.
      const oldLogin = await request('/api/v1/admin/login', {
            method: 'POST',
            body: { email: VALID_CREDENTIALS.email, password: VALID_CREDENTIALS.password },
      });
      assert.equal(oldLogin.status, 401);

      const newLogin = await request('/api/v1/admin/login', {
            method: 'POST',
            body: { email: VALID_CREDENTIALS.email, password: 'another-strong-password' },
      });
      assert.equal(newLogin.status, 200);
});
