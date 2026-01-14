import { Fragment, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import * as Icons from 'lucide-react';

import { getHeroData } from '@/store/hero.slice';
import { getAboutData } from '@/store/about.slice';
import { getAllEducationData } from '@/store/education.slice';
import { getAllCategories } from '@/store/skills.slice';
import { getAllProjects, getFeaturedProjects } from '@/store/project.slice';
import { getAllServices } from '@/store/services.slice';
import { getAllMessages, getContactDetails, getUnreadCount } from '@/store/contact.slice';

const AdminViewDashboard = () => {
      const dispatch = useDispatch();

      const { projectsData, featuredProjects, isLoading: projectLoading } = useSelector((s) => s.project);
      const { servicesData, isLoading: servicesLoading } = useSelector((s) => s.services);
      const { categories: skillsData, isLoading: skillsLoading } = useSelector((s) => s.skills);
      const { educationData, isLoading: educationLoading } = useSelector((s) => s.education);
      const { heroData, isLoading: heroLoading } = useSelector((s) => s.hero);
      const { aboutData, isLoading: aboutLoading } = useSelector((s) => s.about);
      const { messages, contactDetails, unreadCount, loading: contactLoading } = useSelector((s) => s.contact);

      useEffect(() => {
            dispatch(getHeroData());
            dispatch(getAboutData());
            dispatch(getAllEducationData());
            dispatch(getAllCategories());
            dispatch(getAllProjects());
            dispatch(getFeaturedProjects());
            dispatch(getAllServices());
            dispatch(getAllMessages());
            dispatch(getContactDetails());
            dispatch(getUnreadCount());
      }, [dispatch]);

      const totals = useMemo(() => {
            const totalProjects = Array.isArray(projectsData) ? projectsData.length : 0;
            const totalServices = Array.isArray(servicesData) ? servicesData.length : 0;
            const totalCategories = Array.isArray(skillsData) ? skillsData.length : 0;
            const totalSkills = Array.isArray(skillsData)
                  ? skillsData.reduce((acc, cat) => acc + (Array.isArray(cat?.skills) ? cat.skills.length : 0), 0)
                  : 0;
            const totalEducation = Array.isArray(educationData) ? educationData.length : 0;
            const totalMessages = Array.isArray(messages) ? messages.length : 0;
            const heroConfigured = !!(heroData && (Array.isArray(heroData) ? heroData.length > 0 : true));
            const aboutConfigured = !!(aboutData && (Array.isArray(aboutData) ? aboutData.length > 0 : true));
            const totalFeatured = Array.isArray(featuredProjects) ? featuredProjects.length : 0;
            return { totalProjects, totalServices, totalCategories, totalSkills, totalEducation, totalMessages, heroConfigured, aboutConfigured, totalFeatured };
      }, [projectsData, servicesData, skillsData, educationData, messages, heroData, aboutData, featuredProjects]);

      const isLoadingAny = projectLoading || servicesLoading || skillsLoading || educationLoading || heroLoading || aboutLoading || contactLoading;

      const stats = [
            { title: 'Projects', value: totals.totalProjects, link: '/admin/projects-list', icon: 'FolderOpen' },
            { title: 'Services', value: totals.totalServices, link: '/admin/services-list', icon: 'Briefcase' },
            { title: 'Skill Categories', value: totals.totalCategories, link: '/admin/skills-list', icon: 'BookOpen' },
            { title: 'Skills', value: totals.totalSkills, link: '/admin/skills-list', icon: 'Zap' },
            { title: 'Education', value: totals.totalEducation, link: '/admin/education-list', icon: 'GraduationCap' },
            { title: 'Messages', value: totals.totalMessages, link: '/admin/messages', icon: 'Mail', badge: unreadCount > 0 ? unreadCount : null },
      ];

      const recentMessages = useMemo(() => {
            const list = Array.isArray(messages) ? [...messages] : [];
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return list.slice(0, 5);
      }, [messages]);

      return (
            <Fragment>
                  <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                              {stats.map((s) => {
                                    const IconComponent = Icons[s.icon];
                                    return (
                                          <Card key={s.title} className="hover:shadow-md transition-shadow">
                                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                      <div className="flex items-center gap-2">
                                                            {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
                                                            <CardTitle className="text-base">{s.title}</CardTitle>
                                                            {s.badge && <Badge variant="destructive" className="text-xs">{s.badge}</Badge>}
                                                      </div>
                                                      <CardAction>
                                                            <Button asChild variant="outline" size="sm">
                                                                  <Link to={s.link}>Manage</Link>
                                                            </Button>
                                                      </CardAction>
                                                </CardHeader>
                                                <CardContent>
                                                      {isLoadingAny ? (
                                                            <Skeleton className="h-8 w-20" />
                                                      ) : (
                                                            <div className="text-3xl font-bold text-primary">{s.value}</div>
                                                      )}
                                                </CardContent>
                                          </Card>
                                    );
                              })}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                              <Card className="col-span-1 xl:col-span-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                          <div className="flex items-center gap-2">
                                                <Icons.MessageSquare className="h-5 w-5 text-muted-foreground" />
                                                <CardTitle>Recent Messages</CardTitle>
                                                {unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
                                          </div>
                                          <CardAction>
                                                <Button asChild variant="outline" size="sm">
                                                      <Link to="/admin/messages">View All</Link>
                                                </Button>
                                          </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                          {contactLoading ? (
                                                <div className="space-y-3">
                                                      <Skeleton className="h-16 w-full" />
                                                      <Skeleton className="h-16 w-full" />
                                                      <Skeleton className="h-16 w-full" />
                                                </div>
                                          ) : recentMessages.length > 0 ? (
                                                <ul className="space-y-3">
                                                      {recentMessages.map((m) => (
                                                            <li key={m._id} className={`p-4 rounded-lg border transition-colors ${
                                                                  !m.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                                            }`}>
                                                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                                                        <div className="font-semibold flex items-center gap-2">
                                                                              <Icons.UserRound className="h-4 w-4" /> 
                                                                              {m.name}
                                                                              {!m.isRead && <Badge variant="secondary" className="text-xs">New</Badge>}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                              <Icons.Clock className="h-3 w-3" />
                                                                              {new Date(m.createdAt).toLocaleString()}
                                                                        </div>
                                                                  </div>
                                                                  <div className="text-sm text-muted-foreground truncate mt-2">{m.message}</div>
                                                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                                        <Icons.Mail className="h-3 w-3" />
                                                                        {m.email}
                                                                        {m.mobile && (
                                                                              <>
                                                                                    <span>•</span>
                                                                                    <Icons.Phone className="h-3 w-3" />
                                                                                    {m.mobile}
                                                                              </>
                                                                        )}
                                                                  </div>
                                                            </li>
                                                      ))}
                                                </ul>
                                          ) : (
                                                <div className="text-center p-8 text-muted-foreground">
                                                      <Icons.MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                      <p className="font-medium mb-2">No messages yet</p>
                                                      <p className="text-sm">Messages from your contact form will appear here.</p>
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>

                              <Card>
                                    <CardHeader>
                                          <div className="flex items-center gap-2">
                                                <Icons.BarChart3 className="h-5 w-5 text-muted-foreground" />
                                                <CardTitle>Quick Stats</CardTitle>
                                          </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                          <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Hero Section</span>
                                                <Badge variant={totals.heroConfigured ? "default" : "secondary"}>
                                                      {totals.heroConfigured ? "Configured" : "Not Set"}
                                                </Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">About Section</span>
                                                <Badge variant={totals.aboutConfigured ? "default" : "secondary"}>
                                                      {totals.aboutConfigured ? "Configured" : "Not Set"}
                                                </Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Featured Projects</span>
                                                <Badge variant={totals.totalFeatured > 0 ? "default" : "secondary"}>
                                                      {totals.totalFeatured} Featured
                                                </Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Contact Details</span>
                                                <Badge variant={contactDetails ? "default" : "secondary"}>
                                                      {contactDetails ? "Configured" : "Not Set"}
                                                </Badge>
                                          </div>
                                    </CardContent>
                              </Card>
                        </div>
                  </div>
            </Fragment>
      );
};

export default AdminViewDashboard;