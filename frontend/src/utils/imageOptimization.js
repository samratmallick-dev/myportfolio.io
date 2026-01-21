export const getOptimizedImageUrl = (url, options = {}) => {
      if (!url || !url.includes('cloudinary.com')) return url;

      const {
            width = 'auto',
            quality = 'auto',
            format = 'auto',
            crop = 'fill',
            gravity = 'auto',
      } = options;

      const transformations = `w_${width},q_${quality},f_${format},c_${crop},g_${gravity}`;

      return url.replace('/upload/', `/upload/${transformations}/`);
};

export const getResponsiveSrcSet = (url, widths = [320, 640, 960, 1280]) => {
      if (!url || !url.includes('cloudinary.com')) return '';

      return widths
            .map(width => `${getOptimizedImageUrl(url, { width, quality: 'auto', format: 'auto' })} ${width}w`)
            .join(', ');
};

export const preloadImage = (url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
};
