import jwt_decode from 'jwt-decode';

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const decoded = jwt_decode(token);
    return decoded.expired * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};
