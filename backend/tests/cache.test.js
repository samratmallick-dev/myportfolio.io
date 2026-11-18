import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
      cacheMiddleware,
      clearCache,
      getCacheSize,
      invalidatePublicSection,
      invalidateCacheForMutation,
} from '../src/middleware/cache.middleware.js';
import { broadcastPortfolioUpdate } from '../src/config/socket/socket.config.js';

const createRequest = (url) => ({
      method: 'GET',
      url,
      originalUrl: url,
});

const createResponse = () => {
      const headers = {};
      const res = {
            statusCode: 200,
            headers,
            body: null,
            set(key, value) {
                  headers[key] = value;
                  return res;
            },
            json(payload) {
                  res.body = payload;
                  return res;
            },
      };
      return res;
};

const runMiddleware = (middleware, req) => {
      let nextCalled = false;
      const res = createResponse();
      middleware(req, res, () => { nextCalled = true; });
      return { res, nextCalled };
};

beforeEach(() => clearCache());

test('cacheMiddleware caches successful GET responses and serves a HIT', () => {
      const middleware = cacheMiddleware(60);
      const req = createRequest('/api/v1/public/hero');

      const first = runMiddleware(middleware, req);
      first.res.json({ data: { name: 'Samrat' } });
      assert.equal(first.res.headers['X-Cache'], 'MISS');

      const second = runMiddleware(middleware, req);
      assert.equal(second.res.headers['X-Cache'], 'HIT');
      assert.deepEqual(second.res.body, { data: { name: 'Samrat' } });
});

test('cacheMiddleware does not cache error responses', () => {
      const middleware = cacheMiddleware(60);
      const req = createRequest('/api/v1/public/about');

      const failing = runMiddleware(middleware, req);
      failing.res.statusCode = 404;
      failing.res.json({ success: false });

      const retry = runMiddleware(middleware, req);
      assert.equal(retry.res.headers['X-Cache'], 'MISS');
});

test('invalidatePublicSection removes only the affected public section', () => {
      const middleware = cacheMiddleware(60);

      const heroReq = createRequest('/api/v1/public/hero');
      const aboutReq = createRequest('/api/v1/public/about');

      runMiddleware(middleware, heroReq).res.json({ data: 'hero' });
      runMiddleware(middleware, aboutReq).res.json({ data: 'about' });
      assert.equal(getCacheSize(), 2);

      invalidatePublicSection('hero');

      const heroAfter = runMiddleware(middleware, heroReq);
      const aboutAfter = runMiddleware(middleware, aboutReq);
      assert.equal(heroAfter.res.headers['X-Cache'], 'MISS');
      assert.equal(aboutAfter.res.headers['X-Cache'], 'HIT');
});

test('invalidateCacheForMutation maps project writes to project caches only', () => {
      const middleware = cacheMiddleware(60);

      const projectReq = createRequest('/api/v1/public/projects?page=1');
      const heroReq = createRequest('/api/v1/public/hero');

      runMiddleware(middleware, projectReq).res.json({ data: [] });
      runMiddleware(middleware, heroReq).res.json({ data: {} });

      invalidateCacheForMutation('/api/v1/projects/update-project/123');

      assert.equal(runMiddleware(middleware, projectReq).res.headers['X-Cache'], 'MISS');
      assert.equal(runMiddleware(middleware, heroReq).res.headers['X-Cache'], 'HIT');
});

test('invalidateCacheForMutation ignores message-only contact writes', () => {
      const middleware = cacheMiddleware(60);
      const contactReq = createRequest('/api/v1/public/contact');

      runMiddleware(middleware, contactReq).res.json({ data: {} });
      invalidateCacheForMutation('/api/v1/contact/send-message');

      assert.equal(runMiddleware(middleware, contactReq).res.headers['X-Cache'], 'HIT');
});

test('cacheMiddleware forces revalidation and keeps a stable ETag', () => {
      const middleware = cacheMiddleware(60);
      const req = createRequest('/api/v1/public/hero');

      const first = runMiddleware(middleware, req);
      first.res.json({ success: true, timestamp: '2026-01-01T00:00:00.000Z', data: { name: 'Samrat' } });

      assert.equal(first.res.headers['Cache-Control'], 'public, no-cache, must-revalidate');
      const etag = first.res.headers['ETag'];
      assert.ok(etag, 'ETag is set');

      const second = runMiddleware(middleware, req);
      assert.equal(second.res.headers['X-Cache'], 'HIT');
      assert.equal(second.res.headers['ETag'], etag, 'ETag is identical across MISS/HIT for the same content');

      clearCache();
      const third = runMiddleware(middleware, req);
      third.res.json({ success: true, timestamp: '2026-01-02T00:00:00.000Z', data: { name: 'Changed' } });
      assert.notEqual(third.res.headers['ETag'], etag, 'changed content produces a new ETag');
});

test('cacheMiddleware ignores the volatile timestamp when comparing content', () => {
      const middleware = cacheMiddleware(60);
      const req = createRequest('/api/v1/public/about');

      const first = runMiddleware(middleware, req);
      first.res.json({ success: true, timestamp: 'A', data: { title: 'Same' } });

      clearCache();
      const second = runMiddleware(middleware, req);
      second.res.json({ success: true, timestamp: 'B', data: { title: 'Same' } });

      assert.equal(second.res.headers['ETag'], first.res.headers['ETag']);
});

test('broadcastPortfolioUpdate invalidates the section cache before the broadcast', () => {
      const middleware = cacheMiddleware(60);
      const aboutReq = createRequest('/api/v1/public/about');
      const heroReq = createRequest('/api/v1/public/hero');

      runMiddleware(middleware, aboutReq).res.json({ data: 'old-about' });
      runMiddleware(middleware, heroReq).res.json({ data: 'hero' });
      assert.equal(getCacheSize(), 2);

      broadcastPortfolioUpdate('about', { title: 'new-about' });

      assert.equal(runMiddleware(middleware, aboutReq).res.headers['X-Cache'], 'MISS');
      assert.equal(runMiddleware(middleware, heroReq).res.headers['X-Cache'], 'HIT');
});

test('broadcastPortfolioUpdate leaves caches intact for non-content events', () => {
      const middleware = cacheMiddleware(60);
      const contactReq = createRequest('/api/v1/public/contact');

      runMiddleware(middleware, contactReq).res.json({ data: {} });
      broadcastPortfolioUpdate('newMessage', { subject: 'hi' });

      assert.equal(runMiddleware(middleware, contactReq).res.headers['X-Cache'], 'HIT');
});
