import test from 'node:test';
import assert from 'node:assert/strict';
import {
      parsePagination,
      buildPaginationMeta,
      DEFAULT_LIMIT,
      MAX_LIMIT,
} from '../src/utilities/pagination.util.js';

test('parsePagination returns safe defaults', () => {
      assert.deepEqual(parsePagination({}), { page: 1, limit: DEFAULT_LIMIT, skip: 0 });
      assert.deepEqual(parsePagination({ page: 'abc', limit: 'xyz' }), { page: 1, limit: DEFAULT_LIMIT, skip: 0 });
});

test('parsePagination clamps invalid and oversized values', () => {
      assert.deepEqual(parsePagination({ page: '-4', limit: '-2' }), { page: 1, limit: DEFAULT_LIMIT, skip: 0 });
      assert.deepEqual(parsePagination({ page: '2', limit: '999' }), { page: 2, limit: MAX_LIMIT, skip: MAX_LIMIT });
});

test('parsePagination computes skip from page and limit', () => {
      assert.deepEqual(parsePagination({ page: '3', limit: '6' }), { page: 3, limit: 6, skip: 12 });
});

test('buildPaginationMeta reports boundaries correctly', () => {
      assert.deepEqual(buildPaginationMeta({ page: 1, limit: 6, total: 14 }), {
            page: 1,
            limit: 6,
            total: 14,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
      });

      assert.deepEqual(buildPaginationMeta({ page: 3, limit: 6, total: 14 }), {
            page: 3,
            limit: 6,
            total: 14,
            totalPages: 3,
            hasNext: false,
            hasPrev: true,
      });
});

test('buildPaginationMeta handles empty results', () => {
      assert.deepEqual(buildPaginationMeta({ page: 1, limit: 8, total: 0 }), {
            page: 1,
            limit: 8,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
      });
});
