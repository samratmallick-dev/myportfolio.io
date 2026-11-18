import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ensureAuthInitialized } from '@/store/auth.slice';

const CheckAuth = ({ children }) => {
      const dispatch = useDispatch();
      const location = useLocation();
      const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);

      useEffect(() => {
            ensureAuthInitialized(dispatch);
      }, [dispatch]);

      if (isInitializing) {
            return (
                  <div className="flex items-center justify-center min-h-screen">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
            );
      }

      if (!isAuthenticated) {
            return <Navigate to="/auth/login" state={{ from: location }} replace />;
      }

      return <>{children}</>;
};

export default CheckAuth;
