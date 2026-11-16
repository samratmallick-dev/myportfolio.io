import React, { useCallback, Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedText from './animated-text';
import { Button } from '../ui/button';
import { Download, Github, Linkedin, Facebook, Instagram, RefreshCw } from 'lucide-react';
import ContactMeBtn from './contact-btn';
import OptimizedImage from '../common/OptimizedImage';
import { shouldRender3D, whenIdle } from '@/utils/performance';

// The 3D scene is loaded only after the page is interactive.
const Hero3D = lazy(() => import('./Hero3D'));

const SOCIAL_LINKS = [
      { key: "github", href: "https://github.com/samratmallick-dev" },
      { key: "linkedin", href: "https://www.linkedin.com/in/samrat-mallick01" },
      { key: "facebook", href: "https://www.facebook.com/samratmallick.dev" },
      { key: "instagram", href: "https://www.instagram.com/samratmallick.dev" },
];

const getSocialIcon = (key) => {
      switch (key) {
            case "github": return <Github />;
            case "linkedin": return <Linkedin />;
            case "facebook": return <Facebook />;
            case "instagram": return <Instagram />;
            default: return null;
      }
};

const Hero = ({ heroImage, data, error, onRetry }) => {
      const navigate = useNavigate();
      const [enable3D, setEnable3D] = useState(false);

      const handleContactClick = useCallback(() => {
            window.scrollTo(0, 0);
            navigate('/portfolio/contact');
      }, [navigate]);

      // Defer the WebGL canvas until the main thread is idle and only on
      // devices that can afford it. Reduced-motion users keep the static hero.
      useEffect(() => {
            if (!shouldRender3D()) return;
            return whenIdle(() => setEnable3D(true));
      }, []);

      return (
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-4">
                  <div
                        className="absolute inset-0 z-0 dark:opacity-90 opacity-[0.06]"
                        style={{
                              backgroundImage: `url(${heroImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center"
                        }}
                  />

                  {enable3D && (
                        <Suspense fallback={null}>
                              <Hero3D />
                        </Suspense>
                  )}

                  <div className="absolute inset-0 hero-gradient opacity-5 z-0" />

                  <div className="container mx-auto px-4 z-10 text-center">
                        <div className="animate-fade-in">
                              <OptimizedImage
                                    src={data?.profileImage?.url}
                                    alt={data?.name || "Profile"}
                                    width="240"
                                    height="240"
                                    widths={[200, 240, 320, 400]}
                                    sizes="240px"
                                    loading="eager"
                                    fetchPriority="high"
                                    decoding="async"
                                    className="w-60 h-60 md:object-contain object-cover object-center rounded-full mx-auto mb-8 lg:mt-0 mt-6 border-4 border-primary/20 animate-float"
                              />
                              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
                                    {data?.name || "Samrat Mallick"}
                              </h1>
                              <div className="text-2xl md:text-3xl mb-6 h-12">
                                    <AnimatedText texts={data?.title || []} className="text-muted-foreground" />
                              </div>
                              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                                    {data?.description || "I am a passionate Full Stack Developer with expertise in building dynamic and responsive web applications. I love turning ideas into reality using code."}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <a
                                          href={data?.resumeLink}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                    >
                                          <Button size="lg" className="hero-gradient text-on-gradient hover:opacity-90 accent-glow">
                                                <Download className="w-5 h-5 mr-2" />
                                                Download Resume
                                          </Button>
                                    </a>
                                    <ContactMeBtn handleNavigateToContact={handleContactClick} />
                              </div>
                              <div className="flex justify-center gap-4 mt-8">
                                    {SOCIAL_LINKS.map((link) => (
                                          <a
                                                key={link.key}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                                          >
                                                {getSocialIcon(link.key)}
                                          </a>
                                    ))}
                              </div>
                              {error && onRetry && (
                                    <button
                                          type="button"
                                          onClick={onRetry}
                                          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                          <RefreshCw className="h-4 w-4" />
                                          Showing default content. Reload hero
                                    </button>
                              )}
                        </div>
                  </div>
            </section>
      );
}

export default React.memo(Hero);
