-- Fix RLS policies to avoid infinite recursion
-- Run this in Supabase SQL Editor if you encounter infinite recursion errors

-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can manage class enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON class_enrollments;

-- Recreate enrollment policies without circular dependency
CREATE POLICY "Teachers can view all enrollments for their classes" ON class_enrollments
  FOR SELECT
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert enrollments for their classes" ON class_enrollments
  FOR INSERT
  WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete enrollments for their classes" ON class_enrollments
  FOR DELETE
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own enrollments" ON class_enrollments
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own enrollments" ON class_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);
