import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // First, check for hash params (OAuth callback)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorParam = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      if (errorParam) {
        console.error('Auth error:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (loading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      // If no profile exists, redirect to home (role selection will be shown by ProtectedRoute)
      if (!profile && user) {
        navigate('/home');
        return;
      }

      // Handle existing users
      if (profile) {
        if (!profile.target_language || profile.interests.length === 0) {
          navigate('/onboarding');
        } else if (profile.role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/home');
        }
      }
    };

    handleCallback();
  }, [user, profile, loading, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-lg font-medium text-destructive">Authentication Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
          <div className="text-xs text-muted-foreground">Redirecting to login page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-center space-y-4">
        <div className="text-lg font-medium">Completing sign in...</div>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
