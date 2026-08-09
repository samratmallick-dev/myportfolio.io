import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProjectCard = ({
      title,
      image,
      githubUrl,
      liveUrl,
      slug,
}) => {
      const hasLive =
            typeof liveUrl === "string" &&
            liveUrl.trim() !== "" &&
            liveUrl.trim() !== "#";

      const hasGithub =
            typeof githubUrl === "string" &&
            githubUrl.trim() !== "" &&
            githubUrl.trim() !== "#";

      const imageUrl = image?.url || null;

      return (
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  {/* Project Image */}
                  <div className="relative w-full h-52 overflow-hidden bg-gradient-to-br from-primary/10 to-purple-900/10 flex-shrink-0">
                        {imageUrl ? (
                              <img
                                    src={imageUrl}
                                    alt={title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                        ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-5xl font-bold text-white/10 select-none">
                                          {title?.charAt(0)?.toUpperCase() || "P"}
                                    </span>
                              </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 gap-4">
                        <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-primary transition-colors duration-300">
                              {title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-auto">
                              {slug && (
                                    <Link to={`/projects/${slug}`} className="flex-1">
                                          <Button
                                                size="sm"
                                                className="w-full bg-primary/20 text-white border border-primary/40 hover:bg-primary hover:border-primary transition-all duration-300 group/btn"
                                          >
                                                View Details
                                                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                          </Button>
                                    </Link>
                              )}
                              {hasLive ? (
                                    <Link to={liveUrl} target="_blank" rel="noopener noreferrer">
                                          <Button
                                                size="sm"
                                                className="hero-gradient text-white font-medium hover:opacity-90 border-none transition-all duration-300"
                                          >
                                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                                Live
                                          </Button>
                                    </Link>
                              ) : hasGithub ? (
                                    <Link to={githubUrl} target="_blank" rel="noopener noreferrer">
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                                          >
                                                <Github className="w-3.5 h-3.5 mr-1.5" />
                                                Code
                                          </Button>
                                    </Link>
                              ) : null}
                        </div>
                  </div>
            </div>
      );
};

export default React.memo(ProjectCard);