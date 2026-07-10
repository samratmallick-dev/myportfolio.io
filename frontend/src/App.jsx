import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import MyPortfoliopageLayout from './components/user-view/layout';
import { useDisableContextMenuAndCopy } from './components/common/useDisableContextMenuAndCopy';
import AuthLayout from './components/auth/layout';
import AdminLayout from './components/admin-view/layout';
import CheckAuth from './components/common/CheckAuth';
import PageLoader from './components/common/PageLoader';

// Lazy-loaded client views
const MyPortfolio = lazy(() => import('./pages/client-view/portfolio'));
const MyAllProjectList = lazy(() => import('./pages/client-view/project-listing'));
const MyContact = lazy(() => import('./pages/client-view/contact'));
const Login = lazy(() => import('./pages/auth/login'));

// Lazy-loaded admin views
const AdminViewDashboard = lazy(() => import('./pages/admin-view/dashboard'));
const AdminViewHero = lazy(() => import('./pages/admin-view/hero'));
const AdminViewAbout = lazy(() => import('./pages/admin-view/about'));
const AdminViewEducation = lazy(() => import('./pages/admin-view/education'));
const AdminViewProject = lazy(() => import('./pages/admin-view/project'));
const AdminViewSkills = lazy(() => import('./pages/admin-view/skills'));
const AdminViewServices = lazy(() => import('./pages/admin-view/services'));
const AdminSettings = lazy(() => import('./pages/admin-view/settings'));
const AdminViewContactDetails = lazy(() => import('./pages/admin-view/contactdetails'));
const AdminMessages = lazy(() => import('./pages/admin-view/messages'));

const App = () => {
      const location = useLocation();
      const isAdminRoute = location.pathname.startsWith('/admin');

      useDisableContextMenuAndCopy(!isAdminRoute);

      return (
            <div className="flex flex-col overflow-hidden bg-background min-h-screen">
                  <Suspense fallback={<PageLoader />}>
                        <Routes>
                              <Route path="/admin" element={<CheckAuth><AdminLayout /></CheckAuth>}>
                                    <Route index element={<Navigate to="dashboard" replace />} />
                                    <Route path="dashboard" element={<AdminViewDashboard />} />
                                    <Route path="hero-content" element={<AdminViewHero />} />
                                    <Route path="about-content" element={<AdminViewAbout />} />
                                    <Route path="education-list" element={<AdminViewEducation />} />
                                    <Route path="projects-list" element={<AdminViewProject />} />
                                    <Route path="skills-list" element={<AdminViewSkills />} />
                                    <Route path="services-list" element={<AdminViewServices />} />
                                    <Route path="contact-details" element={<AdminViewContactDetails />} />
                                    <Route path="messages" element={<AdminMessages />} />
                                    <Route path="settings" element={<AdminSettings />} />
                                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                              </Route>

                              <Route path="/auth" element={<AuthLayout />}>
                                    <Route index element={<Navigate to="login" replace />} />
                                    <Route path="login" element={<Login />} />
                                    <Route path="*" element={<Navigate to="login" replace />} />
                              </Route>

                              <Route path="/" element={<Navigate to="/portfolio/home" replace />} />
                              <Route path="/portfolio" element={<MyPortfoliopageLayout />}>
                                    <Route index element={<Navigate to="home" replace />} />
                                    <Route path="home" element={<MyPortfolio />} />
                                    <Route path="projects" element={<MyAllProjectList />} />
                                    <Route path="contact" element={<MyContact />} />
                                    <Route path="*" element={<Navigate to="/portfolio/home" replace />} />
                              </Route>
                              <Route path="*" element={<Navigate to="/portfolio/home" replace />} />
                        </Routes>
                  </Suspense>
            </div>
      );
};

export default App;
