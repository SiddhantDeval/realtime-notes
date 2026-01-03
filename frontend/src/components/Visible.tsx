import React from "react";

interface VisibleProps {
  when: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback to render when 'when' is false
  // Additional props for conditional rendering based on other factors
  // For example, if you want to show/hide based on user role:
  // userRole?: "admin" | "editor" | "viewer";
  // requiredRole?: "admin" | "editor" | "viewer";
}

const Visible: React.FC<VisibleProps> = ({ when, children, fallback }) => {
  if (when) {
    return <>{children}</>;
  }
  return <>{fallback || null}</>;
};

export default Visible;


