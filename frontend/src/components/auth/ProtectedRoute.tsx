import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { RoleSelectionModal } from './RoleSelectionModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <RoleSelectionModal open={true} />;
  }

  // Check if student needs onboarding
  if (profile.role === 'student' && !profile.target_language) {
    if (window.location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Check if teacher is trying to access student-only routes
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'teacher' ? '/teacher' : '/home'} replace />;
  }

  return <>{children}</>;
}
