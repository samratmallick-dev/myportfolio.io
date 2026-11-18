import { describe, it, expect } from 'vitest';
import projectReducer, {
      getPublicProjectsPage,
      markPublicProjectsUpdated,
} from '@/store/project.slice';

const initial = () => projectReducer(undefined, { type: '@@INIT' });

const arg = { page: 1, limit: 9 };

const fulfilled = (startedAt, items) =>
      getPublicProjectsPage.fulfilled(
            { page: 1, limit: 9, startedAt, items, pagination: null },
            'req',
            arg,
      );

describe('project.slice — public page ordering', () => {
      it('applies a response that started after the last update', () => {
            let state = projectReducer(initial(), getPublicProjectsPage.pending('req', arg));
            state = projectReducer(state, fulfilled(Date.now(), [{ _id: 'new' }]));

            expect(state.publicProjects.items).toEqual([{ _id: 'new' }]);
            expect(state.publicProjects.status).toBe('succeeded');
            expect(state.publicProjects.fetchedAt).toBeGreaterThan(0);
      });

      it('discards a stale response that raced with an update', () => {
            let state = projectReducer(initial(), getPublicProjectsPage.pending('req1', arg));

            // Admin saves while the first request is still in flight.
            state = projectReducer(state, markPublicProjectsUpdated());

            state = projectReducer(state, fulfilled(Date.now() - 10_000, [{ _id: 'stale' }]));

            expect(state.publicProjects.items).toEqual([]);
            expect(state.publicProjects.fetchedAt).toBe(0);
      });

      it('keeps newer data when an older response arrives late', () => {
            let state = projectReducer(initial(), getPublicProjectsPage.pending('req2', arg));
            const updateAt = Date.now();
            state = projectReducer(state, markPublicProjectsUpdated());

            const afterUpdate = Date.now() + 1;
            state = projectReducer(state, fulfilled(afterUpdate, [{ _id: 'new' }]));
            expect(state.publicProjects.items).toEqual([{ _id: 'new' }]);

            // The pre-update request finishes afterwards and must be dropped.
            state = projectReducer(state, fulfilled(updateAt - 1000, [{ _id: 'old' }]));

            expect(state.publicProjects.items).toEqual([{ _id: 'new' }]);
            expect(state.publicProjects.fetchedAt).toBeGreaterThan(0);
      });

      it('normalises rejection payloads to a readable message', () => {
            let state = projectReducer(initial(), getPublicProjectsPage.pending('req3', arg));
            state = projectReducer(
                  state,
                  getPublicProjectsPage.rejected(
                        new Error('Network down'),
                        'req3',
                        arg,
                        { message: 'Network down', startedAt: Date.now() },
                  ),
            );

            expect(state.publicProjects.status).toBe('failed');
            expect(state.publicProjects.error).toBe('Network down');
      });

      it('markPublicProjectsUpdated invalidates freshness without touching items', () => {
            let state = projectReducer(initial(), getPublicProjectsPage.pending('req4', arg));
            state = projectReducer(state, fulfilled(Date.now(), [{ _id: 'p1' }]));

            state = projectReducer(state, markPublicProjectsUpdated());

            expect(state.publicProjects.items).toEqual([{ _id: 'p1' }]);
            expect(state.publicProjects.fetchedAt).toBe(0);
            expect(state.publicProjects.updatedAt).toBeGreaterThan(0);
      });
});
