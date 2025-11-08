import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Class, Profile } from '@/types';
import { toast } from 'sonner';

interface EnrolledClass extends Class {
  teacher?: Profile;
  student_count?: number;
}

export default function MyClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledClasses();
    }
  }, [user]);

  const fetchEnrolledClasses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get class enrollments for this student
      const { data: enrollments, error: enrollError } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', user.id);

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setClasses([]);
        setLoading(false);
        return;
      }

      const classIds = enrollments.map((e) => e.class_id);

      // Fetch class details
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
        .eq('archived', false);

      if (classesError) throw classesError;

      // Fetch teacher info and student counts for each class
      const classesWithDetails = await Promise.all(
        (classesData || []).map(async (cls) => {
          // Get teacher profile
          const { data: teacherData } = await supabase
            .from('profiles')
            .select('display_name, id')
            .eq('id', cls.teacher_id)
            .single();

          // Get student count
          const { count } = await supabase
            .from('class_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return {
            ...cls,
            teacher: teacherData || undefined,
            student_count: count || 0,
          };
        })
      );

      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Error fetching enrolled classes:', error);
      toast.error('Failed to load classes', {
        description: 'Please try again',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClass = async (classId: string, className: string) => {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to leave "${className}"? You can rejoin later with the class code.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', user.id);

      if (error) throw error;

      toast.success('Left class', {
        description: `You have left ${className}`,
        duration: 3000,
      });

      // Refresh the list
      fetchEnrolledClasses();
    } catch (error) {
      console.error('Error leaving class:', error);
      toast.error('Failed to leave class', {
        description: 'Please try again',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-muted-foreground">Loading your classes...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">My Classes</h2>
          <p className="mt-2 text-muted-foreground">
            Classes you're currently enrolled in
          </p>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">
                You're not enrolled in any classes yet.
              </p>
              <Button onClick={() => (window.location.href = '/join-class')}>
                Join a Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle>{cls.name}</CardTitle>
                  <CardDescription>
                    {cls.teacher?.display_name || 'Teacher'}
                    {' • '}
                    {cls.student_count} {cls.student_count === 1 ? 'student' : 'students'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-xs text-muted-foreground mb-1">Class Code</div>
                    <div className="font-mono text-lg font-bold">{cls.join_code}</div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Joined {new Date(cls.created_at).toLocaleDateString()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleLeaveClass(cls.id, cls.name)}
                  >
                    Leave Class
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
