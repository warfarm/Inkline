import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function JoinClass() {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode.trim()) return;

    setLoading(true);
    try {
      // Find the class by join code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, teacher_id')
        .eq('join_code', joinCode.trim())
        .eq('archived', false)
        .single();

      if (classError || !classData) {
        toast.error('Invalid join code', {
          description: 'Please check the code and try again',
          duration: 3000,
        });
        return;
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('class_enrollments')
        .select('id')
        .eq('class_id', classData.id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (existingEnrollment) {
        toast.info('Already enrolled', {
          description: `You're already in ${classData.name}`,
          duration: 3000,
        });
        setJoinCode('');
        return;
      }

      // Enroll the student
      const { error: enrollError } = await supabase
        .from('class_enrollments')
        .insert({
          class_id: classData.id,
          student_id: user.id,
        });

      if (enrollError) throw enrollError;

      toast.success('Successfully joined class!', {
        description: `You're now enrolled in ${classData.name}`,
        duration: 3000,
      });
      setJoinCode('');
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error('Failed to join class', {
        description: 'Please try again',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Join a Class</h2>
          <p className="mt-2 text-muted-foreground">
            Enter the class code provided by your teacher to join their class
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Code</CardTitle>
            <CardDescription>
              Your teacher will provide you with a unique code to join their class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinClass} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode">Enter Class Code</Label>
                <Input
                  id="joinCode"
                  type="text"
                  placeholder="e.g., ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="font-mono text-lg"
                  maxLength={10}
                />
              </div>
              <Button type="submit" disabled={loading || !joinCode.trim()} className="w-full">
                {loading ? 'Joining...' : 'Join Class'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Why join a class?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Your teacher can track your reading progress</p>
            <p>• Get personalized feedback and support</p>
            <p>• Access class-specific resources and assignments</p>
            <p>• You can join multiple classes if needed</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
