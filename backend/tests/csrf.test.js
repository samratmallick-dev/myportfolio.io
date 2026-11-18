import test from 'node:test';
import assert from 'node:assert/strict';

process.env.ALLOWED_ORIGINS = 'https://allowed.example';

const { verifyBrowserOrigin } = await import('../src/middleware/csrf.middleware.js');
const ApiError = (await import('../src/utilities/error/apiError.js')).default;

const run = (req) => {
      let error = null;
      let passed = false;
      verifyBrowserOrigin(req, {}, (err) => {
            if (err) error = err;
            else passed = true;
      });
      return { error, passed };
};

test('requests without an Origin header are allowed (server-to-server)', () => {
      const { error, passed } = run({ get: () => undefined, path: '/refresh', method: 'POST', ip: '1.2.3.4' });

      assert.equal(passed, true);
      assert.equal(error, null);
});

test('an explicitly allowed origin passes', () => {
      const req = {
            get: (header) => (header === 'origin' ? 'https://allowed.example' : undefined),
            path: '/refresh',
            method: 'POST',
            ip: '1.2.3.4',
      };
      const { error, passed } = run(req);

      assert.equal(passed, true);
      assert.equal(error, null);
});

test('a cross-site origin is rejected with 403', () => {
      const req = {
            get: (header) => (header === 'origin' ? 'https://evil.example' : undefined),
            path: '/refresh',
            method: 'POST',
            ip: '1.2.3.4',
      };
      const { error, passed } = run(req);

      assert.equal(passed, false);
      assert.ok(error instanceof ApiError);
      assert.equal(error.statusCode, 403);
});

test('a same-host origin is accepted even when not listed explicitly', () => {
      const req = {
            get: (header) => {
                  if (header === 'origin') return 'https://myapp.example';
                  if (header === 'host') return 'myapp.example';
                  return undefined;
            },
            path: '/logout',
            method: 'POST',
            ip: '1.2.3.4',
      };
      const { error, passed } = run(req);

      assert.equal(passed, true);
      assert.equal(error, null);
});
