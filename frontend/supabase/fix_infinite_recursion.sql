-- Complete fix for infinite recursion in RLS policies
-- This removes all circular dependencies between classes and class_enrollments

-- ============================================
-- STEP 1: Drop ALL existing policies
-- ============================================

-- Drop class policies
DROP POLICY IF EXISTS "Teachers can manage own classes" ON classes;
DROP POLICY IF EXISTS "Students can view enrolled classes" ON classes;

-- Drop enrollment policies
DROP POLICY IF EXISTS "Teachers can manage class enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Teachers can view all enrollments for their classes" ON class_enrollments;
DROP POLICY IF EXISTS "Teachers can insert enrollments for their classes" ON class_enrollments;
DROP POLICY IF EXISTS "Teachers can delete enrollments for their classes" ON class_enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON class_enrollments;

-- ============================================
-- STEP 2: Create NEW policies without circular dependencies
-- ============================================

-- Classes table policies (NO reference to enrollments)
CREATE POLICY "Teachers can view own classes" ON classes
  FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own classes" ON classes
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON classes
  FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON classes
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Class enrollments policies (uses simple class_id check)
CREATE POLICY "View enrollments if teacher owns class" ON class_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
    OR auth.uid() = class_enrollments.student_id
  );

CREATE POLICY "Insert enrollments as student" ON class_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Delete enrollments if teacher" ON class_enrollments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION: Test that policies work
-- ============================================
-- After running this, test by:
-- 1. Creating a class as a teacher
-- 2. Viewing classes as a teacher
-- 3. Students joining a class
