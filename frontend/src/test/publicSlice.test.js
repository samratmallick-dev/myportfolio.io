import { describe, it, expect } from 'vitest';
import publicReducer, {
      updatePublicData,
      externalSectionUpdated,
      fetchPublicSection,
} from '@/store/public.slice';

const initial = () => publicReducer(undefined, { type: '@@INIT' });

const applyHero = (state, data, version) =>
      publicReducer(state, updatePublicData({ type: 'hero', data, version }));

describe('public.slice — socket updates', () => {
      it('applies a persisted payload with its version', () => {
            const state = applyHero(initial(), { name: 'Samrat Mallick' }, 1000);

            expect(state.hero.data.name).toBe('Samrat Mallick');
            expect(state.hero.status).toBe('succeeded');
            expect(state.hero.version).toBe(1000);
            expect(state.hero.fetchedAt).toBeGreaterThan(0);
      });

      it('never lets an older event overwrite newer data', () => {
            let state = applyHero(initial(), { name: 'Newest' }, 2000);
            state = applyHero(state, { name: 'Old' }, 1000);

            expect(state.hero.data.name).toBe('Newest');
            expect(state.hero.version).toBe(2000);
      });

      it('marks the section stale when the event carries no payload', () => {
            let state = applyHero(initial(), { name: 'Newest' }, 2000);
            state = publicReducer(state, updatePublicData({ type: 'hero', version: 3000 }));

            expect(state.hero.fetchedAt).toBe(0);
            expect(state.hero.version).toBe(3000);
            expect(state.hero.data.name).toBe('Newest');
      });

      it('ignores duplicate or older events for a loaded section', () => {
            let state = applyHero(initial(), { name: 'Newest' }, 2000);
            const before = { ...state.hero };

            state = publicReducer(state, updatePublicData({ type: 'hero', data: { name: 'Dup' }, version: 2000 }));

            expect(state.hero.data.name).toBe('Newest');
            expect(state.hero.fetchedAt).toBe(before.fetchedAt);
      });

      it('handles the projects payload shape ({ featured, all })', () => {
            const state = publicReducer(
                  initial(),
                  updatePublicData({
                        type: 'projects',
                        data: { featured: [{ _id: 'p1' }], all: [{ _id: 'p1' }, { _id: 'p2' }] },
                        version: 500,
                  }),
            );

            expect(state.projects.data).toEqual([{ _id: 'p1' }]);
            expect(state.projects.version).toBe(500);
      });
});

describe('public.slice — cross-tab updates', () => {
      it('marks a loaded section stale so it refetches immediately', () => {
            let state = applyHero(initial(), { name: 'Current' }, 1000);
            state = publicReducer(state, externalSectionUpdated({ section: 'hero', version: 2000 }));

            expect(state.hero.fetchedAt).toBe(0);
            expect(state.hero.version).toBe(2000);
            expect(state.hero.data.name).toBe('Current');
      });

      it('rejects an update that is not newer than the known version', () => {
            let state = applyHero(initial(), { name: 'Current' }, 2000);
            state = publicReducer(state, externalSectionUpdated({ section: 'hero', version: 1500 }));

            expect(state.hero.version).toBe(2000);
            expect(state.hero.fetchedAt).toBeGreaterThan(0);
      });

      it('re-enables fetching for a previously failed section', () => {
            let state = initial();
            state = publicReducer(state, fetchPublicSection.pending('req0', { section: 'hero' }));
            state = publicReducer(
                  state,
                  fetchPublicSection.rejected(
                        new Error('boom'),
                        'req0',
                        { section: 'hero' },
                        { section: 'hero', startedAt: Date.now(), error: { message: 'boom' } },
                  ),
            );
            expect(state.hero.status).toBe('failed');

            state = publicReducer(state, externalSectionUpdated({ section: 'hero', version: 4000 }));
            expect(state.hero.status).toBe('idle');
            expect(state.hero.fetchedAt).toBe(0);
      });
});

describe('public.slice — out-of-order responses', () => {
      const arg = { section: 'hero' };

      it('discards a response that started before a newer update landed', () => {
            let state = publicReducer(initial(), fetchPublicSection.pending('req1', arg));

            // The update lands while request A is still in flight.
            state = applyHero(state, { name: 'New' }, 5000);

            state = publicReducer(
                  state,
                  fetchPublicSection.fulfilled(
                        { section: 'hero', data: { name: 'Old' }, startedAt: Date.now() - 10_000 },
                        'req1',
                        arg,
                  ),
            );

            expect(state.hero.data.name).toBe('New');
            expect(state.hero.version).toBe(5000);
      });

      it('keeps serving existing data during a background refresh (no skeleton)', () => {
            let state = applyHero(initial(), { name: 'Current' }, 1000);
            state = publicReducer(state, fetchPublicSection.pending('req2', arg));

            expect(state.hero.status).toBe('succeeded');
            expect(state.hero.isRefreshing).toBe(true);
            expect(state.hero.data.name).toBe('Current');

            state = publicReducer(
                  state,
                  fetchPublicSection.fulfilled(
                        { section: 'hero', data: { name: 'Current' }, startedAt: Date.now() },
                        'req2',
                        arg,
                  ),
            );

            expect(state.hero.isRefreshing).toBe(false);
            expect(state.hero.fetchedAt).toBeGreaterThan(0);
      });

      it('applies a response that started after the update', () => {
            let state = publicReducer(initial(), fetchPublicSection.pending('req3', arg));
            state = publicReducer(state, fetchPublicSection.fulfilled(
                  { section: 'hero', data: { name: 'Fresh' }, startedAt: Date.now() },
                  'req3',
                  arg,
            ));

            expect(state.hero.data.name).toBe('Fresh');
            expect(state.hero.status).toBe('succeeded');
      });
});
