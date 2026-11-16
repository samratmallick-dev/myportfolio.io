import React, {
  useCallback,
  Suspense,
  lazy,
  useEffect,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import AnimatedText from './animated-text';
import { Button } from '../ui/button';

import {
  Download,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  RefreshCw
} from 'lucide-react';

import ContactMeBtn from './contact-btn';
import OptimizedImage from '../common/OptimizedImage';

import {
  shouldRender3D,
  whenIdle
} from '@/utils/performance';

// Load the 3D scene only when the browser is idle.
const Hero3D = lazy(() => import('./Hero3D'));

// Social media configuration.
const SOCIAL_LINKS = [
  {
    key: 'github',
    href: 'https://github.com/samratmallick-dev',
    label: 'GitHub'
  },
  {
    key: 'linkedin',
    href: 'https://www.linkedin.com/in/samrat-mallick01',
    label: 'LinkedIn'
  },
  {
    key: 'facebook',
    href: 'https://www.facebook.com/samratmallick.dev',
    label: 'Facebook'
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/samratmallick.dev',
    label: 'Instagram'
  }
];

// Resolve social media icons.
const getSocialIcon = (key) => {
  switch (key) {
    case 'github':
      return <Github />;

    case 'linkedin':
      return <Linkedin />;

    case 'facebook':
      return <Facebook />;

    case 'instagram':
      return <Instagram />;

    default:
      return null;
  }
};

const Hero = ({
  heroImage,
  data,
  error,
  onRetry
}) => {
  const navigate = useNavigate();

  const [enable3D, setEnable3D] = useState(false);

  // Navigate to contact section.
  const handleContactClick = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    navigate('/portfolio/contact');
  }, [navigate]);

  // Defer 3D rendering until the main thread is idle.
  useEffect(() => {
    if (!shouldRender3D()) return;

    return whenIdle(() => {
      setEnable3D(true);
    });
  }, []);

  return (
    // Full-screen height only from tablet up. On mobile the section
    // hugs its content, so no empty space is added below the social icons.
    <section className="
      relative
      md:min-h-screen
      flex items-center justify-center
      overflow-hidden
      py-10 sm:py-16
    ">

      {/* Hero Background */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0
          z-0
          dark:opacity-90
          opacity-[0.06]
          pointer-events-none
        "
        style={{
          backgroundImage: heroImage
            ? `url("${heroImage}")`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Deferred 3D Background */}
      {enable3D && (
        <Suspense fallback={null}>
          <Hero3D />
        </Suspense>
      )}

      {/* Background Gradient */}
      <div className="
        absolute inset-0
        hero-gradient
        opacity-5
        z-0
        pointer-events-none
      " />

      {/* Hero Content */}
      <div className="
        container mx-auto
        px-4 sm:px-6
        relative z-10
        text-center
      ">

        <div className="animate-fade-in">

          {/* Profile Image */}
          <div className="
            relative
            shrink-0
            w-56 sm:w-64 md:w-80 lg:w-96
            max-w-full
            mx-auto
            mb-6 sm:mb-8
            mt-2 lg:mt-0
            aspect-square
            rounded-full
            overflow-hidden
            border-[3px] border-primary/20
            shadow-xl
            animate-float
            [&>*]:block [&>*]:h-full [&>*]:w-full
            [&_img]:h-full [&_img]:w-full
            [&_img]:object-cover [&_img]:object-bottom
            [&_img]:origin-bottom [&_img]:scale-[1.12]
          ">
            <OptimizedImage
              src={data?.profileImage?.url}
              alt={`${data?.name || 'Samrat Mallick'} - Full Stack Developer`}
              width="384"
              height="384"
              widths={[224, 256, 320, 384, 448]}
              sizes="
                (min-width: 1024px) 384px,
                (min-width: 768px) 320px,
                (min-width: 640px) 256px,
                224px
              "
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="
                block
                w-full h-full
                rounded-full
                object-cover
              "
            />
          </div>

          {/* Name */}
          <h1 className="
            text-4xl
            sm:text-5xl
            md:text-6xl
            lg:text-7xl
            font-bold
            mb-5 sm:mb-6
            text-gradient
            break-words
          ">
            {data?.name || 'Samrat Mallick'}
          </h1>

          {/* Animated Professional Title */}
          <div className="
            text-xl
            sm:text-2xl
            md:text-3xl
            mb-6
            min-h-12
          ">
            <AnimatedText
              texts={data?.title || []}
              className="text-muted-foreground"
            />
          </div>

          {/* Description */}
          <p className="
            text-base
            sm:text-lg
            md:text-xl
            text-muted-foreground
            max-w-2xl
            mx-auto
            mb-8
            leading-relaxed
            px-2
          ">
            {data?.description ||
              'I am a passionate Full Stack Developer with expertise in building dynamic and responsive web applications. I love turning ideas into reality using code.'}
          </p>

          {/* Action Buttons */}
          <div className="
            flex flex-col
            sm:flex-row
            gap-4
            justify-center
            items-center
          ">

            {/* Resume Download */}
            {data?.resumeLink && (
              <a
                href={data.resumeLink}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="
                    hero-gradient
                    text-on-gradient
                    hover:opacity-90
                    accent-glow
                  "
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Resume
                </Button>
              </a>
            )}

            {/* Contact Button */}
            <ContactMeBtn
              handleNavigateToContact={handleContactClick}
            />

          </div>

          {/* Social Media Links */}
          <div className="
            flex
            justify-center
            items-center
            gap-4
            mt-8
          ">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                aria-label={link.label}
                title={link.label}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-11 h-11
                  flex items-center justify-center
                  bg-primary/10
                  text-foreground
                  rounded-full
                  hover:bg-primary/20
                  hover:scale-110
                  transition-all duration-300
                "
              >
                {getSocialIcon(link.key)}
              </a>
            ))}
          </div>

          {/* Retry Hero Data */}
          {error && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                text-sm
                text-muted-foreground
                hover:text-foreground
                transition-colors
              "
            >
              <RefreshCw className="w-4 h-4" />
              Showing default content. Reload hero
            </button>
          )}

        </div>
      </div>
    </section>
  );
};

export default React.memo(Hero);