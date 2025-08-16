import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    // Still checking cookies
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;
