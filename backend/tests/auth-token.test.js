import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

process.env.JWT_ACCESS_SECRET = 'test-access-secret-'.padEnd(64, 'x');
process.env.JWT_ISSUER = 'portfolio-backend-test';
process.env.JWT_AUDIENCE = 'portfolio-admin-test';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';

const {
      createAccessToken,
      verifyAccessToken,
      generateRefreshToken,
      hashRefreshToken,
      isWellFormedRefreshToken,
      timingSafeEqualStrings,
      MIN_SECRET_LENGTH,
} = await import('../src/utilities/token.utility.js');

const ADMIN_ID = '64b000000000000000000001';
const SESSION_ID = '64b000000000000000000002';

test('createAccessToken / verifyAccessToken round-trip carries only safe claims', () => {
      const token = createAccessToken({ _id: ADMIN_ID, role: 'admin' }, SESSION_ID);
      const payload = verifyAccessToken(token);

      assert.equal(payload.sub, ADMIN_ID);
      assert.equal(payload.sid, SESSION_ID);
      assert.equal(payload.role, 'admin');
      assert.equal(payload.type, 'access');
      assert.equal(payload.iss, process.env.JWT_ISSUER);
      assert.equal(payload.aud, process.env.JWT_AUDIENCE);

      // No sensitive material may ever be embedded in the token.
      assert.equal(payload.password, undefined);
      assert.equal(payload.email, undefined);
      assert.equal(payload.passwordHash, undefined);
});

test('verifyAccessToken rejects a tampered token', () => {
      const token = createAccessToken({ _id: ADMIN_ID, role: 'admin' }, SESSION_ID);
      const tampered = `${token.slice(0, -3)}abc`;

      assert.throws(() => verifyAccessToken(tampered), /invalid signature|jwt/i);
});

test('verifyAccessToken rejects tokens signed with a different secret', () => {
      const foreign = jwt.sign(
            { role: 'admin', sid: SESSION_ID, type: 'access' },
            'a-completely-different-secret-value-1234567890',
            {
                  algorithm: 'HS256',
                  expiresIn: '15m',
                  issuer: process.env.JWT_ISSUER,
                  audience: process.env.JWT_AUDIENCE,
                  subject: ADMIN_ID,
            }
      );

      assert.throws(() => verifyAccessToken(foreign));
});

test('verifyAccessToken rejects the "none" algorithm attack', () => {
      const unsigned = Buffer.from(
            JSON.stringify({ alg: 'none', typ: 'JWT' })
      ).toString('base64url');
      const payload = Buffer.from(
            JSON.stringify({
                  sub: ADMIN_ID,
                  sid: SESSION_ID,
                  role: 'admin',
                  type: 'access',
                  iss: process.env.JWT_ISSUER,
                  aud: process.env.JWT_AUDIENCE,
                  exp: Math.floor(Date.now() / 1000) + 900,
            })
      ).toString('base64url');

      assert.throws(() => verifyAccessToken(`${unsigned}.${payload}.`));
});

test('verifyAccessToken rejects a token with the wrong issuer or audience', () => {
      const wrongIssuer = jwt.sign(
            { role: 'admin', sid: SESSION_ID, type: 'access' },
            process.env.JWT_ACCESS_SECRET,
            {
                  algorithm: 'HS256',
                  expiresIn: '15m',
                  issuer: 'someone-else',
                  audience: process.env.JWT_AUDIENCE,
                  subject: ADMIN_ID,
            }
      );
      assert.throws(() => verifyAccessToken(wrongIssuer));

      const wrongAudience = jwt.sign(
            { role: 'admin', sid: SESSION_ID, type: 'access' },
            process.env.JWT_ACCESS_SECRET,
            {
                  algorithm: 'HS256',
                  expiresIn: '15m',
                  issuer: process.env.JWT_ISSUER,
                  audience: 'someone-else',
                  subject: ADMIN_ID,
            }
      );
      assert.throws(() => verifyAccessToken(wrongAudience));
});

test('verifyAccessToken rejects structurally incomplete payloads', () => {
      const missingSid = jwt.sign(
            { role: 'admin', type: 'access' },
            process.env.JWT_ACCESS_SECRET,
            {
                  algorithm: 'HS256',
                  expiresIn: '15m',
                  issuer: process.env.JWT_ISSUER,
                  audience: process.env.JWT_AUDIENCE,
                  subject: ADMIN_ID,
            }
      );
      assert.throws(() => verifyAccessToken(missingSid), /Invalid access token/);

      const wrongType = jwt.sign(
            { role: 'admin', sid: SESSION_ID, type: 'refresh' },
            process.env.JWT_ACCESS_SECRET,
            {
                  algorithm: 'HS256',
                  expiresIn: '15m',
                  issuer: process.env.JWT_ISSUER,
                  audience: process.env.JWT_AUDIENCE,
                  subject: ADMIN_ID,
            }
      );
      assert.throws(() => verifyAccessToken(wrongType), /Invalid access token/);
});

test('verifyAccessToken rejects an expired token', () => {
      const expired = jwt.sign(
            { role: 'admin', sid: SESSION_ID, type: 'access' },
            process.env.JWT_ACCESS_SECRET,
            {
                  algorithm: 'HS256',
                  expiresIn: '-10s',
                  issuer: process.env.JWT_ISSUER,
                  audience: process.env.JWT_AUDIENCE,
                  subject: ADMIN_ID,
            }
      );
      assert.throws(() => verifyAccessToken(expired), /expired/i);
});

test('createAccessToken refuses to issue a token without a session id', () => {
      assert.throws(
            () => createAccessToken({ _id: ADMIN_ID, role: 'admin' }, null),
            /session id/i
      );
});

test('access-token secret must meet the minimum length', () => {
      const original = process.env.JWT_ACCESS_SECRET;
      try {
            process.env.JWT_ACCESS_SECRET = 'short';
            assert.throws(
                  () => createAccessToken({ _id: ADMIN_ID, role: 'admin' }, SESSION_ID),
                  new RegExp(String(MIN_SECRET_LENGTH))
            );
      } finally {
            process.env.JWT_ACCESS_SECRET = original;
      }
});

test('generateRefreshToken produces unique, well-formed opaque secrets', () => {
      const a = generateRefreshToken();
      const b = generateRefreshToken();

      assert.notEqual(a, b);
      assert.ok(isWellFormedRefreshToken(a));
      assert.ok(isWellFormedRefreshToken(b));
      // 64 CSPRNG bytes base64url-encoded => at least 86 characters.
      assert.ok(a.length >= 64);
      assert.equal(a.includes('+'), false);
      assert.equal(a.includes('/'), false);
});

test('hashRefreshToken is a deterministic SHA-256 hex digest', () => {
      const token = generateRefreshToken();
      const digest = hashRefreshToken(token);

      assert.equal(digest, hashRefreshToken(token));
      assert.match(digest, /^[0-9a-f]{64}$/);
      // The raw token must never equal its stored digest.
      assert.notEqual(token, digest);
      // Knowing the digest must not reveal the token (preimage resistance).
      assert.equal(digest.includes(token), false);
});

test('isWellFormedRefreshToken rejects malformed input', () => {
      assert.equal(isWellFormedRefreshToken(null), false);
      assert.equal(isWellFormedRefreshToken(undefined), false);
      assert.equal(isWellFormedRefreshToken(''), false);
      assert.equal(isWellFormedRefreshToken('short'), false);
      assert.equal(isWellFormedRefreshToken('!'.repeat(80)), false);
      assert.equal(isWellFormedRefreshToken(generateRefreshToken()), true);
});

test('timingSafeEqualStrings compares correctly', () => {
      const value = crypto.randomBytes(32).toString('hex');

      assert.equal(timingSafeEqualStrings(value, value), true);
      assert.equal(timingSafeEqualStrings(value, `${value.slice(0, -1)}0`), false);
      assert.equal(timingSafeEqualStrings(value, value.slice(0, 10)), false);
      assert.equal(timingSafeEqualStrings(undefined, undefined), true);
      assert.equal(timingSafeEqualStrings(null, 'x'), false);
});
