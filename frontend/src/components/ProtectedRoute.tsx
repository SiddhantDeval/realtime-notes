"use client";

import { useAuth } from "@/context/authContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * Redirects unauthenticated users to login
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-121px-65px)] md:min-h-[calc(100dvh-65px-65px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-secondary dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, show nothing (redirect will happen)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Render children if authenticated or auth not required
  return <>{children}</>;
}
