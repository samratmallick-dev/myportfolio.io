const CLOUDINARY_HOST = 'cloudinary.com';
const UPLOAD_SEGMENT = '/upload/';

// Transformation keys Cloudinary accepts in the first path segment.
const TRANSFORMATION_KEYS = new Set([
      'w', 'h', 'c', 'q', 'f', 'g', 'dpr', 'e', 'ar', 'x', 'y', 'r', 'o',
      'b', 'co', 'du', 'l', 'fl', 'if', 'dl', 'pg', 'so', 'bo', 'z', 'ac',
      'af', 'br', 'cs', 'd', 'dn', 'fn', 'fps', 'gv', 'p', 'q', 't', 'vc',
]);

const isCloudinaryUrl = (url) =>
      typeof url === 'string' && url.includes(CLOUDINARY_HOST) && url.includes(UPLOAD_SEGMENT);

const isTransformationSegment = (segment) => {
      if (!segment || segment.startsWith('v') || segment.includes('.')) return false;
      return segment.split(',').every((part) => {
            const [key] = part.split('_');
            return TRANSFORMATION_KEYS.has(key);
      });
};

const mergeTransformations = (existing, next) => {
      const tokens = new Map();

      const add = (value) => {
            const [key] = value.split('_');
            tokens.set(key, value);
      };

      if (existing) existing.split(',').filter(Boolean).forEach(add);
      next.split(',').filter(Boolean).forEach(add);

      return Array.from(tokens.values()).join(',');
};

const buildTransformation = ({ width, height, quality, format, crop, gravity, dpr }) => {
      const parts = [];

      if (width && width !== 'auto') parts.push(`w_${Math.round(Number(width))}`);
      if (height && height !== 'auto') parts.push(`h_${Math.round(Number(height))}`);
      if (crop) parts.push(`c_${crop}`);
      if (gravity) parts.push(`g_${gravity}`);
      if (quality) parts.push(`q_${quality}`);
      if (format) parts.push(`f_${format}`);
      if (dpr) parts.push(`dpr_${dpr}`);

      return parts.join(',');
};

/**
 * Adds Cloudinary delivery transformations to an existing URL.
 * URLs that are not hosted on Cloudinary pass through unchanged.
 */
export const getOptimizedImageUrl = (url, options = {}) => {
      if (!isCloudinaryUrl(url)) return url;

      const {
            width = 'auto',
            height,
            quality = 'auto',
            format = 'auto',
            crop = 'fill',
            gravity = 'auto',
            dpr,
      } = options;

      const transformation = buildTransformation({
            width,
            height,
            quality,
            format,
            crop,
            gravity,
            dpr,
      });

      if (!transformation) return url;

      const [prefix, ...rest] = url.split(UPLOAD_SEGMENT);
      const segments = rest.join(UPLOAD_SEGMENT).split('/');
      const hasTransformation = isTransformationSegment(segments[0]);
      const existing = hasTransformation ? segments.shift() : '';
      const merged = mergeTransformations(existing, transformation);

      return `${prefix}${UPLOAD_SEGMENT}${merged}/${segments.join('/')}`;
};

export const getResponsiveSrcSet = (url, widths = [320, 640, 960, 1280], options = {}) => {
      if (!isCloudinaryUrl(url)) return '';

      return widths
            .map((width) => `${getOptimizedImageUrl(url, { ...options, width, quality: 'auto', format: 'auto' })} ${width}w`)
            .join(', ');
};

export const preloadImage = (url, { as = 'image', fetchPriority = 'high' } = {}) => {
      if (!url || typeof document === 'undefined') return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = as;
      link.href = url;
      link.fetchPriority = fetchPriority;
      document.head.appendChild(link);
};
