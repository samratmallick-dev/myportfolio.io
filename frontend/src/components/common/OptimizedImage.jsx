import React from 'react';
import { getOptimizedImageUrl } from '@/utils/imageOptimization';

const OptimizedImage = ({ 
      src, 
      alt, 
      width, 
      height, 
      className = '', 
      loading = 'lazy',
      quality = 'auto',
      ...props 
}) => {
      const optimizedSrc = getOptimizedImageUrl(src, { 
            width: width || 'auto', 
            quality,
            format: 'auto'
      });

      return (
            <img
                  src={optimizedSrc}
                  alt={alt}
                  width={width}
                  height={height}
                  loading={loading}
                  className={className}
                  {...props}
            />
      );
};

export default OptimizedImage;
