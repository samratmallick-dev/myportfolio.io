import React from 'react';
import AboutSkeleton from '../loaders/AboutSkeleton';
import SectionError from '../loaders/SectionError';
import OptimizedImage from '../common/OptimizedImage';
import { useLazySection } from '@/hooks/useLazySection';

const AboutMe = () => {
      const { ref, data: about, isLoading, isError, error, retry } = useLazySection('about');

      let content;
      if (isLoading || (!about && !isError)) {
            content = <AboutSkeleton />;
      } else if (isError) {
            content = <SectionError message={error || 'Unable to load the about section.'} onRetry={retry} />;
      } else if (!about) {
            content = (
                  <div className="container mx-auto px-4 text-center text-muted-foreground">
                        About content is not available yet.
                  </div>
            );
      } else {
            content = (
                  <div className="container mx-auto px-4 flex gap-10 lg:flex-row flex-col items-center">
                        <div className='md:basis-[35%] basis-full mx-auto flex items-center justify-center'>
                              <OptimizedImage
                                    src={about?.aboutImage?.url}
                                    alt="Portrait of Samrat Mallick - About Me"
                                    width="384"
                                    height="384"
                                    widths={[224, 320, 384, 448]}
                                    sizes="(min-width: 768px) 384px, 224px"
                                    loading="lazy"
                                    className="md:w-96 md:h-96 w-56 h-56 object-center rounded-full shadow-lg border-4 border-primary/10"
                              />
                        </div>
                        <div className="md:basis-[60%] basis-full mx-auto text-center">
                              <h2 className="text-4xl text-center font-bold mb-8 text-gradient animate-slide-up">About Me</h2>
                              <div className="prose prose-lg mx-auto text-muted-foreground leading-relaxed animate-slide-up flex flex-col items-center gap-6">
                                    <p className='text-justify'>{about?.paragraphs}</p>
                              </div>
                        </div>
                  </div>
            );
      }

      return (
            <section ref={ref} id="about" className="py-20 border-b border-border ">
                  {content}
            </section>
      );
}

export default React.memo(AboutMe);
