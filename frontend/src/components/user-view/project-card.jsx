import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";
import { Link } from "react-router-dom";

const statusStyles = {
      Completed: "bg-green-500/10 text-green-500 border-green-500/30",
      "In Progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      Planned: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const ProjectCard = ({
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      status,
}) => {
      const techArray = Array.isArray(technologies)
            ? technologies.filter((t) => {
                  if (typeof t !== "string") return false;
                  const trimmed = t.trim();
                  return (
                        trimmed !== "" &&
                        !trimmed.startsWith("http") &&
                        !trimmed.startsWith("www.") &&
                        !trimmed.includes("github.com")
                  );
            })
            : [];

      const hasGithub =
            typeof githubUrl === "string" &&
            githubUrl.trim() !== "" &&
            githubUrl.trim() !== "#";

      const hasLive =
            typeof liveUrl === "string" &&
            liveUrl.trim() !== "" &&
            liveUrl.trim() !== "#";

      return (
            <Card className="hover-lift tech-glow group flex flex-col h-full">
                  <CardContent className="flex flex-col flex-1 p-6">

                        <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                              <h3 className="text-xl font-semibold group-hover:text-gradient transition-all duration-300 leading-snug">
                                    {title}
                              </h3>
                              {status && (
                                    <Badge
                                          variant="outline"
                                          className={statusStyles[status] ?? statusStyles["In Progress"]}
                                    >
                                          {status}
                                    </Badge>
                              )}
                        </div>

                        <p className="text-muted-foreground leading-relaxed line-clamp-4 flex-1 mb-4">
                              {description}
                        </p>

                        {techArray.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                    {techArray.map((tech, index) => (
                                          <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-primary/10 text-primary border-primary/20"
                                          >
                                                {tech}
                                          </Badge>
                                    ))}
                              </div>
                        )}

                        {(hasGithub || hasLive) && (
                              <div className="border-t border-white/10 mb-4" />
                        )}

                        <div className="flex flex-wrap gap-2 mt-auto">
                              {hasGithub && (
                                    <Link to={githubUrl} target="_blank" rel="noopener noreferrer">
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                className="hover:bg-primary text-muted-foreground hover:text-white transition-colors duration-300 ease-out"
                                          >
                                                <Github className="w-4 h-4 mr-2" />
                                                Code
                                          </Button>
                                    </Link>
                              )}
                              {hasLive && (
                                    <Link to={liveUrl} target="_blank" rel="noopener noreferrer">
                                          <Button
                                                size="sm"
                                                className="hero-gradient text-muted hover:opacity-90 accent-glow"
                                          >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Live Demo
                                          </Button>
                                    </Link>
                              )}
                        </div>

                  </CardContent>
            </Card>
      );
};

export default ProjectCard;