import { describe, expect, it } from 'vitest';
import { getOptimizedImageUrl, getResponsiveSrcSet } from '../imageOptimization';

const CLOUDINARY = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

describe('Cloudinary image helpers', () => {
      it('leaves non-Cloudinary URLs untouched', () => {
            expect(getOptimizedImageUrl('/hero-bg.jpg', { width: 400 })).toBe('/hero-bg.jpg');
            expect(getOptimizedImageUrl(undefined)).toBeUndefined();
      });

      it('adds width, quality and format transformations', () => {
            const result = getOptimizedImageUrl(CLOUDINARY, { width: 640 });
            expect(result).toContain('/upload/w_640,c_fill,g_auto,q_auto,f_auto/');
            expect(result.endsWith('sample.jpg')).toBe(true);
      });

      it('merges with existing transformations instead of duplicating them', () => {
            const withExisting = 'https://res.cloudinary.com/demo/image/upload/w_200,q_80/sample.jpg';
            const result = getOptimizedImageUrl(withExisting, { width: 800, quality: 'auto' });

            expect(result).toContain('w_800');
            expect(result).toContain('q_auto');
            expect(result.match(/w_\d+/g)).toHaveLength(1);
      });

      it('preserves a version segment', () => {
            const versioned = 'https://res.cloudinary.com/demo/image/upload/v123456/sample.jpg';
            const result = getOptimizedImageUrl(versioned, { width: 320 });
            expect(result).toContain('/upload/w_320,c_fill,g_auto,q_auto,f_auto/v123456/sample.jpg');
      });

      it('builds a width-descriptor srcset', () => {
            const srcSet = getResponsiveSrcSet(CLOUDINARY, [320, 640]);
            expect(srcSet).toContain('w_320');
            expect(srcSet).toContain('320w');
            expect(srcSet).toContain('640w');
      });

      it('returns an empty srcset for non-Cloudinary URLs', () => {
            expect(getResponsiveSrcSet('/local.jpg')).toBe('');
      });
});
