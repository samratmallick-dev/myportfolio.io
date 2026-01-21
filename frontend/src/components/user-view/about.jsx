import React from 'react';
import { useSelector } from 'react-redux';
import AboutSkeleton from '../loaders/AboutSkeleton';

const AboutMe = () => {
      const { about, isLoading } = useSelector((state) => state.public);

      if (isLoading || !about) {
            return <AboutSkeleton />;
      }

      return (
            <section id="about" className="py-20 border-b border-gray-700 ">
                  <div className="container mx-auto px-4 flex gap-10 lg:flex-row flex-col items-center">
                        <div className='md:basis-[35%] basis-full mx-auto flex items-center justify-center'>
                              <img
                                    src={about?.aboutImage?.url}
                                    alt="About Me"
                                    loading="lazy"
                                    className="md:w-96 md:h-96 w-56 h-56 object-center  rounded-full shadow-lg border-4 border-primary/10"
                              />
                        </div>
                        <div className="md:basis-[60%] basis-full mx-auto text-center">
                              <h2 className="text-4xl text-center font-bold mb-8 text-gradient animate-slide-up">About Me</h2>
                              <div className="prose prose-lg mx-auto text-muted-foreground leading-relaxed animate-slide-up flex flex-col items-center gap-6">
                                    <p className='text-justify'>{about?.paragraphs}</p>
                              </div>
                        </div>
                  </div>
            </section>
      );
}

export default AboutMe;
