import React from "react";
import ProjectCard from "./project-card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import ProjectsSkeleton from "../loaders/ProjectsSkeleton";
import SectionError from "../loaders/SectionError";
import { useLazySection } from "@/hooks/useLazySection";

const MyProjects = () => {
      const navigate = useNavigate();
      const { ref, data: projects, status, isLoading, isError, error, retry } = useLazySection('projects');

      const featuredProjects = Array.isArray(projects) ? projects : [];
      const showSkeleton = isLoading || status === 'idle';

      const goToProjectListingPage = () => {
            window.scrollTo(0, 0);
            navigate("/projects");
      };

      return (
            <section ref={ref} id="projects" className="py-20 border-b border-border">
                  <div className="container mx-auto px-4 flex flex-col items-center gap-4">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
                              Featured Projects
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full mx-auto auto-rows-fr items-stretch">
                              {showSkeleton ? (
                                    <ProjectsSkeleton />
                              ) : isError ? (
                                    <SectionError className="col-span-full" message={error || 'Unable to load featured projects.'} onRetry={retry} />
                              ) : featuredProjects.length > 0 ? (
                                    featuredProjects.map((project, index) => (
                                          <ProjectCard key={project._id || index} {...project} />
                                    ))
                              ) : (
                                    <div className="col-span-full text-center text-muted-foreground">
                                          No featured projects yet.
                                    </div>
                              )}
                        </div>

                        <Button
                              onClick={goToProjectListingPage}
                              size="lg"
                              className="mt-8 hero-gradient text-on-gradient hover:opacity-90 accent-glow"
                        >
                              View All Projects
                        </Button>
                  </div>
            </section>
      );
};

export default React.memo(MyProjects);
