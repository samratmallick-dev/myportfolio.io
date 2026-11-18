import { describe, it, expect, beforeEach } from 'vitest';
import {
      createHttpCache,
      sectionForUrl,
      isPublicUrl,
      ALL_SECTIONS,
} from '@/utils/httpCache';

describe('sectionForUrl', () => {
      it('maps public endpoints to their section', () => {
            expect(sectionForUrl('/api/v1/public/hero')).toBe('hero');
            expect(sectionForUrl('/api/v1/public/featured-projects?page=1')).toBe('projects');
            expect(sectionForUrl('/api/v1/public/initial-data')).toBe(ALL_SECTIONS);
            expect(sectionForUrl('/api/v1/public/contact')).toBe('contact');
      });

      it('maps admin write endpoints to their section', () => {
            expect(sectionForUrl('/api/v1/hero/add-and-update-hero-content')).toBe('hero');
            expect(sectionForUrl('/api/v1/skills/add-skill/123')).toBe('skills');
            expect(sectionForUrl('/api/v1/projects/update-project/456')).toBe('projects');
            expect(sectionForUrl('/api/v1/contact/add-update-contact-details')).toBe('contact');
      });

      it('never maps auth or message endpoints to a section', () => {
            expect(sectionForUrl('/api/v1/admin/login')).toBeUndefined();
            expect(sectionForUrl('/api/v1/admin/get-admin-user')).toBeUndefined();
            expect(sectionForUrl('/api/v1/contact/send-message')).toBeUndefined();
            expect(sectionForUrl('/api/v1/contact/delete-message/1')).toBeUndefined();
      });

      it('isPublicUrl only accepts anonymous public content', () => {
            expect(isPublicUrl('/api/v1/public/hero')).toBe(true);
            expect(isPublicUrl('/api/v1/hero/get-hero-content')).toBe(false);
      });
});

describe('createHttpCache', () => {
      let cache;

      beforeEach(() => {
            cache = createHttpCache({ maxEntries: 10, defaultTtl: 60_000 });
      });

      it('stores and returns payloads until invalidated', () => {
            const seq = cache.captureSeq('hero');
            expect(cache.set('key1', { data: { name: 'Old' }, section: 'hero', seq })).toBe(true);
            expect(cache.get('key1')).toEqual({ name: 'Old' });

            cache.invalidate('hero');
            expect(cache.get('key1')).toBeUndefined();
      });

      it('rejects a response whose request started before an invalidation', () => {
            const seqBeforeMutation = cache.captureSeq('hero');
            cache.invalidate('hero');

            expect(
                  cache.set('key1', { data: { name: 'Stale' }, section: 'hero', seq: seqBeforeMutation }),
            ).toBe(false);
            expect(cache.get('key1')).toBeUndefined();
      });

      it('invalidates only the affected section plus aggregates', () => {
            const heroSeq = cache.captureSeq('hero');
            const skillsSeq = cache.captureSeq('skills');

            cache.set('hero-key', { data: 1, section: 'hero', seq: heroSeq });
            cache.set('skills-key', { data: 2, section: 'skills', seq: skillsSeq });
            cache.set('all-key', { data: 3, section: ALL_SECTIONS, seq: cache.captureSeq(ALL_SECTIONS) });

            cache.invalidate('hero');

            expect(cache.get('hero-key')).toBeUndefined();
            expect(cache.get('all-key')).toBeUndefined();
            expect(cache.get('skills-key')).toEqual(2);
      });

      it('drops pending requests for an invalidated section', () => {
            const seq = cache.captureSeq('contact');
            cache.setPending('pending-key', { promise: Promise.resolve(), section: 'contact', seq });

            expect(cache.getPending('pending-key')).not.toBeNull();
            cache.invalidate('contact');
            expect(cache.getPending('pending-key')).toBeNull();
      });

      it('clear() drops every section', () => {
            cache.set('a', { data: 1, section: 'hero', seq: cache.captureSeq('hero') });
            cache.set('b', { data: 2, section: ALL_SECTIONS, seq: cache.captureSeq(ALL_SECTIONS) });
            cache.clear();
            expect(cache.size).toBe(0);
      });
});
