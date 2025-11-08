-- Fix RLS policy to allow students to look up classes by join code
-- This allows students to find and join classes without being enrolled first

-- Add a policy to allow anyone to look up non-archived classes
-- This is safe because join codes are meant to be shared publicly with students
-- Drop first in case it already exists
DROP POLICY IF EXISTS "Anyone can lookup non-archived classes" ON classes;

CREATE POLICY "Anyone can lookup non-archived classes" ON classes
  FOR SELECT
  USING (archived = false);
