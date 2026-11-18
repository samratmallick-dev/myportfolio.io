import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
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
import publicReducer from '../../store/public.slice';
import { useLazySection } from '../useLazySection';

const createStore = () =>
      configureStore({
            reducer: { public: publicReducer },
      });

const Harness = () => {
      const { data, status, isError, retry } = useLazySection('hero', { priority: true });

      return (
            <div>
                  <span data-testid="status">{status}</span>
                  <span data-testid="name">{data?.name || ''}</span>
                  {isError && <button onClick={retry}>retry</button>}
            </div>
      );
};

describe('useLazySection', () => {
      it('loads a priority section immediately', async () => {
            api.fetchPublicHero.mockResolvedValue({ name: 'Loaded' });
            const store = createStore();

            render(
                  <Provider store={store}>
                        <Harness />
                  </Provider>
            );

            await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('succeeded'));
            expect(screen.getByTestId('name')).toHaveTextContent('Loaded');
            expect(api.fetchPublicHero).toHaveBeenCalledTimes(1);
      });

      it('does not loop after a failure and recovers through retry()', async () => {
            const user = userEvent.setup();
            api.fetchPublicHero
                  .mockRejectedValueOnce(new Error('offline'))
                  .mockResolvedValueOnce({ name: 'Recovered' });
            const store = createStore();

            render(
                  <Provider store={store}>
                        <Harness />
                  </Provider>
            );

            await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('failed'));

            // Give any accidental retry effect a chance to run.
            await new Promise((resolve) => setTimeout(resolve, 30));
            expect(api.fetchPublicHero).toHaveBeenCalledTimes(1);

            await user.click(screen.getByRole('button', { name: /retry/i }));

            await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Recovered'));
            expect(api.fetchPublicHero).toHaveBeenCalledTimes(2);
      });
});
