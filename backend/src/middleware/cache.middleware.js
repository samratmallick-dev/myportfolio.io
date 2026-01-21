const cache = new Map();

export const cacheMiddleware = (duration = 300) => {
      return (req, res, next) => {
            if (req.method !== 'GET') {
                  return next();
            }

            const key = req.originalUrl || req.url;
            const cachedResponse = cache.get(key);

            if (cachedResponse && Date.now() < cachedResponse.expiry) {
                  res.set('X-Cache', 'HIT');
                  return res.json(cachedResponse.data);
            }

            res.set('X-Cache', 'MISS');
            const originalJson = res.json.bind(res);
            
            res.json = (data) => {
                  cache.set(key, {
                        data,
                        expiry: Date.now() + duration * 1000
                  });
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
