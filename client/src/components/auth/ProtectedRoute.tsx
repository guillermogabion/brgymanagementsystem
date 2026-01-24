import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const location = useLocation();
  
  // 1. Check if the user is authenticated
  // You can replace this with your actual Auth Context or Redux state
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    // 2. Redirect them to the sign-in page, but save the current location 
    // so we can send them back there after they log in.
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 3. If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;