import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/config/api', () => ({
      fetchAllProjects: vi.fn(),
      fetchProjectById: vi.fn(),
      fetchProjectBySlug: vi.fn(),
      createProject: vi.fn(),
      updateProjectById: vi.fn(),
      deleteProjectById: vi.fn(),
      fetchAllProjectsAdmin: vi.fn(),
      fetchFeaturedProjects: vi.fn(),
      fetchPublicProjects: vi.fn(),
      setFeaturedProject: vi.fn(),
}));

import * as api from '@/config/api';
import projectReducer, { getPublicProjectsPage } from '../project.slice';

const createStore = () =>
      configureStore({
            reducer: { project: projectReducer },
      });

const pagePayload = (page, limit, ids) => ({
      items: ids.map((id) => ({ _id: id, title: `Project ${id}` })),
      pagination: {
            page,
            limit,
            total: 12,
            totalPages: 2,
            hasNext: page < 2,
            hasPrev: page > 1,
      },
});

describe('public project pagination', () => {
      beforeEach(() => {
            vi.resetAllMocks();
      });

      it('stores items and pagination metadata for a page', async () => {
            api.fetchPublicProjects.mockResolvedValue(pagePayload(1, 9, ['a', 'b']));
            const store = createStore();

            await store.dispatch(getPublicProjectsPage({ page: 1, limit: 9 }));

            const state = store.getState().project.publicProjects;
            expect(api.fetchPublicProjects).toHaveBeenCalledWith({ page: 1, limit: 9, signal: expect.anything(), cache: true });
            expect(state.items).toHaveLength(2);
            expect(state.pagination.hasNext).toBe(true);
            expect(state.pagination.totalPages).toBe(2);
            expect(state.status).toBe('succeeded');
      });

      it('deduplicates an in-flight request for the same page', async () => {
            let resolvePage;
            api.fetchPublicProjects.mockReturnValue(new Promise((resolve) => {
                  resolvePage = resolve;
            }));
            const store = createStore();

            const first = store.dispatch(getPublicProjectsPage({ page: 1, limit: 9 }));
            const second = store.dispatch(getPublicProjectsPage({ page: 1, limit: 9 }));

            expect(api.fetchPublicProjects).toHaveBeenCalledTimes(1);

            resolvePage(pagePayload(1, 9, ['a']));
            await Promise.all([first, second]);

            expect(api.fetchPublicProjects).toHaveBeenCalledTimes(1);
      });

      it('reuses a fresh page without another request', async () => {
            api.fetchPublicProjects.mockResolvedValue(pagePayload(1, 9, ['a']));
            const store = createStore();

            await store.dispatch(getPublicProjectsPage({ page: 1, limit: 9 }));
            await store.dispatch(getPublicProjectsPage({ page: 1, limit: 9 }));

            expect(api.fetchPublicProjects).toHaveBeenCalledTimes(1);
      });

      it('refetches when forced, e.g. after a socket update', async () => {
            api.fetchPublicProjects.mockResolvedValue(pagePayload(1, 9, ['a']));
            const store = createStore();

            await store.dispatch(getPublicProjectsPage({ page: 1, limit: 9 }));
            await store.dispatch(getPublicProjectsPage({ page: 1, limit: 9, force: true }));

            expect(api.fetchPublicProjects).toHaveBeenCalledTimes(2);
            expect(api.fetchPublicProjects).toHaveBeenLastCalledWith(expect.objectContaining({ cache: false }));
      });

      it('records failures without clearing the previous page', async () => {
            api.fetchPublicProjects.mockResolvedValueOnce(pagePayload(1, 9, ['a']));
            const store = createStore();
            await store.dispatch(getPublicProjectsPage({ page: 1, limit: 9 }));

            api.fetchPublicProjects.mockRejectedValueOnce(new Error('boom'));
            await store.dispatch(getPublicProjectsPage({ page: 2, limit: 9 }));

            const state = store.getState().project.publicProjects;
            expect(state.status).toBe('failed');
            expect(state.items).toHaveLength(1);
            expect(state.error).toMatch(/boom/);
      });
});
