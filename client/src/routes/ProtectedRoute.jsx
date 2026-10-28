import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AccessDeniedPage from '../pages/AccessDeniedPage';

/**
 * ProtectedRoute Component
 *
 * @param {Array<string>} allowedRoles - Optional allowed roles (e.g. ['admin'], ['admin', 'committee'])
 * @param {Array<string>} requiredPermissions - Optional required permissions
 */
export const ProtectedRoute = ({ allowedRoles = [], requiredPermissions = [], children }) => {
  const { isAuthenticated, role, permissions, loading } = useAuth();
  const location = useLocation();

  // 1. Loading state while restoring Firebase auth session
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" text="सुरक्षा सत्यापन जारी है... कृपया प्रतीक्षा करें।" />
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to login page with return state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-based check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <AccessDeniedPage requiredRoles={allowedRoles} />;
  }

  // 4. Permission-based check (if specified)
  if (requiredPermissions.length > 0 && role !== 'admin') {
    const hasAll = requiredPermissions.every((perm) => permissions.includes(perm));
    if (!hasAll) {
      return <AccessDeniedPage requiredRoles={allowedRoles} />;
    }
  }

  // 5. Authorized -> Render child component or Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
