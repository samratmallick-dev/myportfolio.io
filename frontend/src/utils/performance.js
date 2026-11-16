/**
 * Device/connection capability checks for optional visual enhancements.
 * Kept framework-free so it can be unit tested in isolation.
 */
export const prefersReducedMotion = (win = globalThis.window) => {
      if (!win?.matchMedia) return false;
      try {
            return win.matchMedia('(prefers-reduced-motion: reduce)').matches === true;
      } catch {
            return false;
      }
};

export const shouldRender3D = (win = globalThis.window, nav = globalThis.navigator) => {
      if (!win) return false;

      const connection = nav?.connection;
      const saveData = connection?.saveData === true;
      const slowConnection = ['slow-2g', '2g'].includes(connection?.effectiveType);
      const lowMemory = typeof nav?.deviceMemory === 'number' && nav.deviceMemory < 4;

      return !(prefersReducedMotion(win) || saveData || slowConnection || lowMemory);
};

export const whenIdle = (callback, win = globalThis.window) => {
      if (!win) return () => {};

      if (typeof win.requestIdleCallback === 'function') {
            const id = win.requestIdleCallback(callback, { timeout: 2500 });
            return () => win.cancelIdleCallback?.(id);
      }

      const id = win.setTimeout(callback, 1200);
      return () => win.clearTimeout(id);
};
