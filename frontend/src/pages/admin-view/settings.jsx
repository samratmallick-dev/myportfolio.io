import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, CheckCircle2, ArrowLeft, Info, MonitorSmartphone, LogOut } from 'lucide-react';
import CommonForm from '@/components/common/form';
import {
      adminUpdateEmailFormIndex,
      adminEmailOTPFormIndex,
      adminUpdatePasswordFormIndex,
      adminPasswordOTPFormIndex
} from '@/config/allFormIndex';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
      generateOTPThunk,
      verifyOTPAndUpdateEmailThunk,
      verifyOTPAndUpdatePasswordThunk,
      loadAdminSessions,
      revokeAdminSessionThunk,
      logoutAllSessions,
} from '@/store/auth.slice';
import SettingsSkeleton from '@/components/loaders/SettingsSkeleton';
import { toast } from 'sonner';

const formatDateTime = (value) => {
      if (!value) return '—';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

const AdminSettings = () => {
      const { user, isLoading } = useSelector((state) => state.auth);
      const navigate = useNavigate();
      const dispatch = useDispatch();

      const [emailStep, setEmailStep] = useState('idle');
      const [emailFormData, setEmailFormData] = useState({ newEmail: '' });
      const [emailOTPData, setEmailOTPData] = useState({ otp: '' });
      const [emailErrors, setEmailErrors] = useState({});
      const [emailLoading, setEmailLoading] = useState(false);

      const [passwordStep, setPasswordStep] = useState('idle');
      const [passwordFormData, setPasswordFormData] = useState({ newPassword: '', confirmPassword: '' });
      const [passwordOTPData, setPasswordOTPData] = useState({ otp: '' });
      const [passwordErrors, setPasswordErrors] = useState({});
      const [passwordLoading, setPasswordLoading] = useState(false);

      const [sessions, setSessions] = useState([]);
      const [sessionsLoading, setSessionsLoading] = useState(false);
      const [revokingId, setRevokingId] = useState(null);
      const [logoutAllLoading, setLogoutAllLoading] = useState(false);

      const loadSessions = useCallback(async () => {
            setSessionsLoading(true);
            try {
                  const action = await dispatch(loadAdminSessions());
                  if (loadAdminSessions.fulfilled.match(action)) {
                        setSessions(action.payload || []);
                  }
            } catch {
                  // Keep whatever list we already have; loading state is reset below.
            } finally {
                  setSessionsLoading(false);
            }
      }, [dispatch]);

      useEffect(() => {
            loadSessions();
      }, [loadSessions]);

      const handleRevokeSession = async (sessionId) => {
            setRevokingId(sessionId);
            try {
                  await dispatch(revokeAdminSessionThunk(sessionId)).unwrap();
                  toast.success('Session revoked');
                  await loadSessions();
            } catch (error) {
                  toast.error('Unable to revoke session', {
                        description: typeof error === 'string' ? error : error?.message,
                  });
            } finally {
                  setRevokingId(null);
            }
      };

      const handleLogoutAll = async () => {
            setLogoutAllLoading(true);
            try {
                  await dispatch(logoutAllSessions()).unwrap();
                  toast.success('Signed out of every session');
                  navigate('/auth/login');
            } catch (error) {
                  toast.error('Unable to sign out everywhere', {
                        description: typeof error === 'string' ? error : error?.message,
                  });
            } finally {
                  setLogoutAllLoading(false);
            }
      };

      const handleEmailChange = (name, value) => {
            setEmailFormData({ ...emailFormData, [name]: value });
            if (emailErrors[name]) {
                  setEmailErrors({ ...emailErrors, [name]: '' });
            }
      };

      const handleEmailOTPChange = (name, value) => {
            setEmailOTPData({ ...emailOTPData, [name]: value });
            if (emailErrors[name]) {
                  setEmailErrors({ ...emailErrors, [name]: '' });
            }
      };

      const handleSendEmailOTP = async (e) => {
            e.preventDefault();
            setEmailLoading(true);

            try {
                  await dispatch(generateOTPThunk({
                        purpose: 'email_update',
                        newEmail: emailFormData.newEmail
                  })).unwrap();

                  setEmailErrors({});
                  setEmailStep('otp-sent');
                  toast.success('OTP sent successfully');
            } catch (error) {
                  setEmailErrors({ newEmail: error?.message || 'Failed to send OTP' });
                  toast.error('Failed to send OTP', {
                        description: error?.message || 'Please try again'
                  });
            } finally {
                  setEmailLoading(false);
            }
      };

      const handleVerifyEmailOTP = async (e) => {
            e.preventDefault();
            setEmailLoading(true);

            try {
                  await dispatch(verifyOTPAndUpdateEmailThunk({
                        otp: emailOTPData.otp,
                        email: emailFormData.newEmail
                  })).unwrap();

                  setEmailErrors({});
                  setEmailStep('success');
                  
                  toast.success('Email updated successfully');

                  setTimeout(() => {
                        navigate('/auth/login');
                  }, 2000);
            } catch (error) {
                  setEmailErrors({ otp: error?.message || 'Invalid or expired OTP' });
                  toast.error('Failed to update email', {
                        description: error?.message || 'Please check your OTP and try again'
                  });
            } finally {
                  setEmailLoading(false);
            }
      };

      const resetEmailFlow = () => {
            setEmailStep('idle');
            setEmailFormData({ newEmail: '' });
            setEmailOTPData({ otp: '' });
            setEmailErrors({});
      };

      const handlePasswordChange = (name, value) => {
            setPasswordFormData({ ...passwordFormData, [name]: value });
            if (passwordErrors[name]) {
                  setPasswordErrors({ ...passwordErrors, [name]: '' });
            }
      };

      const handlePasswordOTPChange = (name, value) => {
            setPasswordOTPData({ ...passwordOTPData, [name]: value });
            if (passwordErrors[name]) {
                  setPasswordErrors({ ...passwordErrors, [name]: '' });
            }
      };

      const handleSendPasswordOTP = async (e) => {
            e.preventDefault();

            if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
                  setPasswordErrors({ confirmPassword: 'Passwords do not match' });
                  return;
            }

            if (passwordFormData.newPassword.length < 8) {
                  setPasswordErrors({ newPassword: 'Password must be at least 8 characters long' });
                  return;
            }

            setPasswordLoading(true);

            try {
                  await dispatch(generateOTPThunk({ purpose: 'password_update' })).unwrap();

                  setPasswordErrors({});
                  setPasswordStep('otp-sent');
                  toast.success('OTP sent successfully');
            } catch (error) {
                  setPasswordErrors({ newPassword: error?.message || 'Failed to send OTP' });
                  toast.error('Failed to send OTP', {
                        description: error?.message || 'Please try again'
                  });
            } finally {
                  setPasswordLoading(false);
            }
      };

      const handleVerifyPasswordOTP = async (e) => {
            e.preventDefault();
            setPasswordLoading(true);

            try {
                  await dispatch(verifyOTPAndUpdatePasswordThunk({
                        otp: passwordOTPData.otp,
                        newPassword: passwordFormData.newPassword
                  })).unwrap();

                  setPasswordErrors({});
                  setPasswordStep('success');
                  toast.success('Password updated successfully');

                  setTimeout(() => {
                        navigate('/auth/login');
                  }, 2000);
            } catch (error) {
                  setPasswordErrors({ otp: error?.message || 'Invalid or expired OTP' });
                  toast.error('Failed to update password', {
                        description: error?.message || 'Please check your OTP and try again'
                  });
            } finally {
                  setPasswordLoading(false);
            }
      };

      const resetPasswordFlow = () => {
            setPasswordStep('idle');
            setPasswordFormData({ newPassword: '', confirmPassword: '' });
            setPasswordOTPData({ otp: '' });
            setPasswordErrors({});
      };

      if (isLoading && !user) {
            return <SettingsSkeleton />;
      }

      return (
            <div className="space-y-6 max-w-4xl">
                  <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground mt-2">Manage your account settings and security</p>
                  </div>

                  <Card>
                        <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Account Information
                              </CardTitle>
                              <CardDescription>Your current account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 p-1">
                                    <div className="flex flex-col gap-2 flex-wrap">
                                          <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                          <input value={user?.username || 'N/A'} readOnly className='p-3 bg-sidebar-accent rounded-lg font-medium text-wrap w-full overflow-auto' />
                                    </div>
                                    <div className="flex flex-col gap-2 flex-wrap">
                                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                          <input value={user?.email || 'N/A'} readOnly className='p-3 bg-sidebar-accent rounded-lg font-medium text-wrap w-full overflow-auto' />
                                    </div>
                              </div>
                        </CardContent>
                  </Card>

                  <Card>
                        <CardHeader>
                              <CardTitle>Security Settings</CardTitle>
                              <CardDescription>Update your email or password with OTP verification</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <Tabs defaultValue="email" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-sidebar-accent gap-2">
                                          <TabsTrigger value="email" className="flex items-center gap-2 cursor-pointer">
                                                <Mail className="w-4 h-4" />
                                                Email
                                          </TabsTrigger>
                                          <TabsTrigger value="password" className="flex items-center gap-2 cursor-pointer">
                                                <Lock className="w-4 h-4" />
                                                Password
                                          </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="email" className="space-y-4 mt-0">
                                          <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">Update Email Address</h3>
                                                <p className="text-sm text-muted-foreground">
                                                      {emailStep === 'idle' && 'Change your email address with OTP verification'}
                                                      {emailStep === 'otp-sent' && 'Enter the verification code sent to your new email'}
                                                      {emailStep === 'success' && 'Email updated successfully!'}
                                                </p>
                                          </div>

                                          {emailStep === 'idle' && (
                                                <div className="pt-4">
                                                      <CommonForm
                                                            formControls={adminUpdateEmailFormIndex}
                                                            values={emailFormData}
                                                            onChange={handleEmailChange}
                                                            onSubmit={handleSendEmailOTP}
                                                            errors={emailErrors}
                                                            isLoading={emailLoading}
                                                            buttonText="Send Verification Code"
                                                      />
                                                </div>
                                          )}

                                          {emailStep === 'otp-sent' && (
                                                <div className="space-y-4 pt-4">
                                                      <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={resetEmailFlow}
                                                            className="mb-2"
                                                      >
                                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                                            Back to Email Form
                                                      </Button>
                                                      <div className="flex items-start gap-2 p-4 bg-info/10 border border-info/30 rounded-lg">
                                                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
                                                            <p className="text-sm text-foreground">
                                                                  A verification code has been sent to <strong>{emailFormData.newEmail}</strong>
                                                            </p>
                                                      </div>
                                                      <CommonForm
                                                            formControls={adminEmailOTPFormIndex}
                                                            values={emailOTPData}
                                                            onChange={handleEmailOTPChange}
                                                            onSubmit={handleVerifyEmailOTP}
                                                            errors={emailErrors}
                                                            isLoading={emailLoading}
                                                            buttonText="Verify & Update Email"
                                                      />
                                                </div>
                                          )}

                                          {emailStep === 'success' && (
                                                <div className="text-center py-12">
                                                      <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" aria-hidden="true" />
                                                      <h3 className="text-xl font-semibold mb-2">Email Updated Successfully!</h3>
                                                      <p className="text-muted-foreground">
                                                            Your email has been updated. Redirecting to login...
                                                      </p>
                                                </div>
                                          )}
                                    </TabsContent>

                                    <TabsContent value="password" className="space-y-4 mt-0">
                                          <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">Update Password</h3>
                                                <p className="text-sm text-muted-foreground">
                                                      {passwordStep === 'idle' && 'Change your password with OTP verification'}
                                                      {passwordStep === 'otp-sent' && 'Enter the verification code sent to your email'}
                                                      {passwordStep === 'success' && 'Password updated successfully!'}
                                                </p>
                                          </div>

                                          {passwordStep === 'idle' && (
                                                <div className="pt-4">
                                                      <CommonForm
                                                            formControls={adminUpdatePasswordFormIndex}
                                                            values={passwordFormData}
                                                            onChange={handlePasswordChange}
                                                            onSubmit={handleSendPasswordOTP}
                                                            errors={passwordErrors}
                                                            isLoading={passwordLoading}
                                                            buttonText="Send Verification Code"
                                                      />
                                                </div>
                                          )}

                                          {passwordStep === 'otp-sent' && (
                                                <div className="space-y-4 pt-4">
                                                      <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={resetPasswordFlow}
                                                            className="mb-2"
                                                      >
                                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                                            Back to Password Form
                                                      </Button>
                                                      <div className="flex items-start gap-2 p-4 bg-info/10 border border-info/30 rounded-lg">
                                                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
                                                            <p className="text-sm text-foreground">
                                                                  A verification code has been sent to <strong>{user?.email}</strong>
                                                            </p>
                                                      </div>
                                                      <CommonForm
                                                            formControls={adminPasswordOTPFormIndex}
                                                            values={passwordOTPData}
                                                            onChange={handlePasswordOTPChange}
                                                            onSubmit={handleVerifyPasswordOTP}
                                                            errors={passwordErrors}
                                                            isLoading={passwordLoading}
                                                            buttonText="Verify & Update Password"
                                                      />
                                                </div>
                                          )}

                                          {passwordStep === 'success' && (
                                                <div className="text-center py-12">
                                                      <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" aria-hidden="true" />
                                                      <h3 className="text-xl font-semibold mb-2">Password Updated Successfully!</h3>
                                                      <p className="text-muted-foreground">
                                                            Your password has been updated. Redirecting to login...
                                                      </p>
                                                </div>
                                          )}
                                    </TabsContent>
                              </Tabs>
                        </CardContent>
                  </Card>

                  <Card>
                        <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                    <MonitorSmartphone className="w-5 h-5" />
                                    Active Sessions
                              </CardTitle>
                              <CardDescription>
                                    Every signed-in device for this account. Revoking a session signs that device out immediately.
                              </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                              {sessionsLoading && sessions.length === 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                                          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                          Loading sessions...
                                    </div>
                              ) : sessions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">No active sessions found.</p>
                              ) : (
                                    <ul className="divide-y divide-border">
                                          {sessions.map((session) => (
                                                <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                                      <div className="min-w-0 space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                  <span className="text-sm font-medium truncate max-w-[16rem]">
                                                                        {session.userAgent || 'Unknown device'}
                                                                  </span>
                                                                  {session.isCurrent && (
                                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                                                                              Current
                                                                        </span>
                                                                  )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                  IP {session.ipAddress || 'unknown'} · Signed in {formatDateTime(session.createdAt)} · Last used {formatDateTime(session.lastUsedAt)}
                                                            </p>
                                                      </div>
                                                      {!session.isCurrent && (
                                                            <Button
                                                                  variant="outline"
                                                                  size="sm"
                                                                  disabled={revokingId === session.id}
                                                                  onClick={() => handleRevokeSession(session.id)}
                                                            >
                                                                  {revokingId === session.id ? 'Revoking...' : 'Revoke'}
                                                            </Button>
                                                      )}
                                                </li>
                                          ))}
                                    </ul>
                              )}

                              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
                                          Signing out everywhere also invalidates your current session.
                                    </p>
                                    <Button
                                          variant="destructive"
                                          size="sm"
                                          disabled={logoutAllLoading}
                                          onClick={handleLogoutAll}
                                    >
                                          <LogOut className="w-4 h-4 mr-2" />
                                          {logoutAllLoading ? 'Signing out...' : 'Sign out everywhere'}
                                    </Button>
                              </div>
                        </CardContent>
                  </Card>
            </div>
      );
};

export default AdminSettings;