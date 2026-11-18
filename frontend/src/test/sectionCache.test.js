import { describe, it, expect, beforeEach } from 'vitest';
import {
      normalizeSection,
      isSection,
      getSectionVersion,
      recordSectionVersion,
      isVersionNewer,
      publishSectionUpdate,
      subscribeSectionUpdates,
      recordServerVersion,
      getRecentServerVersion,
      markLocalMutation,
      getLocalMutationAt,
      __resetSectionCacheForTests,
} from '@/utils/sectionCache';

describe('sectionCache', () => {
      beforeEach(() => {
            __resetSectionCacheForTests();
            window.localStorage.clear();
      });

      it('normalises section aliases used by socket payloads', () => {
            expect(normalizeSection('hero')).toBe('hero');
            expect(normalizeSection('service')).toBe('services');
            expect(normalizeSection('featured')).toBe('projects');
            expect(normalizeSection('newMessage')).toBeNull();
            expect(normalizeSection(undefined)).toBeNull();
      });

      it('stores versions monotonically (older writes are ignored)', () => {
            expect(recordSectionVersion('hero', 1000)).toBe(true);
            expect(recordSectionVersion('hero', 500)).toBe(false);
            expect(getSectionVersion('hero')).toBe(1000);

            expect(recordSectionVersion('hero', 2000)).toBe(true);
            expect(getSectionVersion('hero')).toBe(2000);
            expect(getSectionVersion('unknown-section')).toBe(0);
      });

      it('persists versions to localStorage so other tabs share them', () => {
            recordSectionVersion('about', 4321);
            const raw = JSON.parse(window.localStorage.getItem('portfolio:section-versions'));
            expect(raw.about).toBe(4321);
      });

      it('isVersionNewer requires a strictly greater finite number', () => {
            expect(isVersionNewer(2, 1)).toBe(true);
            expect(isVersionNewer(1, 1)).toBe(false);
            expect(isVersionNewer(NaN, 1)).toBe(false);
            expect(isVersionNewer(1, undefined)).toBe(false);
      });

      it('notifies subscribers when a mutation is published from this tab', () => {
            const received = [];
            const unsubscribe = subscribeSectionUpdates((message, transport) => {
                  received.push({ message, transport });
            });

            expect(publishSectionUpdate({ section: 'skills', version: 5000 })).toBe(true);
            expect(received).toHaveLength(1);
            expect(received[0].message.section).toBe('skills');
            expect(received[0].message.version).toBe(5000);
            expect(getSectionVersion('skills')).toBe(5000);

            unsubscribe();
            publishSectionUpdate({ section: 'skills', version: 6000 });
            expect(received).toHaveLength(1);
      });

      it('never publishes an older version than the one already recorded', () => {
            recordSectionVersion('contact', 9000);
            expect(publishSectionUpdate({ section: 'contact', version: 8000 })).toBe(false);
            expect(publishSectionUpdate({ section: 'contact', version: 9500 })).toBe(true);
      });

      it('correlates server socket versions for mutation notifications', () => {
            expect(getRecentServerVersion('hero', 0)).toBeNull();

            recordServerVersion('hero', 12345);
            expect(getRecentServerVersion('hero', 0)).toBe(12345);
            // A mutation that started before the broadcast cannot reuse it.
            expect(getRecentServerVersion('hero', Date.now() + 10_000)).toBeNull();
      });

      it('tracks local mutations per section', () => {
            expect(getLocalMutationAt('projects')).toBe(0);
            markLocalMutation('projects');
            expect(getLocalMutationAt('projects')).toBeGreaterThan(0);
            expect(getLocalMutationAt('hero')).toBe(0);
      });

      it('ignores invalid sections and versions', () => {
            expect(publishSectionUpdate({ section: 'newMessage', version: 1 })).toBe(false);
            expect(publishSectionUpdate({ section: 'hero', version: NaN })).toBe(false);
            expect(isSection('newMessage')).toBe(false);
            expect(isSection('services')).toBe(true);
      });
});
