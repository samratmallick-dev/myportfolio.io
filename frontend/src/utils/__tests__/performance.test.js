import { describe, expect, it } from 'vitest';
import { shouldRender3D, prefersReducedMotion, whenIdle } from '../performance';

const fakeWindow = (matchMediaMatches) => ({
      matchMedia: () => ({ matches: matchMediaMatches }),
      setTimeout: (callback) => {
            callback();
            return 1;
      },
      clearTimeout: () => {},
});

describe('performance capability helpers', () => {
      it('disables 3D for users who prefer reduced motion', () => {
            expect(prefersReducedMotion(fakeWindow(true))).toBe(true);
            expect(shouldRender3D(fakeWindow(true), { deviceMemory: 8 })).toBe(false);
      });

      it('disables 3D when data saver is enabled', () => {
            expect(shouldRender3D(fakeWindow(false), {
                  deviceMemory: 8,
                  connection: { saveData: true, effectiveType: '4g' },
            })).toBe(false);
      });

      it('disables 3D on slow connections', () => {
            expect(shouldRender3D(fakeWindow(false), {
                  deviceMemory: 8,
                  connection: { saveData: false, effectiveType: '2g' },
            })).toBe(false);
      });

      it('disables 3D on low-memory devices', () => {
            expect(shouldRender3D(fakeWindow(false), { deviceMemory: 2 })).toBe(false);
      });

      it('enables 3D on capable devices without motion preferences', () => {
            expect(shouldRender3D(fakeWindow(false), {
                  deviceMemory: 8,
                  connection: { saveData: false, effectiveType: '4g' },
            })).toBe(true);
      });

      it('falls back to a timeout when requestIdleCallback is unavailable', () => {
            let called = false;
            whenIdle(() => { called = true; }, fakeWindow(false));
            expect(called).toBe(true);
      });
});
