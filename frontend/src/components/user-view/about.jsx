import React from 'react';
import AboutSkeleton from '../loaders/AboutSkeleton';
import SectionError from '../loaders/SectionError';
import OptimizedImage from '../common/OptimizedImage';
import { useLazySection } from '@/hooks/useLazySection';

const AboutMe = () => {
  const {
    ref,
    data: about,
    isLoading,
    isError,
    error,
    retry
  } = useLazySection('about');

  let content;

  // Loading state
  if (isLoading || (!about && !isError)) {
    content = <AboutSkeleton />;
  }

  // Error state
  else if (isError) {
    content = (
      <SectionError
        message={error || 'Unable to load the About section.'}
        onRetry={retry}
      />
    );
  }

  // Empty state
  else if (!about) {
    content = (
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        About content is currently unavailable.
      </div>
    );
  }

  // Main content
  else {
    content = (
      <div className="
        container mx-auto
        w-full max-w-7xl
        px-4 sm:px-6 lg:px-8
        flex flex-col lg:flex-row
        items-center
        justify-center
        gap-8 sm:gap-10 lg:gap-14
      ">

        {/* Profile Image */}
<div className="
  flex justify-center
  w-full lg:w-auto
  lg:flex-[0_0_35%]
  shrink-0
">
  <div className="
    relative shrink-0
    w-56 sm:w-64 md:w-80 lg:w-96
    max-w-full
    aspect-square
    overflow-hidden
    rounded-full
    border-[3px] border-primary/20
    shadow-xl
    [&>*]:h-full [&>*]:w-full
    [&_img]:h-full [&_img]:w-full
    [&_img]:object-cover [&_img]:object-center
  ">
    <OptimizedImage
      src={about?.aboutImage?.url}
      alt="Portrait of Samrat Mallick - Full Stack Developer"
      width={384}
      height={384}
      widths={[224, 256, 320, 384, 448]}
      sizes="
        (min-width: 1024px) 384px,
        (min-width: 768px) 320px,
        (min-width: 640px) 256px,
        224px
      "
      loading="lazy"
      decoding="async"
      className="block h-full w-full rounded-full object-cover object-center"
    />
  </div>
</div>
        
        {/* About Information */}
        <div className="
          w-full
          min-w-0
          lg:flex-1
          flex flex-col
          items-center lg:items-start
          text-center lg:text-left
        ">

          {/* Section Heading */}
          <h2 className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-bold
            mb-4 sm:mb-5
            text-gradient
            animate-slide-up
          ">
            About Me
          </h2>

          {/* About Description */}
          <div className="
            w-full max-w-3xl
            text-base sm:text-lg md:text-xl
            text-muted-foreground
            leading-7 sm:leading-8
            animate-slide-up
          ">
            <p className="
              text-left
              whitespace-pre-line
              break-words
              [overflow-wrap:anywhere]
            ">
              {about?.paragraphs}
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <section
      ref={ref}
      id="about"
      className="
        relative
        w-full
        py-10 sm:py-14 lg:py-20
        border-b border-border
        overflow-hidden
        scroll-mt-20
      "
    >
      {content}
    </section>
  );
};

export default React.memo(AboutMe);