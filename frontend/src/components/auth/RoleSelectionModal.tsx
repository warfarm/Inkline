import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function RoleSelectionModal({ open }: { open: boolean }) {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');

  const handleRoleSelect = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        role: selectedRole,
        display_name: user.user_metadata.full_name || user.email || 'User',
        native_language: 'en',
      });

      if (insertError) throw insertError;

      await refreshProfile();

      if (selectedRole === 'student') {
        navigate('/onboarding');
      } else {
        navigate('/teacher');
      }
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Dialog open={open}>
        <DialogContent
          className="sm:max-w-md bg-white border-gray-300 shadow-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideOverlay
        >
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">Choose Your Role</DialogTitle>
          <DialogDescription className="text-gray-600">
            Select how you'll be using the platform
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card
            className={`cursor-pointer p-6 transition-all hover:border-blue-600 bg-white ${
              selectedRole === 'student' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-300'
            }`}
            onClick={() => setSelectedRole('student')}
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Student</h3>
              <p className="text-sm text-gray-600">
                I want to learn Chinese or Japanese through interactive reading
              </p>
            </div>
          </Card>
          <Card
            className={`cursor-pointer p-6 transition-all hover:border-blue-600 bg-white ${
              selectedRole === 'teacher' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-300'
            }`}
            onClick={() => setSelectedRole('teacher')}
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Teacher</h3>
              <p className="text-sm text-gray-600">
                I want to create classes and track student progress
              </p>
            </div>
          </Card>
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button
          onClick={handleRoleSelect}
          disabled={!selectedRole || loading}
          className="w-full"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
