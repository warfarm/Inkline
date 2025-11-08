import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (loading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      // If no profile exists, create one for new users
      if (!profile && user && !isCreatingProfile) {
        setIsCreatingProfile(true);
        try {
          const { error } = await supabase.from('profiles').insert({
            id: user.id,
            role: 'student',
            display_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
            interests: [],
          });

          if (error) {
            // Profile might already exist, just refresh
            console.log('Profile creation error (might already exist):', error);
          }

          // Refresh profile after creation
          await refreshProfile();
          setIsCreatingProfile(false);
          navigate('/onboarding');
          return;
        } catch (error) {
          console.error('Error creating profile:', error);
          setIsCreatingProfile(false);
          navigate('/login');
          return;
        }
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
  }, [user, profile, loading, navigate, refreshProfile, isCreatingProfile]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
      <div className="text-center space-y-4">
        <div className="text-lg font-medium">Completing sign in...</div>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
