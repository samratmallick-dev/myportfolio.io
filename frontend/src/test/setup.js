import '@testing-library/jest-dom/vitest';

// jsdom does not implement matchMedia (used by theme detection).
if (typeof window !== 'undefined' && !window.matchMedia) {
      window.matchMedia = (query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {},
            dispatchEvent() {
                  return false;
            },
      });
}

// jsdom does not implement ResizeObserver / IntersectionObserver.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
      window.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
      };
}

if (typeof window !== 'undefined' && !window.IntersectionObserver) {
      window.IntersectionObserver = class IntersectionObserver {
            constructor() {
                  this.root = null;
                  this.rootMargin = '';
                  this.thresholds = [];
            }
            observe() {}
            unobserve() {}
            disconnect() {}
            takeRecords() {
                  return [];
            }
      };
}

if (typeof window !== 'undefined' && !window.scrollTo) {
      window.scrollTo = () => {};
}
