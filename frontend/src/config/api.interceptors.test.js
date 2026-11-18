import { describe, it, expect, beforeEach } from 'vitest';

/*
 * Exercises the real Axios interceptors in `@/config/api`:
 *  - the access token is attached from memory (never localStorage)
 *  - concurrent 401s trigger exactly ONE refresh (single-flight)
 *  - failed refresh ends the session instead of looping
 *  - auth endpoints never trigger the refresh-retry path
 */

const apiModule = await import('@/config/api');
const api = apiModule.default;
const { configureAuthApi, adminAuthEndpoints } = apiModule;

let accessToken = null;
let refreshCount = 0;
let refreshEndpointHits = 0;
let refreshShouldFail = false;
let onAuthFailureCount = 0;

const okResponse = (config, data) => ({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
});

const unauthorized = (config) => {
      const error = new Error('Request failed with status code 401');
      error.isAxiosError = true;
      error.code = 'ERR_BAD_REQUEST';
      error.config = config;
      error.response = {
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config,
            data: { success: false, message: 'Unauthorized' },
      };
      return error;
};

const seenAuthHeaders = [];

const fakeAdapter = async (config) => {
      const url = String(config.url || '');
      const header =
            typeof config.headers?.get === 'function'
                  ? config.headers.get('Authorization')
                  : config.headers?.Authorization;
      seenAuthHeaders.push(header ?? null);

      if (url.includes(adminAuthEndpoints.refresh)) {
            refreshEndpointHits += 1;
            if (refreshShouldFail) throw unauthorized(config);
            return okResponse(config, {
                  success: true,
                  data: { admin: { id: 'a1', email: 'admin@example.com' }, accessToken: 'fresh-token' },
            });
      }

      if (url.includes(adminAuthEndpoints.login)) {
            return okResponse(config, { success: true, data: { accessToken: 'login-token' } });
      }

      // Protected endpoint: only accepts the refreshed token.
      if (header === 'Bearer fresh-token') {
            return okResponse(config, { success: true, data: { sessions: [] } });
      }

      throw unauthorized(config);
};

beforeEach(() => {
      accessToken = null;
      refreshCount = 0;
      refreshEndpointHits = 0;
      refreshShouldFail = false;
      onAuthFailureCount = 0;
      seenAuthHeaders.length = 0;

      // Make the "redirect to login" a no-op inside jsdom.
      window.history.pushState({}, '', '/auth/login');
      localStorage.clear();

      api.defaults.adapter = fakeAdapter;

      configureAuthApi({
            getAccessToken: () => accessToken,
            refreshSession: async () => {
                  refreshCount += 1;
                  if (refreshShouldFail) throw new Error('refresh failed');
                  accessToken = 'fresh-token';
                  return { admin: { id: 'a1' }, accessToken: 'fresh-token' };
            },
            onAuthFailure: () => {
                  onAuthFailureCount += 1;
                  accessToken = null;
            },
      });
});

describe('request interceptor', () => {
      it('attaches the in-memory access token when present', async () => {
            accessToken = 'login-token';

            await api.get('/api/v1/admin/sessions');

            expect(seenAuthHeaders).toContain('Bearer login-token');
            expect(localStorage.getItem('adminToken')).toBeNull();
      });

      it('sends no Authorization header when there is no session', async () => {
            await api.get('/api/v1/admin/sessions').catch(() => {});

            expect(seenAuthHeaders[0]).toBeNull();
      });
});

describe('response interceptor — single-flight refresh', () => {
      it('performs exactly one refresh for many concurrent 401s', async () => {
            const requests = Array.from({ length: 6 }, () =>
                  api.get('/api/v1/admin/sessions')
            );

            const results = await Promise.all(requests);

            for (const result of results) {
                  expect(result.status).toBe(200);
                  expect(result.data.success).toBe(true);
            }
            expect(refreshCount).toBe(1);
            expect(onAuthFailureCount).toBe(0);
      });

      it('retries each failed request once with the new token', async () => {
            await api.get('/api/v1/admin/sessions');

            // First attempt had no token, the retry carried the refreshed one.
            expect(seenAuthHeaders).toContain(null);
            expect(seenAuthHeaders).toContain('Bearer fresh-token');
            expect(refreshCount).toBe(1);
      });

      it('ends the session when the refresh fails, without looping', async () => {
            refreshShouldFail = true;

            await expect(api.get('/api/v1/admin/sessions')).rejects.toMatchObject({
                  response: { status: 401 },
            });

            expect(refreshCount).toBe(1);
            expect(onAuthFailureCount).toBe(1);
      });
});

describe('response interceptor — skips', () => {
      it('does not attempt a refresh for auth endpoints (no recursion)', async () => {
            refreshShouldFail = true;

            await expect(
                  api.post(adminAuthEndpoints.refresh, undefined, { cache: false })
            ).rejects.toMatchObject({ response: { status: 401 } });

            // The refresh call itself must not trigger another refresh.
            expect(refreshEndpointHits).toBe(1);
            expect(refreshCount).toBe(0);
            expect(onAuthFailureCount).toBe(0);
      });

      it('does not attempt a refresh for public endpoints', async () => {
            let publicCallCount = 0;
            api.defaults.adapter = async (config) => {
                  if (String(config.url).includes('/public/')) {
                        publicCallCount += 1;
                        throw unauthorized(config);
                  }
                  return fakeAdapter(config);
            };

            await expect(api.get('/api/v1/public/hero')).rejects.toMatchObject({
                  response: { status: 401 },
            });

            expect(publicCallCount).toBe(1);
            expect(refreshCount).toBe(0);
            expect(onAuthFailureCount).toBe(0);
      });

      it('does not refresh on non-401 failures', async () => {
            api.defaults.adapter = async (config) => {
                  const error = new Error('boom');
                  error.isAxiosError = true;
                  error.config = config;
                  error.response = { status: 500, data: { message: 'oops' }, config, headers: {} };
                  throw error;
            };

            await expect(api.get('/api/v1/admin/sessions')).rejects.toMatchObject({
                  response: { status: 500 },
            });

            expect(refreshCount).toBe(0);
            expect(onAuthFailureCount).toBe(0);
      });
});

describe('auth API surface', () => {
      it('exposes only cookie/memory based auth endpoints', () => {
            expect(adminAuthEndpoints.login).toBe('/api/v1/admin/login');
            expect(adminAuthEndpoints.refresh).toBe('/api/v1/admin/refresh');
            expect(adminAuthEndpoints.checkAuth).toBe('/api/v1/admin/me');
            // There is no public registration endpoint anywhere.
            expect(JSON.stringify(adminAuthEndpoints)).not.toMatch(/register|initialize/);
      });

      it('the axios instance always sends cookies', () => {
            expect(api.defaults.withCredentials).toBe(true);
      });
});
