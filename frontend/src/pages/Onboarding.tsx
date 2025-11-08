import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { InterestSurvey } from '@/components/onboarding/InterestSurvey';
import { LevelSelection } from '@/components/onboarding/LevelSelection';
import { ClassJoin } from '@/components/onboarding/ClassJoin';

type OnboardingStep = 'interests' | 'level' | 'class';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('interests');
  const [interests, setInterests] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInterestsNext = (selectedInterests: string[]) => {
    setInterests(selectedInterests);
    setStep('level');
  };

  const handleLevelNext = (selectedLevel: string, selectedLanguage: string) => {
    setLevel(selectedLevel);
    setLanguage(selectedLanguage);
    setStep('class');
  };

  const handleComplete = async (joinCode?: string) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          interests,
          current_level: level,
          target_language: language,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (joinCode && joinCode.trim()) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('join_code', joinCode.trim())
          .single();

        if (classError || !classData) {
          setError('Invalid class code');
          setLoading(false);
          return;
        }

        const { error: enrollError } = await supabase
          .from('class_enrollments')
          .insert({
            class_id: classData.id,
            student_id: user.id,
          });

        if (enrollError) {
          if (enrollError.code === '23505') {
            setError('You are already enrolled in this class');
          } else {
            throw enrollError;
          }
        }
      }

      await refreshProfile();
      navigate('/home');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-2xl">
        {step === 'interests' && <InterestSurvey onNext={handleInterestsNext} />}
        {step === 'level' && (
          <LevelSelection onNext={handleLevelNext} onBack={() => setStep('interests')} />
        )}
        {step === 'class' && (
          <ClassJoin onComplete={handleComplete} onBack={() => setStep('level')} />
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Setting up your profile...
          </div>
        )}
      </div>
    </div>
  );
}
