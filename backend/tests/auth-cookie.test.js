import test from 'node:test';
import assert from 'node:assert/strict';

process.env.COOKIE_SECURE = 'false';
process.env.COOKIE_SAME_SITE = 'lax';
process.env.REFRESH_TOKEN_TTL_DAYS = '7';

const {
      REFRESH_COOKIE_NAME,
      REFRESH_COOKIE_PATH,
      getRefreshCookieOptions,
      setRefreshTokenCookie,
      clearRefreshTokenCookie,
      clearLegacyTokenCookie,
      getRawRefreshToken,
      getRefreshTokenTtlDays,
} = await import('../src/utilities/cookie.utility.js');

const createResponse = () => {
      const res = {
            cookies: [],
            cleared: [],
            cookie(name, value, options) {
                  res.cookies.push({ name, value, options });
                  return res;
            },
            clearCookie(name, options) {
                  res.cleared.push({ name, options });
                  return res;
            },
      };
      return res;
};

test('refresh cookie is HTTP-only, scoped and bounded', () => {
      const options = getRefreshCookieOptions();

      assert.equal(options.httpOnly, true);
      assert.equal(options.path, REFRESH_COOKIE_PATH);
      assert.equal(options.sameSite, 'lax');
      assert.equal(options.secure, false);
      assert.equal(options.maxAge, 7 * 24 * 60 * 60 * 1000);
      // JavaScript must never be able to read the raw refresh token.
      assert.equal('secure' in options, true);
      assert.equal(REFRESH_COOKIE_NAME, 'refreshToken');
});

test('setRefreshTokenCookie stores the RAW token, never a hash', () => {
      const res = createResponse();
      const raw = 'raw-refresh-token-value-'.padEnd(64, 'a');

      setRefreshTokenCookie(res, raw);

      assert.equal(res.cookies.length, 1);
      assert.equal(res.cookies[0].name, REFRESH_COOKIE_NAME);
      assert.equal(res.cookies[0].value, raw);
      assert.equal(res.cookies[0].options.httpOnly, true);
});

test('setRefreshTokenCookie refuses empty or non-string values', () => {
      const res = createResponse();

      assert.throws(() => setRefreshTokenCookie(res, undefined), /raw refresh token/i);
      assert.throws(() => setRefreshTokenCookie(res, ''), /raw refresh token/i);
      assert.throws(() => setRefreshTokenCookie(res, null), /raw refresh token/i);
      assert.equal(res.cookies.length, 0);
});

test('clearing uses the identical name/path so the cookie actually dies', () => {
      const res = createResponse();

      clearRefreshTokenCookie(res);

      const refreshClear = res.cleared.find((entry) => entry.name === REFRESH_COOKIE_NAME);
      assert.ok(refreshClear, 'refresh cookie must be cleared');
      assert.equal(refreshClear.options.path, REFRESH_COOKIE_PATH);
      assert.equal(refreshClear.options.httpOnly, true);
      assert.equal(refreshClear.options.secure, false);
      assert.equal(refreshClear.options.sameSite, 'lax');
      // maxAge must not be sent on clearCookie.
      assert.equal('maxAge' in refreshClear.options, false);

      // The legacy long-lived JWT cookie from the old system is also removed.
      const legacyClear = res.cleared.find((entry) => entry.name === 'token');
      assert.ok(legacyClear, 'legacy cookie must be cleared');
});

test('clearLegacyTokenCookie only drops the legacy cookie', () => {
      const res = createResponse();
      clearLegacyTokenCookie(res);

      assert.equal(res.cleared.length, 1);
      assert.equal(res.cleared[0].name, 'token');
});

test('getRawRefreshToken reads only the HTTP-only cookie', () => {
      const value = 'a'.repeat(64);

      assert.equal(getRawRefreshToken({ cookies: { refreshToken: value } }), value);
      assert.equal(getRawRefreshToken({ cookies: {} }), null);
      assert.equal(getRawRefreshToken({}), null);
      assert.equal(getRawRefreshToken(undefined), null);
});

test('SameSite=None without Secure is rejected (browser would drop it)', () => {
      const originalSecure = process.env.COOKIE_SECURE;
      const originalSameSite = process.env.COOKIE_SAME_SITE;
      try {
            process.env.COOKIE_SAME_SITE = 'none';
            process.env.COOKIE_SECURE = 'false';
            assert.throws(() => getRefreshCookieOptions(), /requires secure/i);
      } finally {
            process.env.COOKIE_SECURE = originalSecure;
            process.env.COOKIE_SAME_SITE = originalSameSite;
      }
});

test('invalid same-site values are rejected', () => {
      const original = process.env.COOKIE_SAME_SITE;
      try {
            process.env.COOKIE_SAME_SITE = 'weird';
            assert.throws(() => getRefreshCookieOptions(), /same-site/i);
      } finally {
            process.env.COOKIE_SAME_SITE = original;
      }
});

test('refresh TTL is validated', () => {
      const original = process.env.REFRESH_TOKEN_TTL_DAYS;
      try {
            process.env.REFRESH_TOKEN_TTL_DAYS = '0';
            assert.throws(() => getRefreshTokenTtlDays(), /between 1 and 30/);
            process.env.REFRESH_TOKEN_TTL_DAYS = '999';
            assert.throws(() => getRefreshTokenTtlDays(), /between 1 and 30/);
            process.env.REFRESH_TOKEN_TTL_DAYS = '14';
            assert.equal(getRefreshTokenTtlDays(), 14);
      } finally {
            process.env.REFRESH_TOKEN_TTL_DAYS = original;
      }
});
