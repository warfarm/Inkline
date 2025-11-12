import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import type { Class, Profile } from '@/types';

interface StudentProgress {
  student: Profile;
  articles_read: number;
  words_saved: number;
  last_activity: string | null;
  total_time_minutes: number;
}

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && profile) {
      fetchClassDetails();
    }
  }, [id, profile]);

  const fetchClassDetails = async () => {
    if (!id || !profile) return;

    setLoading(true);
    try {
      // Fetch class info
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .eq('teacher_id', profile.id)
        .single();

      if (classError) throw classError;
      setClassInfo(classData);

      // Fetch enrolled students
      const { data: enrollments, error: enrollError } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .eq('class_id', id);

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setStudents([]);
        return;
      }

      const studentIds = enrollments.map((e) => e.student_id);

      // Fetch student profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      if (profileError) throw profileError;

      // Fetch progress data for each student
      const studentsWithProgress = await Promise.all(
        (profiles || []).map(async (student) => {
          const { data: history } = await supabase
            .from('reading_history')
            .select('completed_at, time_spent_seconds')
            .eq('user_id', student.id);

          const { count: wordCount } = await supabase
            .from('word_bank')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', student.id);

          const articlesRead = history?.length || 0;
          const wordsSaved = wordCount || 0;
          const lastActivity =
            history && history.length > 0
              ? history.sort(
                  (a, b) =>
                    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
                )[0].completed_at
              : null;

          const totalSeconds =
            history?.reduce((sum, h) => sum + (h.time_spent_seconds || 0), 0) || 0;
          const totalMinutes = Math.round(totalSeconds / 60);

          return {
            student,
            articles_read: articlesRead,
            words_saved: wordsSaved,
            last_activity: lastActivity,
            total_time_minutes: totalMinutes,
          };
        })
      );

      setStudents(studentsWithProgress);
    } catch (error) {
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!classInfo || students.length === 0) return;

    const headers = [
      'Student Name',
      'Email',
      'Target Language',
      'Level',
      'Articles Read',
      'Words Saved',
      'Total Time (min)',
      'Last Activity',
    ];

    const rows = students.map((s) => [
      s.student.display_name,
      s.student.id, // This is the user ID, could be replaced with email if available
      s.student.target_language === 'zh' ? 'Chinese' : 'Japanese',
      s.student.current_level || 'N/A',
      s.articles_read.toString(),
      s.words_saved.toString(),
      s.total_time_minutes.toString(),
      s.last_activity ? new Date(s.last_activity).toLocaleDateString() : 'Never',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${classInfo.name}_students_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-muted-foreground">Loading class details...</p>
      </Layout>
    );
  }

  if (!classInfo) {
    return (
      <Layout>
        <div className="text-center">
          <p className="mb-4">Class not found</p>
          <Button onClick={() => navigate('/teacher')}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const strugglingStudents = students.filter(
    (s) =>
      s.articles_read < 3 &&
      s.last_activity &&
      new Date().getTime() - new Date(s.last_activity).getTime() > 7 * 24 * 60 * 60 * 1000
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate('/teacher')} className="mb-2 -ml-4">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Classes
            </Button>
            <h2 className="text-3xl font-bold">{classInfo.name}</h2>
            <p className="mt-2 text-muted-foreground">
              {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
            </p>
          </div>
          <div className="space-x-2">
            <Button onClick={exportToCSV} variant="outline" disabled={students.length === 0}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Join Code */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Class Join Code</CardTitle>
            <CardDescription>Students can use this code to join your class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">{classInfo.join_code}</div>
          </CardContent>
        </Card>

        {/* Struggling Students Alert */}
        {strugglingStudents.length > 0 && (
          <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                ⚠️ Students Needing Attention
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                These students haven't been active recently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strugglingStudents.map((s) => (
                  <div
                    key={s.student.id}
                    className="flex items-center justify-between rounded-md bg-background p-3"
                  >
                    <div>
                      <div className="font-medium">{s.student.display_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Last active:{' '}
                        {s.last_activity
                          ? new Date(s.last_activity).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.articles_read} articles read
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Students</h3>
          {students.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No students enrolled yet. Share the join code above to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {students.map((studentProgress) => (
                <Card key={studentProgress.student.id} className="hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{studentProgress.student.display_name}</CardTitle>
                        <CardDescription>
                          {studentProgress.student.target_language === 'zh'
                            ? 'Chinese'
                            : 'Japanese'}{' '}
                          • {studentProgress.student.current_level || 'Level not set'}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {studentProgress.last_activity ? (
                          <>
                            Last active:{' '}
                            {new Date(studentProgress.last_activity).toLocaleDateString()}
                          </>
                        ) : (
                          'No activity yet'
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{studentProgress.articles_read}</div>
                        <div className="text-xs text-muted-foreground">Articles</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{studentProgress.words_saved}</div>
                        <div className="text-xs text-muted-foreground">Words</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {studentProgress.total_time_minutes}
                        </div>
                        <div className="text-xs text-muted-foreground">Minutes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
