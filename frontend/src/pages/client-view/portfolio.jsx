import Hero from "@/components/user-view/hero";
import AboutMe from "@/components/user-view/about";
import MySkills from "@/components/user-view/skill";
import MyProjects from "@/components/user-view/projects";
import MyEducation from "@/components/user-view/education";
import MyServices from "@/components/user-view/service";
import HeroSkeleton from "@/components/loaders/HeroSkeleton";
import { usePublicSectionData } from "@/hooks/usePublicSectionData";
import heroImage from "/hero-bg.jpg?url";

const MyPortfolio = () => {
      const { data: hero, status, error, retry } = usePublicSectionData("hero", {
            priority: true,
      });

      const showHeroSkeleton = status === "loading" || (status === "idle" && !hero);

      return (
            <div className="min-h-screen bg-background relative mt-16">
                  {showHeroSkeleton ? (
                        <HeroSkeleton />
                  ) : (
                        <Hero
                              heroImage={heroImage}
                              data={hero || undefined}
                              error={status === "failed" ? error : null}
                              onRetry={retry}
                        />
                  )}
                  <AboutMe />
                  <MyEducation />
                  <MySkills />
                  <MyProjects />
                  <MyServices />
            </div>
      );
};

export default MyPortfolio;
