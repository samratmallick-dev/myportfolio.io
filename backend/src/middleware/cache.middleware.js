const cache = new Map();
const MAX_CACHE_ENTRIES = 250;

const pruneCache = () => {
      const now = Date.now();

      for (const [key, value] of cache) {
            if (now >= value.expiry) cache.delete(key);
      }

      // Map preserves insertion order, so this evicts the oldest entries first.
      while (cache.size > MAX_CACHE_ENTRIES) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
      }
};

export const cacheMiddleware = (duration = 300) => {
      return (req, res, next) => {
            if (req.method !== 'GET') {
                  return next();
            }

            const key = req.originalUrl || req.url;
            const cachedResponse = cache.get(key);

            // Browser/CDN caches can revalidate cheaply; server cache is the
            // shared fallback for the single-instance deployment.
            res.set('Cache-Control', `public, max-age=${duration}, s-maxage=${duration}, stale-while-revalidate=60`);
            res.set('Vary', 'Accept-Encoding');

            if (cachedResponse && Date.now() < cachedResponse.expiry) {
                  res.set('X-Cache', 'HIT');
                  return res.json(cachedResponse.data);
            }

            if (cachedResponse) cache.delete(key);

            res.set('X-Cache', 'MISS');
            const originalJson = res.json.bind(res);

            res.json = (data) => {
                  // Never cache error payloads: a transient 404/500 must not
                  // stick around after the underlying data is fixed.
                  if (res.statusCode >= 200 && res.statusCode < 400) {
                        cache.set(key, {
                              data,
                              expiry: Date.now() + duration * 1000,
                        });
                        pruneCache();
                  }
                  return originalJson(data);
            };

            next();
      };
};

export const clearCache = (pattern) => {
      if (pattern) {
            for (const key of cache.keys()) {
                  if (key.includes(pattern)) {
                        cache.delete(key);
                  }
            }
      } else {
            cache.clear();
      }
};

/**
 * Pattern groups for targeted invalidation. The aggregate /initial-data
 * endpoint depends on every section, so it is always invalidated too.
 */
export const PUBLIC_CACHE_PATTERNS = {
      hero: ['/api/v1/public/hero', '/api/v1/hero'],
      about: ['/api/v1/public/about', '/api/v1/about'],
      education: ['/api/v1/public/education', '/api/v1/education'],
      skills: ['/api/v1/public/skills', '/api/v1/skills'],
      projects: ['/api/v1/public/featured-projects', '/api/v1/public/projects', '/api/v1/projects'],
      services: ['/api/v1/public/services', '/api/v1/services'],
      contact: ['/api/v1/public/contact', '/api/v1/contact'],
};

export const invalidatePublicSection = (section) => {
      const patterns = PUBLIC_CACHE_PATTERNS[section] || [];
      patterns.forEach((pattern) => clearCache(pattern));
      clearCache('/api/v1/public/initial-data');
};

const PUBLIC_CONTENT_ROUTE = /^\/api\/v1\/(hero|about|education|skills|projects|services|contact)\//;

// These endpoints change messages/read state only — public content is intact.
const NON_CONTENT_PATHS = /^\/api\/v1\/contact\/(send-message|mark-as-read|delete-message|get-message|get-all-messages|get-unread-count)/;

/**
 * Called after a successful mutation. Invalidates the caches for the
 * affected public section instead of flushing every cached response.
 */
export const invalidateCacheForMutation = (originalUrl = '') => {
      const path = (originalUrl.split('?')[0] || '').toLowerCase();

      if (NON_CONTENT_PATHS.test(path)) return;

      const sections = [];
      if (/\/hero\//.test(path)) sections.push('hero');
      if (/\/about\//.test(path)) sections.push('about');
      if (/\/education\//.test(path)) sections.push('education');
      if (/\/skills\//.test(path)) sections.push('skills');
      if (/\/projects\//.test(path)) sections.push('projects');
      if (/\/services\//.test(path)) sections.push('services');
      if (/\/contact\//.test(path)) sections.push('contact');

      if (sections.length > 0) {
            sections.forEach(invalidatePublicSection);
            return;
      }

      // Unknown content mutation: still drop public payloads, but leave
      // unrelated admin caches untouched.
      if (PUBLIC_CONTENT_ROUTE.test(path)) {
            clearCache('/api/v1/public');
      }
};

// Exposed for tests and operational diagnostics.
export const getCacheSize = () => cache.size;
