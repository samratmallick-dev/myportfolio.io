import React from 'react';
import SkillCard from './skill-card';
import SkillsSkeleton from '../loaders/SkillsSkeleton';
import SectionError from '../loaders/SectionError';
import { useLazySection } from '@/hooks/useLazySection';
import { getIconComponent } from '@/config/iconRegistry';

const MySkills = () => {
      const { ref, data: skills, status, isLoading, isError, error, retry } = useLazySection('skills');

      const categories = Array.isArray(skills)
            ? skills.filter((skillCategory) => skillCategory.skills && skillCategory.skills.length > 0)
            : [];
      const showSkeleton = isLoading || status === 'idle';

      return (
            <section ref={ref} id="skills" className="py-20 border-b border-border">
                  <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12 text-gradient">Skills Overview</h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                              {showSkeleton ? (
                                    <SkillsSkeleton />
                              ) : isError ? (
                                    <SectionError className="col-span-full" message={error || 'Unable to load skills.'} onRetry={retry} />
                              ) : categories.length > 0 ? (
                                    categories.map((skillCategory, index) => (
                                          <div key={skillCategory._id || index} className="animate-slide-up" style={{ animationDelay: `${(index + 3) * 0.2}s` }}>
                                                <SkillCard
                                                      title={skillCategory.category}
                                                      skills={skillCategory.skills.map((s) => {
                                                            const Icon = getIconComponent(s.iconName);
                                                            return {
                                                                  name: s.name,
                                                                  level: s.level,
                                                                  icon: Icon ? (
                                                                        <Icon className={`w-5 h-5 ${s.iconColor || ''}`} />
                                                                  ) : null
                                                            };
                                                      })}
                                                />
                                          </div>
                                    ))
                              ) : (
                                    <div className="col-span-full text-center text-muted-foreground">No skills found.</div>
                              )}
                        </div>
                  </div>
            </section>
      );
};

export default React.memo(MySkills);
