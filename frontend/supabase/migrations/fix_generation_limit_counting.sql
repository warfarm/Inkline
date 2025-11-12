-- Migration: Fix generation limit counting
-- Description: Separates limit checking from incrementing to prevent counting failed generations

-- 1. Replace check_generation_limit to ONLY check, not increment
CREATE OR REPLACE FUNCTION check_generation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 5; -- Daily limit
BEGIN
  -- Get today's generation count
  SELECT COALESCE(count, 0) INTO v_count
  FROM generation_limits
  WHERE user_id = p_user_id
    AND generation_date = CURRENT_DATE;

  -- Only check if under limit (don't increment here)
  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create new function to increment count after successful generation
CREATE OR REPLACE FUNCTION increment_generation_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Upsert the count
  INSERT INTO generation_limits (user_id, generation_date, count, last_generated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, NOW())
  ON CONFLICT (user_id, generation_date)
  DO UPDATE SET
    count = generation_limits.count + 1,
    last_generated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION check_generation_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_generation_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_remaining_generations(UUID) TO authenticated;
