import ProjectCard from "@/components/user-view/project-card";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProjectsSkeleton from "@/components/loaders/ProjectsSkeleton";
import { getAllProjects } from "@/store/project.slice";
import { useSocket } from "@/hooks/useSocket";

const MyAllProjectList = () => {
      const dispatch = useDispatch();
      const { projectsData, isLoading } = useSelector((state) => state.project);

      useEffect(() => {
            dispatch(getAllProjects());
      }, [dispatch]);

      useSocket("portfolioUpdated", ({ type, data }) => {
            if (type === "projects" && data?.all) {
                  dispatch({ type: "project/setProjects", payload: data.all });
            }
      });

      return (
            <div className="relative mt-20">
                  <div className="container mx-auto px-4 py-8">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
                              My All Projects
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-fr items-stretch">
                              {isLoading ? (
                                    <ProjectsSkeleton />
                              ) : projectsData && projectsData.length > 0 ? (
                                    projectsData.map((project, index) => (
                                          <ProjectCard key={project._id || index} {...project} />
                                    ))
                              ) : (
                                    <div className="col-span-full text-center text-muted-foreground">
                                          No projects found.
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
};

export default MyAllProjectList;