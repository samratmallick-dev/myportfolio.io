import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectBySlugThunk } from '@/store/project.slice';
import PageLoader from '@/components/common/PageLoader';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Calendar, Tag, CheckCircle2, Layers, Cpu, Code2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
                  <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#000511]">
                        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
                        <Link to="/projects">
                              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
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
            <div className="min-h-screen bg-[#000511] text-white pt-28 pb-20 selection:bg-primary/30">
                  <Helmet>
                        <title>{title} | Samrat Mallick Portfolio</title>
                        <meta name="description" content={shortDescription || description} />
                        <meta property="og:title" content={title} />
                        <meta property="og:description" content={shortDescription || description} />
                  </Helmet>
                  {/* Hero Section */}
                  <div className="container mx-auto px-4 lg:px-8 mb-16 relative">
                        <Link to="/projects" className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-8 group">
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
                                          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1">
                                                <Tag className="w-3 h-3 mr-2" />
                                                {category}
                                          </Badge>
                                    )}
                                    {year && (
                                          <Badge variant="outline" className="border-white/10 text-gray-400 px-3 py-1">
                                                <Calendar className="w-3 h-3 mr-2" />
                                                {year}
                                          </Badge>
                                    )}
                                    {status && (
                                          <Badge variant="outline" className="border-white/10 text-gray-400 px-3 py-1">
                                                {status}
                                          </Badge>
                                    )}
                              </div>
                              
                              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    {title}
                              </h1>
                              
                              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 max-w-3xl">
                                    {shortDescription || description}
                              </p>

                              <div className="flex flex-wrap gap-4">
                                    {liveUrl && (
                                          <Link to={liveUrl} target="_blank" rel="noopener noreferrer">
                                                <Button className="hero-gradient hover:opacity-90 transition-opacity">
                                                      <ExternalLink className="w-4 h-4 mr-2" />
                                                      View Live Project
                                                </Button>
                                          </Link>
                                    )}
                                    {githubUrl && (
                                          <Link to={githubUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" className="border-white/20 hover:bg-white/10">
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
                                    className="w-full rounded-2xl overflow-hidden border border-white/10 max-h-[500px]"
                              >
                                    <img
                                          src={image.url}
                                          alt={title}
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
                                          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
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
                                                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                                                                  <p className="text-gray-200">{feature}</p>
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
                                                                  <p className="text-gray-300 mt-1 leading-relaxed">{step}</p>
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
                                                            <h2 className="text-2xl font-semibold mb-6 text-red-400">Challenges</h2>
                                                            <ul className="space-y-3">
                                                                  {challenges.map((challenge, idx) => (
                                                                        <li key={idx} className="text-gray-300 bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                                                                              {challenge}
                                                                        </li>
                                                                  ))}
                                                            </ul>
                                                      </div>
                                                )}
                                                {results.length > 0 && (
                                                      <div>
                                                            <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-400">
                                                                  <Rocket className="w-6 h-6 mr-3" />
                                                                  Outcomes
                                                            </h2>
                                                            <ul className="space-y-3">
                                                                  {results.map((result, idx) => (
                                                                        <li key={idx} className="text-gray-300 bg-green-500/5 border border-green-500/10 rounded-lg p-4">
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
                                          className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                                    >
                                          <h3 className="text-lg font-semibold mb-4 flex items-center border-b border-white/10 pb-4">
                                                <Cpu className="w-5 h-5 mr-2 text-primary" />
                                                Technologies Used
                                          </h3>
                                          <div className="flex flex-wrap gap-2 mt-4">
                                                {techArray.map((tech, idx) => (
                                                      <Badge key={idx} variant="secondary" className="bg-white/5 text-gray-200 hover:bg-white/10 border-none py-1.5 px-3">
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
                                                className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
                                          >
                                                <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-4">
                                                      Architecture
                                                </h3>
                                                <ul className="space-y-3 mt-4 text-gray-300 text-sm">
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
