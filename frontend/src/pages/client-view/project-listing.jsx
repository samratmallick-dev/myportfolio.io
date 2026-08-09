import ProjectCard from "@/components/user-view/project-card";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProjectsSkeleton from "@/components/loaders/ProjectsSkeleton";
import { getAllProjects } from "@/store/project.slice";
import { useSocket } from "@/hooks/useSocket";
import { motion } from "framer-motion";

const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
            opacity: 1,
            transition: {
                  staggerChildren: 0.1
            }
      }
};

const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

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
                        <motion.h2 
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                              className="text-4xl font-bold text-center mb-12 text-gradient"
                        >
                              My All Projects
                        </motion.h2>

                        {isLoading ? (
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-fr items-stretch">
                                    <ProjectsSkeleton />
                              </div>
                        ) : projectsData && projectsData.length > 0 ? (
                              <motion.div 
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-fr items-stretch"
                              >
                                    {projectsData.map((project, index) => (
                                          <motion.div key={project._id || index} variants={itemVariants}>
                                                <ProjectCard {...project} />
                                          </motion.div>
                                    ))}
                              </motion.div>
                        ) : (
                              <div className="text-center text-muted-foreground">
                                    No projects found.
                              </div>
                        )}
                  </div>
            </div>
      );
};

export default MyAllProjectList;