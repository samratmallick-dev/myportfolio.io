import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';
import EducationSkeleton from '../loaders/EducationSkeleton';

const MyEducation = () => {
      const { education, isLoading } = useSelector((state) => state.public);

      return (
            <section id="education" className="py-20 border-b border-gray-700">
                  <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gradient">Education & Certifications</h2>
                        <div className="max-w-4xl mx-auto space-y-8">
                              {isLoading || !education || education.length === 0 ? (
                                    <EducationSkeleton />
                              ) : (
                                    education?.map((item, index) => (
                                          <Card key={item._id || index} className="hover-lift tech-glow animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                                                <CardHeader>
                                                      <CardTitle className="flex items-center justify-between">
                                                            <span>{item.title}</span>
                                                            {item.certification && (
                                                                  <Badge className="hero-gradient text-muted">Certified</Badge>
                                                            )}
                                                      </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                      <p className="text-muted-foreground mb-4">{item.description}</p>
                                                      <div className="flex flex-wrap items-center justify-between gap-4">
                                                            <span className="text-sm text-muted-foreground">{item.date}</span>
                                                            {item.certificateLink && (
                                                                  <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        asChild
                                                                        className="flex items-center gap-2"
                                                                  >
                                                                        <a href={item.certificateLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                                              <ExternalLink className="w-4 h-4" />
                                                                              View Certificate
                                                                        </a>
                                                                  </Button>
                                                            )}
                                                      </div>
                                                </CardContent>
                                          </Card>
                                    ))
                              )}
                        </div>
                  </div>
            </section>
      );
};

export default MyEducation;
