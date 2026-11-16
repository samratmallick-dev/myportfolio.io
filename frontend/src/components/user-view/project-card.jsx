import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/common/OptimizedImage";

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
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative w-full h-52 overflow-hidden bg-gradient-to-br from-primary/10 to-brand/10 flex-shrink-0">
                        {imageUrl ? (
                              <OptimizedImage
                                    src={imageUrl}
                                    alt={title}
                                    width="800"
                                    height="520"
                                    widths={[400, 600, 800, 1000]}
                                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                        ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-5xl font-bold text-foreground/10 select-none">
                                          {title?.charAt(0)?.toUpperCase() || "P"}
                                    </span>
                              </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5 gap-4">
                        <h3 className="text-lg font-semibold text-card-foreground leading-snug group-hover:text-primary transition-colors duration-300">
                              {title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-auto">
                              {slug && (
                                    <Link to={`/projects/${slug}`} className="flex-1">
                                          <Button
                                                size="sm"
                                                className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group/btn"
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
                                                className="hero-gradient text-on-gradient font-medium hover:opacity-90 border-none transition-all duration-300"
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