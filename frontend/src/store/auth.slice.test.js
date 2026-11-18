import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

/*
 * Authentication state must live ONLY in memory: after any action the browser
 * storage must stay empty, and no refresh token material may ever exist in the
 * Redux state.
 */

vi.mock('@/config/api', () => ({
      loginAdmin: vi.fn(),
      logoutAdmin: vi.fn(),
      logoutAllAdminSessions: vi.fn(),
      checkAdminAuth: vi.fn(),
      refreshAdminSession: vi.fn(),
      fetchAdminSessions: vi.fn(),
      revokeAdminSession: vi.fn(),
      changeAdminPassword: vi.fn(),
      createAdminAccount: vi.fn(),
      generateOTP: vi.fn(),
      verifyOTPAndUpdateEmail: vi.fn(),
      verifyOTPAndUpdatePassword: vi.fn(),
}));

const api = await import('@/config/api');
const authReducer = (await import('@/store/auth.slice')).default;
const {
      loginUser,
      refreshSession,
      logoutUser,
      logoutAllSessions,
      initializeAuth,
      ensureAuthInitialized,
      resetAuthInitialization,
      changeAdminPasswordThunk,
      verifyOTPAndUpdatePasswordThunk,
      clearAuthState,
} = await import('@/store/auth.slice');

const ADMIN = { id: 'a1', username: 'admin', email: 'admin@example.com', role: 'admin' };

const makeStore = () =>
      configureStore({
            reducer: { auth: authReducer },
      });

beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
      sessionStorage.clear();
      resetAuthInitialization();
});

describe('initial state', () => {
      it('starts unauthenticated and initializing, with no token anywhere', () => {
            const state = makeStore().getState().auth;

            expect(state.isAuthenticated).toBe(false);
            expect(state.isInitializing).toBe(true);
            expect(state.accessToken).toBeNull();
            expect(state.admin).toBeNull();
            expect(localStorage.getItem('adminToken')).toBeNull();
            expect(localStorage.getItem('adminUser')).toBeNull();
      });
});

describe('login', () => {
      it('stores the admin and access token in memory only', async () => {
            api.loginAdmin.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 'access-token-value' },
            });

            const store = makeStore();
            await store.dispatch(loginUser({ email: 'a@b.c', password: 'password123' }));

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.isInitializing).toBe(false);
            expect(state.accessToken).toBe('access-token-value');
            expect(state.admin.email).toBe('admin@example.com');
            // `user` keeps mirroring `admin` for existing components.
            expect(state.user).toEqual(state.admin);

            // Nothing may leak into browser storage.
            expect(localStorage.length).toBe(0);
            expect(sessionStorage.length).toBe(0);
      });

      it('surfaces the server message on failure without authenticating', async () => {
            api.loginAdmin.mockRejectedValue({ message: 'Invalid email or password' });

            const store = makeStore();
            await store.dispatch(loginUser({ email: 'a@b.c', password: 'wrong' }));

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.accessToken).toBeNull();
            expect(state.error).toBe('Invalid email or password');
      });
});

describe('session refresh', () => {
      it('applies a refreshed session', async () => {
            api.refreshAdminSession.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 'refreshed-token' },
            });

            const store = makeStore();
            await store.dispatch(refreshSession());

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.accessToken).toBe('refreshed-token');
            expect(state.isInitializing).toBe(false);
            expect(localStorage.length).toBe(0);
      });

      it('treats a failed refresh as "signed out", not as an error state', async () => {
            api.refreshAdminSession.mockRejectedValue({ message: 'Unauthorized' });

            const store = makeStore();
            await store.dispatch(refreshSession());

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.accessToken).toBeNull();
            expect(state.isInitializing).toBe(false);
            expect(state.error).toBeNull();
      });
});

describe('initializeAuth', () => {
      it('marks the app ready after a successful refresh', async () => {
            api.refreshAdminSession.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 'boot-token' },
            });
            api.checkAdminAuth.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN },
            });

            const store = makeStore();
            await store.dispatch(initializeAuth());

            const state = store.getState().auth;
            expect(state.isInitializing).toBe(false);
            expect(state.isAuthenticated).toBe(true);
            expect(state.accessToken).toBe('boot-token');
      });

      it('always finishes initialization, even without a session', async () => {
            api.refreshAdminSession.mockRejectedValue({ message: 'no cookie' });

            const store = makeStore();
            await store.dispatch(initializeAuth());

            const state = store.getState().auth;
            expect(state.isInitializing).toBe(false);
            expect(state.isAuthenticated).toBe(false);
      });

      it('ensureAuthInitialized runs only once per application lifetime', async () => {
            api.refreshAdminSession.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 'boot-token' },
            });

            const store = makeStore();
            await Promise.all([
                  ensureAuthInitialized(store.dispatch),
                  ensureAuthInitialized(store.dispatch),
            ]);
            await ensureAuthInitialized(store.dispatch);

            expect(api.refreshAdminSession).toHaveBeenCalledTimes(1);
      });
});

describe('logout', () => {
      it('clears the local session even when the API call fails', async () => {
            api.logoutAdmin.mockRejectedValue({ message: 'network down' });

            const store = makeStore();
            // Seed an authenticated state.
            api.loginAdmin.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 't' },
            });
            await store.dispatch(loginUser({ email: 'a@b.c', password: 'x' }));
            expect(store.getState().auth.isAuthenticated).toBe(true);

            await store.dispatch(logoutUser());

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.accessToken).toBeNull();
            expect(state.admin).toBeNull();
            expect(localStorage.length).toBe(0);
      });

      it('logout-all also clears the local session', async () => {
            api.logoutAllAdminSessions.mockResolvedValue({ success: true });

            const store = makeStore();
            api.loginAdmin.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 't' },
            });
            await store.dispatch(loginUser({ email: 'a@b.c', password: 'x' }));

            await store.dispatch(logoutAllSessions());

            expect(store.getState().auth.isAuthenticated).toBe(false);
            expect(store.getState().auth.accessToken).toBeNull();
      });
});

describe('password and OTP flows revoke the local session', () => {
      it('changePassword clears the session (server revoked every session)', async () => {
            api.changeAdminPassword.mockResolvedValue({ success: true });

            const store = makeStore();
            api.loginAdmin.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 't' },
            });
            await store.dispatch(loginUser({ email: 'a@b.c', password: 'x' }));

            await store.dispatch(
                  changeAdminPasswordThunk({ currentPassword: 'old-password', newPassword: 'new-password' })
            );

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.accessToken).toBeNull();
      });

      it('OTP password update clears the session', async () => {
            api.verifyOTPAndUpdatePassword.mockResolvedValue({ success: true });

            const store = makeStore();
            api.loginAdmin.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 't' },
            });
            await store.dispatch(loginUser({ email: 'a@b.c', password: 'x' }));

            await store.dispatch(verifyOTPAndUpdatePasswordThunk({ otp: '123456', newPassword: 'brand-new-password' }));

            expect(store.getState().auth.isAuthenticated).toBe(false);
      });
});

describe('storage hygiene', () => {
      it('no auth action ever writes credentials to browser storage', async () => {
            const store = makeStore();

            api.loginAdmin.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 'secret-access-token' },
            });
            api.refreshAdminSession.mockResolvedValue({
                  success: true,
                  data: { admin: ADMIN, accessToken: 'secret-refreshed-token' },
            });
            api.logoutAdmin.mockResolvedValue({ success: true });

            await store.dispatch(loginUser({ email: 'a@b.c', password: 'password123' }));
            await store.dispatch(refreshSession());

            const dumped = JSON.stringify({
                  local: { ...localStorage },
                  session: { ...sessionStorage },
            });
            expect(dumped).not.toContain('secret-access-token');
            expect(dumped).not.toContain('secret-refreshed-token');
            expect(dumped).not.toContain('password123');

            await store.dispatch(logoutUser());
            expect(localStorage.length).toBe(0);
      });

      it('clearAuthState wipes the session without touching storage', () => {
            const store = makeStore();
            store.dispatch(clearAuthState());

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.accessToken).toBeNull();
            expect(state.isInitializing).toBe(false);
      });
});
