import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateClassDialog } from '@/components/teacher/CreateClassDialog';
import type { Class } from '@/types';

interface ClassWithStudents extends Class {
  student_count: number;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchClasses();
    }
  }, [profile]);

  const fetchClasses = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Fetch classes first
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', profile.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        setClasses([]);
        return;
      }

      // If no classes, return early
      if (!classesData || classesData.length === 0) {
        setClasses([]);
        return;
      }

      // Fetch enrollment counts for each class separately
      const classesWithCounts = await Promise.all(
        classesData.map(async (cls) => {
          try {
            const { count, error: countError } = await supabase
              .from('class_enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', cls.id);

            if (countError) {
              console.error('Error counting enrollments:', countError);
              return { ...cls, student_count: 0 };
            }

            return {
              ...cls,
              student_count: count || 0,
            };
          } catch (err) {
            console.error('Error in enrollment count:', err);
            return { ...cls, student_count: 0 };
          }
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const archiveClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .update({ archived: true })
        .eq('id', classId);

      if (error) throw error;
      fetchClasses();
    } catch (error) {
      console.error('Error archiving class:', error);
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Classes</h2>
          <p className="mt-2 text-muted-foreground">
            Manage your classes and track student progress
          </p>
        </div>
        <CreateClassDialog onClassCreated={fetchClasses} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading classes...</p>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No classes yet. Create your first class to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>{cls.name}</CardTitle>
                <CardDescription>
                  {cls.student_count} {cls.student_count === 1 ? 'student' : 'students'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-3">
                  <div className="text-xs text-muted-foreground mb-1">Join Code</div>
                  <div className="font-mono text-lg font-bold">{cls.join_code}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/teacher/class/${cls.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveClass(cls.id);
                    }}
                  >
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
