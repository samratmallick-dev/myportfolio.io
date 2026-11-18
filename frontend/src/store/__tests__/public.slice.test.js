import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/config/api', () => ({
      fetchPublicInitialData: vi.fn(),
      fetchPublicHero: vi.fn(),
      fetchPublicAbout: vi.fn(),
      fetchPublicEducation: vi.fn(),
      fetchPublicSkills: vi.fn(),
      fetchPublicFeaturedProjects: vi.fn(),
      fetchPublicServices: vi.fn(),
      fetchPublicContact: vi.fn(),
}));

import * as api from '@/config/api';
import publicReducer, {
      fetchPublicSection,
      getPublicInitialData,
      updatePublicData,
      invalidatePublicSection,
} from '../public.slice';

const createStore = () =>
      configureStore({
            reducer: { public: publicReducer },
      });

describe('public slice', () => {
      beforeEach(() => {
            vi.resetAllMocks();
      });

      it('loads a single section independently', async () => {
            api.fetchPublicHero.mockResolvedValue({ name: 'Samrat' });
            const store = createStore();

            await store.dispatch(fetchPublicSection({ section: 'hero' }));

            const state = store.getState().public.hero;
            expect(state.status).toBe('succeeded');
            expect(state.data).toEqual({ name: 'Samrat' });
            expect(store.getState().public.about.status).toBe('idle');
            expect(api.fetchPublicAbout).not.toHaveBeenCalled();
      });

      it('deduplicates concurrent requests for the same section', async () => {
            let resolveHero;
            api.fetchPublicHero.mockReturnValue(new Promise((resolve) => {
                  resolveHero = resolve;
            }));
            const store = createStore();

            const first = store.dispatch(fetchPublicSection({ section: 'hero' }));
            const second = store.dispatch(fetchPublicSection({ section: 'hero' }));

            expect(api.fetchPublicHero).toHaveBeenCalledTimes(1);

            resolveHero({ name: 'Once' });
            await Promise.all([first, second]);

            expect(api.fetchPublicHero).toHaveBeenCalledTimes(1);
            expect(store.getState().public.hero.data).toEqual({ name: 'Once' });
      });

      it('records a failure without retrying automatically', async () => {
            api.fetchPublicHero.mockRejectedValue(new Error('network down'));
            const store = createStore();

            await store.dispatch(fetchPublicSection({ section: 'hero' }));

            const state = store.getState().public.hero;
            expect(state.status).toBe('failed');
            expect(state.error).toMatch(/network down/);
      });

      it('keeps a newer Socket.IO update when an older request resolves', async () => {
            let resolveHero;
            api.fetchPublicHero.mockReturnValue(new Promise((resolve) => {
                  resolveHero = resolve;
            }));
            const store = createStore();

            const request = store.dispatch(fetchPublicSection({ section: 'hero' }));

            await new Promise((resolve) => setTimeout(resolve, 5));
            store.dispatch(updatePublicData({ type: 'hero', data: { name: 'Live' } }));

            resolveHero({ name: 'Stale' });
            await request;

            expect(store.getState().public.hero.data).toEqual({ name: 'Live' });
            expect(store.getState().public.hero.status).toBe('succeeded');
      });

      it('applies realtime project updates from socket payloads', () => {
            const store = createStore();
            store.dispatch(updatePublicData({
                  type: 'projects',
                  data: { featured: [{ _id: '1', title: 'A' }] },
            }));

            expect(store.getState().public.projects.data).toHaveLength(1);
      });

      it('invalidates a section so it can be fetched again', async () => {
            api.fetchPublicAbout.mockResolvedValue({ paragraphs: 'Hello' });
            const store = createStore();

            await store.dispatch(fetchPublicSection({ section: 'about' }));
            expect(store.getState().public.about.status).toBe('succeeded');

            store.dispatch(invalidatePublicSection('about'));
            expect(store.getState().public.about.status).toBe('idle');
            expect(store.getState().public.about.fetchedAt).toBe(0);
      });

      it('keeps the legacy aggregate loader shape working', async () => {
            api.fetchPublicInitialData.mockResolvedValue({
                  data: {
                        hero: { name: 'Hero' },
                        about: { paragraphs: 'About' },
                        education: [],
                        skills: [],
                        featuredProjects: [],
                        services: [],
                        contact: { email: 'a@b.c' },
                  },
            });
            const store = createStore();

            await store.dispatch(getPublicInitialData());

            expect(store.getState().public.hero.data.name).toBe('Hero');
            expect(store.getState().public.contact.data.email).toBe('a@b.c');
      });
});
