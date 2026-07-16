import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export const ProtectedRoute = ({ children }) => {

  const {
    isAuthenticated,
    loading
  } = useAuth();


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }


  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  return children;

};




export const AdminRoute = ({ children }) => {


  const {
    isAuthenticated,
    user,
    loading
  } = useAuth();



  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  }



  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }




  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }




  if (user.role !== "admin") {

    return (
      <Navigate
        to={`/project/${user.projectId}/my-tasks`}
        replace
      />
    );

  }



  return children;

};