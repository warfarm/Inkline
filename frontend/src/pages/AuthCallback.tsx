import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!profile) {
        navigate('/home');
      } else if (!profile.target_language || profile.interests.length === 0) {
        navigate('/onboarding');
      } else if (profile.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/home');
      }
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Completing sign in...</div>
    </div>
  );
}
