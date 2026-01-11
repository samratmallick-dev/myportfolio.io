import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '@/store/auth.slice';

const CheckAuth = ({ children }) => {
      const dispatch = useDispatch();
      const location = useLocation();
      const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
      const [authChecked, setAuthChecked] = useState(false);
      const hasCheckedAuth = useRef(false);

      useEffect(() => {
            // If we have a token but no user data, we need to check auth
            const hasToken = !!localStorage.getItem('adminToken');
            const needsAuthCheck = isAuthenticated && !user && hasToken;
            
            if (needsAuthCheck && !hasCheckedAuth.current) {
                  const verifyAuth = async () => {
                        hasCheckedAuth.current = true;
                        dispatch(checkAuth());
                        setAuthChecked(true);
                  };
                  verifyAuth();
                  return;
            }

            // If already authenticated with user data, no need to check
            if (isAuthenticated && user) {
                  setAuthChecked(true);
                  hasCheckedAuth.current = true;
                  return;
            }

            // If not authenticated and hasn't checked yet
            if (!isAuthenticated && !hasCheckedAuth.current) {
                  const verifyAuth = async () => {
                        hasCheckedAuth.current = true;
                        dispatch(checkAuth());
                        setAuthChecked(true);
                  };
                  verifyAuth();
            }
      }, [dispatch, isAuthenticated, user]);

      if (!authChecked || isLoading) {
            return (
                  <div className="flex items-center justify-center min-h-screen">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
            );
      }

      if (authChecked && !isAuthenticated) {
            return <Navigate to="/auth/login" state={{ from: location }} replace />;
      }

      return <>{children}</>;
};

export default CheckAuth;
