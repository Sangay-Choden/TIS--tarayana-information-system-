// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import Loader from '../components/common/Load';

// const ProtectedRoute = ({ children }) => {
//   // Bypassing auth checks for frontend development as requested
//   return children;
// };

// export default ProtectedRoute;



import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {

  const location = useLocation();

  const token = localStorage.getItem("token");

  // NO TOKEN → REDIRECT TO LOGIN
  if (!token) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;