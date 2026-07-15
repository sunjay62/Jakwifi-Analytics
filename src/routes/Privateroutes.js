import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { isTokenExpired, clearAuthTokens } from 'utils/auth';

const checkAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  if (isTokenExpired(token)) {
    clearAuthTokens();
    return false;
  }
  return true;
};

const PrivateRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthenticated);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAuthenticated(checkAuthenticated());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
