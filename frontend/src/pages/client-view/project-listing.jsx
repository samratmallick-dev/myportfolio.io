import ProjectCard from "@/components/user-view/project-card";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProjectsSkeleton from "@/components/loaders/ProjectsSkeleton";
import SectionError from "@/components/loaders/SectionError";
import { getPublicProjectsPage } from "@/store/project.slice";
import { updatePublicData } from "@/store/public.slice";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      const { items, pagination, status, error } = useSelector((state) => state.project.publicProjects);

      const page = pagination.page || 1;
      const limit = pagination.limit || 9;
      const isLoading = status === "loading";
      const isInitialLoading = (isLoading || status === "idle") && items.length === 0;

      useEffect(() => {
            dispatch(getPublicProjectsPage({ page, limit }));
      }, [dispatch, page, limit]);

      useSocket("portfolioUpdated", ({ type, data }) => {
            if (type !== "projects") return;
            if (data) dispatch(updatePublicData({ type: "projects", data }));
            dispatch(getPublicProjectsPage({ page, limit, force: true }));
      });

      const goToPage = (nextPage) => {
            if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === page) return;
            dispatch(getPublicProjectsPage({ page: nextPage, limit }));
            window.scrollTo({ top: 0, behavior: "smooth" });
      };

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

                        {isInitialLoading ? (
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-fr items-stretch">
                                    <ProjectsSkeleton />
                              </div>
                        ) : status === "failed" && items.length === 0 ? (
                              <SectionError
                                    message={typeof error === "string" ? error : "Unable to load projects."}
                                    onRetry={() => dispatch(getPublicProjectsPage({ page, limit, force: true }))}
                              />
                        ) : items.length > 0 ? (
                              <>
                                    <motion.div
                                          variants={containerVariants}
                                          initial="hidden"
                                          animate="visible"
                                          className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-fr items-stretch transition-opacity duration-200 ${isLoading ? "opacity-60" : "opacity-100"}`}
                                    >
                                          {items.map((project, index) => (
                                                <motion.div key={project._id || index} variants={itemVariants}>
                                                      <ProjectCard {...project} />
                                                </motion.div>
                                          ))}
                                    </motion.div>

                                    {pagination.totalPages > 1 && (
                                          <div className="flex items-center justify-center gap-4 mt-12">
                                                <Button
                                                      variant="outline"
                                                      size="sm"
                                                      disabled={!pagination.hasPrev || isLoading}
                                                      onClick={() => goToPage(page - 1)}
                                                >
                                                      <ChevronLeft className="w-4 h-4 mr-1" />
                                                      Previous
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                      Page {page} of {pagination.totalPages}
                                                </span>
                                                <Button
                                                      variant="outline"
                                                      size="sm"
                                                      disabled={!pagination.hasNext || isLoading}
                                                      onClick={() => goToPage(page + 1)}
                                                >
                                                      Next
                                                      <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                          </div>
                                    )}
                              </>
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
