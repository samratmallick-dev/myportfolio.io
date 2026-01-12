import heroImage from "@/assets/hero-bg.jpg";
import Hero from "@/components/user-view/hero";
import AboutMe from "@/components/user-view/about";
import MySkills from "@/components/user-view/skill";
import MyProjects from "@/components/user-view/projects";
import MyEducation from "@/components/user-view/education";
import MyServices from "@/components/user-view/service";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getHeroData } from "@/store/hero.slice";
import { getAboutData } from "@/store/about.slice";
import { getAllEducationData } from "@/store/education.slice";
import HeroSkeleton from "@/components/loaders/HeroSkeleton";

const MyPortfolio = () => {

      const dispatch = useDispatch();
      const { heroData, isLoading: heroLoading } = useSelector((state) => state.hero);

      useEffect(() => {
            dispatch(getHeroData());
      }, [dispatch]);

      const currentHeroData = heroData;
      const isLoading = heroLoading;

      if (isLoading || !currentHeroData) {
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
                  <Hero heroImage={heroImage} data={currentHeroData} />
                  <AboutMe />
                  <MyEducation />
                  <MySkills />
                  <MyProjects />
                  <MyServices />
            </div>
      );
};

export default MyPortfolio;
