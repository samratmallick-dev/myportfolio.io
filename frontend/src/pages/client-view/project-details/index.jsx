import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectBySlugThunk } from '@/store/project.slice';
import PageLoader from '@/components/common/PageLoader';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Calendar, Tag, CheckCircle2, Layers, Cpu, Code2, Rocket, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/common/OptimizedImage';
import { Helmet } from 'react-helmet-async';

const sectionVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const ProjectDetails = () => {
      const { slug } = useParams();
      const dispatch = useDispatch();
      const { currentProject, isLoading, error } = useSelector(state => state.project);

      useEffect(() => {
            if (slug) {
                  dispatch(getProjectBySlugThunk(slug));
                  window.scrollTo(0, 0);
            }
      }, [slug, dispatch]);

      if (isLoading) {
            return <PageLoader />;
      }

      if (error || !currentProject) {
            return (
                  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
                        <Link to="/projects">
                              <Button variant="outline">
                                    Return to Projects
                              </Button>
                        </Link>
                  </div>
            );
      }

      const {
            title,
            shortDescription,
            description,
            category,
            year,
            technologies,
            features = [],
            architecture = [],
            process = [],
            challenges = [],
            results = [],
            githubUrl,
            liveUrl,
            status,
            image,
      } = currentProject;

      const techArray = Array.isArray(technologies) ? technologies : [];

      return (
            <div className="min-h-screen bg-background text-foreground pt-28 pb-20">
                  <Helmet>
                        <title>{title} | Samrat Mallick Portfolio</title>
                        <meta name="description" content={shortDescription || description} />
                        <meta property="og:title" content={title} />
                        <meta property="og:description" content={shortDescription || description} />
                  </Helmet>
                  {/* Hero Section */}
                  <div className="container mx-auto px-4 lg:px-8 mb-16 relative">
                        <Link to="/projects" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8 group">
                              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                              Back to Projects
                        </Link>
                        
                        <motion.div 
                              initial="hidden"
                              animate="visible"
                              variants={sectionVariants}
                              className="max-w-4xl"
                        >
                              <div className="flex flex-wrap items-center gap-4 mb-6">
                                    {category && (
                                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 px-3 py-1">
                                                <Tag className="w-3 h-3 mr-2" />
                                                {category}
                                          </Badge>
                                    )}
                                    {year && (
                                          <Badge variant="outline" className="px-3 py-1">
                                                <Calendar className="w-3 h-3 mr-2" />
                                                {year}
                                          </Badge>
                                    )}
                                    {status && (
                                          <Badge variant="outline" className="px-3 py-1">
                                                {status}
                                          </Badge>
                                    )}
                              </div>
                              
                              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gradient">
                                    {title}
                              </h1>
                              
                              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                                    {shortDescription || description}
                              </p>

                              <div className="flex flex-wrap gap-4">
                                    {liveUrl && (
                                          <Link to={liveUrl} target="_blank" rel="noopener noreferrer">
                                                <Button className="hover:opacity-90 transition-opacity">
                                                      <ExternalLink className="w-4 h-4 mr-2" />
                                                      View Live Project
                                                </Button>
                                          </Link>
                                    )}
                                    {githubUrl && (
                                          <Link to={githubUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline">
                                                      <Github className="w-4 h-4 mr-2" />
                                                      View Source Code
                                                </Button>
                                          </Link>
                                    )}
                              </div>
                        </motion.div>
                  </div>

                  {/* Project Image Banner */}
                  {image?.url && (
                        <div className="container mx-auto px-4 lg:px-8 mb-16">
                              <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="w-full rounded-2xl overflow-hidden border border-border max-h-[500px]"
                              >
                                    <OptimizedImage
                                          src={image.url}
                                          alt={title}
                                          width="1600"
                                          height="900"
                                          widths={[800, 1200, 1600]}
                                          sizes="(min-width: 1280px) 1024px, 100vw"
                                          loading="eager"
                                          fetchPriority="high"
                                          className="w-full h-full object-cover"
                                    />
                              </motion.div>
                        </div>
                  )}

                  {/* Main Content Grid */}
                  <div className="container mx-auto px-4 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                              
                              {/* Left Column (Main Content) */}
                              <div className="lg:col-span-2 space-y-16">
                                    {/* About Project */}
                                    <motion.section 
                                          initial="hidden"
                                          whileInView="visible"
                                          viewport={{ once: true, margin: "-100px" }}
                                          variants={sectionVariants}
                                    >
                                          <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                                <Layers className="w-6 h-6 mr-3 text-primary" />
                                                About The Project
                                          </h2>
                                          <div className="max-w-none text-muted-foreground">
                                                <p className="leading-loose whitespace-pre-line">{description}</p>
                                          </div>
                                    </motion.section>

                                    {/* Key Features */}
                                    {features.length > 0 && (
                                          <motion.section 
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true, margin: "-100px" }}
                                                variants={sectionVariants}
                                          >
                                                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                                      <CheckCircle2 className="w-6 h-6 mr-3 text-primary" />
                                                      Key Features
                                                </h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      {features.map((feature, idx) => (
                                                            <div key={idx} className="bg-card border border-border rounded-xl p-5 hover:bg-muted/60 transition-colors">
                                                                  <p className="text-card-foreground">{feature}</p>
                                                            </div>
                                                      ))}
                                                </div>
                                          </motion.section>
                                    )}

                                    {/* Process */}
                                    {process.length > 0 && (
                                          <motion.section 
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true, margin: "-100px" }}
                                                variants={sectionVariants}
                                          >
                                                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                                      <Code2 className="w-6 h-6 mr-3 text-primary" />
                                                      Development Process
                                                </h2>
                                                <div className="space-y-4">
                                                      {process.map((step, idx) => (
                                                            <div key={idx} className="flex gap-4 items-start">
                                                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                                                        {idx + 1}
                                                                  </div>
                                                                  <p className="text-muted-foreground mt-1 leading-relaxed">{step}</p>
                                                            </div>
                                                      ))}
                                                </div>
                                          </motion.section>
                                    )}

                                    {/* Challenges & Results */}
                                    {(challenges.length > 0 || results.length > 0) && (
                                          <motion.section 
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true, margin: "-100px" }}
                                                variants={sectionVariants}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                          >
                                                {challenges.length > 0 && (
                                                      <div>
                                                            <h2 className="text-2xl font-semibold mb-6 flex items-center text-destructive">
                                                                  <AlertTriangle className="w-6 h-6 mr-3" />
                                                                  Challenges
                                                            </h2>
                                                            <ul className="space-y-3">
                                                                  {challenges.map((challenge, idx) => (
                                                                        <li key={idx} className="text-foreground bg-destructive/10 border border-destructive/25 rounded-lg p-4">
                                                                              {challenge}
                                                                        </li>
                                                                  ))}
                                                            </ul>
                                                      </div>
                                                )}
                                                {results.length > 0 && (
                                                      <div>
                                                            <h2 className="text-2xl font-semibold mb-6 flex items-center text-success">
                                                                  <Rocket className="w-6 h-6 mr-3" />
                                                                  Outcomes
                                                            </h2>
                                                            <ul className="space-y-3">
                                                                  {results.map((result, idx) => (
                                                                        <li key={idx} className="text-foreground bg-success/10 border border-success/25 rounded-lg p-4">
                                                                              {result}
                                                                        </li>
                                                                  ))}
                                                            </ul>
                                                      </div>
                                                )}
                                          </motion.section>
                                    )}
                              </div>

                              {/* Right Column (Sidebar) */}
                              <div className="lg:col-span-1 space-y-8">
                                    {/* Tech Stack */}
                                    <motion.div 
                                          initial="hidden"
                                          whileInView="visible"
                                          viewport={{ once: true }}
                                          variants={sectionVariants}
                                          className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm"
                                    >
                                          <h3 className="text-lg font-semibold mb-4 flex items-center border-b border-border pb-4">
                                                <Cpu className="w-5 h-5 mr-2 text-primary" />
                                                Technologies Used
                                          </h3>
                                          <div className="flex flex-wrap gap-2 mt-4">
                                                {techArray.map((tech, idx) => (
                                                      <Badge key={idx} variant="secondary" className="py-1.5 px-3">
                                                            {tech}
                                                      </Badge>
                                                ))}
                                          </div>
                                    </motion.div>

                                    {/* Architecture Overview (if available) */}
                                    {architecture.length > 0 && (
                                          <motion.div 
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true }}
                                                variants={sectionVariants}
                                                className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm"
                                          >
                                                <h3 className="text-lg font-semibold mb-4 border-b border-border pb-4">
                                                      Architecture
                                                </h3>
                                                <ul className="space-y-3 mt-4 text-muted-foreground text-sm">
                                                      {architecture.map((item, idx) => (
                                                            <li key={idx} className="flex items-start">
                                                                  <span className="text-primary mr-2">•</span>
                                                                  {item}
                                                            </li>
                                                      ))}
                                                </ul>
                                          </motion.div>
                                    )}
                              </div>

                        </div>
                  </div>
            </div>
      );
};

export default ProjectDetails;
