import React, { useEffect, useState } from 'react';
import { getOptimizedImageUrl, getResponsiveSrcSet } from '@/utils/imageOptimization';

/**
 * Responsive, Cloudinary-aware image.
 *
 * - Generates `srcset`/`sizes` for Cloudinary assets.
 * - Adds intrinsic `width`/`height` to avoid layout shift when provided.
 * - Falls back to `fallbackSrc` (or hides the image) if loading fails.
 */
const OptimizedImage = ({
      src,
      alt = '',
      width,
      height,
      sizes,
      widths,
      srcSet,
      className = '',
      loading = 'lazy',
      decoding = 'async',
      quality = 'auto',
      fallbackSrc,
      onError,
      ...props
}) => {
      const [failed, setFailed] = useState(false);

      useEffect(() => {
            setFailed(false);
      }, [src]);

      if (!src && !fallbackSrc) return null;

      const optimizedSrc = getOptimizedImageUrl(src || fallbackSrc, {
            width: width || 'auto',
            height,
            quality,
            format: 'auto',
      });

      const generatedSrcSet = !failed && !srcSet && widths?.length
            ? getResponsiveSrcSet(src, widths, { height, quality })
            : srcSet;

      const activeSrc = failed ? getOptimizedImageUrl(fallbackSrc, { width: width || 'auto', quality, format: 'auto' }) : optimizedSrc;

      if (!activeSrc) return null;

      return (
            <img
                  src={activeSrc}
                  srcSet={failed ? undefined : generatedSrcSet || undefined}
                  sizes={failed ? undefined : (generatedSrcSet ? sizes : undefined)}
                  alt={alt}
                  width={width}
                  height={height}
                  loading={loading}
                  decoding={decoding}
                  className={className}
                  onError={(event) => {
                        onError?.(event);
                        if (fallbackSrc && !failed) {
                              setFailed(true);
                        } else {
                              event.currentTarget.style.visibility = 'hidden';
                        }
                  }}
                  {...props}
            />
      );
};

export default React.memo(OptimizedImage);
