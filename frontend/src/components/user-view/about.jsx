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
        container mx-auto px-4
        flex flex-col lg:flex-row
        items-center justify-center
        gap-10 lg:gap-16
      ">

        {/* Profile Image */}
        <div className="
          w-full lg:w-[38%]
          flex items-center justify-center
          shrink-0
        ">
          <div className="
            relative
            w-56 h-56
            sm:w-64 sm:h-64
            md:w-80 md:h-80
            lg:w-96 lg:h-96
            aspect-square
            overflow-hidden
            rounded-full
            border-4 border-primary/20
            ring-4 ring-primary/5
            shadow-2xl
          ">
            <OptimizedImage
              src={about?.aboutImage?.url}
              alt="Samrat Mallick - Full Stack Developer"
              width="384"
              height="384"
              widths={[224, 256, 320, 384, 448]}
              sizes="
                (min-width: 1024px) 384px,
                (min-width: 768px) 320px,
                (min-width: 640px) 256px,
                224px
              "
              loading="lazy"
              decoding="async"
              className="
                block
                w-full h-full
                rounded-full
                object-cover object-center
              "
            />
          </div>
        </div>

        {/* About Information */}
        <div className="
          w-full lg:w-[62%]
          flex flex-col
          items-center lg:items-start
          text-center lg:text-left
        ">

          <h2 className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-bold
            mb-6
            text-gradient
            animate-slide-up
          ">
            About Me
          </h2>

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
        py-16 sm:py-20 lg:py-24
        border-b border-border
        overflow-hidden
      "
    >
      {content}
    </section>
  );
};

export default React.memo(AboutMe);