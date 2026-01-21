import heroImage from "@/assets/hero-bg.jpg";
import Hero from "@/components/user-view/hero";
import AboutMe from "@/components/user-view/about";
import MySkills from "@/components/user-view/skill";
import MyProjects from "@/components/user-view/projects";
import MyEducation from "@/components/user-view/education";
import MyServices from "@/components/user-view/service";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getPublicInitialData } from "@/store/public.slice";
import HeroSkeleton from "@/components/loaders/HeroSkeleton";

const MyPortfolio = () => {
      const dispatch = useDispatch();
      const { hero, isLoading, isInitialized } = useSelector((state) => state.public);

      useEffect(() => {
            if (!isInitialized) {
                  dispatch(getPublicInitialData());
            }
      }, [dispatch, isInitialized]);

      if (isLoading || !hero) {
            return (
                  <div className="min-h-screen bg-background relative mt-20">
                        <HeroSkeleton />
                        <AboutMe />
                        <MyEducation />
                        <MySkills />
                        <MyProjects />
                        <MyServices />
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-background relative mt-20">
                  <Hero heroImage={heroImage} data={hero} />
                  <AboutMe />
                  <MyEducation />
                  <MySkills />
                  <MyProjects />
                  <MyServices />
            </div>
      );
};

export default MyPortfolio;
