import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('careerbridge_token');
  const userJson = localStorage.getItem('careerbridge_user');
  
  if (!token || !userJson) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userJson);
    
    // Check if user role is authorized
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Role not allowed, redirect to generic student dashboard or home
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  } catch (e) {
    // JSON parse error, clear data and redirect to login
    localStorage.removeItem('careerbridge_token');
    localStorage.removeItem('careerbridge_user');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
