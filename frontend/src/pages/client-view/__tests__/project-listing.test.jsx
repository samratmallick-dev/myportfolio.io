import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
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
      fetchPublicInitialData: vi.fn(),
      fetchPublicHero: vi.fn(),
      fetchPublicAbout: vi.fn(),
      fetchPublicEducation: vi.fn(),
      fetchPublicSkills: vi.fn(),
      fetchPublicFeaturedProjects: vi.fn(),
      fetchPublicServices: vi.fn(),
      fetchPublicContact: vi.fn(),
}));

vi.mock('@/hooks/useSocket', () => ({
      useSocket: () => {},
}));

import * as api from '@/config/api';
import projectReducer from '@/store/project.slice';
import publicReducer from '@/store/public.slice';
import MyAllProjectList from '../project-listing';

const createStore = () =>
      configureStore({
            reducer: { project: projectReducer, public: publicReducer },
      });

describe('project listing route', () => {
      it('renders a paginated project page from the public API', async () => {
            api.fetchPublicProjects.mockResolvedValue({
                  items: [{ _id: '1', title: 'Portfolio Platform', slug: 'portfolio' }],
                  pagination: {
                        page: 1,
                        limit: 9,
                        total: 10,
                        totalPages: 2,
                        hasNext: true,
                        hasPrev: false,
                  },
            });

            const store = createStore();

            render(
                  <Provider store={store}>
                        <MemoryRouter>
                              <MyAllProjectList />
                        </MemoryRouter>
                  </Provider>
            );

            expect(await screen.findByText('Portfolio Platform')).toBeInTheDocument();
            expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
            expect(api.fetchPublicProjects).toHaveBeenCalledWith({
                  page: 1,
                  limit: 9,
                  signal: expect.anything(),
                  cache: true,
            });
      });
});
