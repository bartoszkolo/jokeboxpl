import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component that ensures only authenticated users can access certain routes.
 *
 * This prevents the "content flash" issue where unauthenticated users would briefly
 * see protected content before being redirected.
 *
 * Usage:
 * <ProtectedRoute>
 *   <AddJokePage />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-content-muted subheading">Ładowanie...</p>
        </div>
      </div>
    )
  }

  // Redirect to login page if user is not authenticated
  if (!user) {
    return <Navigate to="/logowanie" replace />
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}