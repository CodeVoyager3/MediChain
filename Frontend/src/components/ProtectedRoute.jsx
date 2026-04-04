import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a dashboard route to enforce:
 * 1. User must be authenticated (have a valid JWT)
 * 2. User's role must match the requiredRole
 *
 * If not authenticated → redirect to landing page
 * If wrong role → redirect to the correct dashboard
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-body">Loading…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch — send them to their correct dashboard
  if (requiredRole && user?.role !== requiredRole) {
    const roleRoutes = {
      PATIENT: '/patient',
      DOCTOR: '/doctor',
      INSURER: '/insurer',
    };
    const correctRoute = roleRoutes[user?.role] || '/';
    return <Navigate to={correctRoute} replace />;
  }

  return children;
}
