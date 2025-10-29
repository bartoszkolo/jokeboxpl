-- Migration: fix_rpc_function_datatypes
-- Created at: 1761762953


-- Drop existing function
DROP FUNCTION IF EXISTS public.get_jokes_with_details(text, integer, integer, text, boolean);

-- Recreate with correct data types matching table columns
CREATE OR REPLACE FUNCTION public.get_jokes_with_details(
  p_status TEXT DEFAULT 'published',
  p_category_id INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_order_by TEXT DEFAULT 'created_at',
  p_ascending BOOLEAN DEFAULT false
)
RETURNS TABLE(
  id INTEGER,
  content TEXT,
  status VARCHAR(20),  -- Changed from TEXT to VARCHAR(20)
  author_id UUID,
  category_id INTEGER,
  slug VARCHAR(255),  -- Changed from TEXT to VARCHAR(255)
  upvotes INTEGER,
  downvotes INTEGER,
  score INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_username VARCHAR(50),  -- Changed from TEXT to VARCHAR(50)
  category_name VARCHAR(100),  -- Changed from TEXT to VARCHAR(100)
  category_slug VARCHAR(100)  -- Changed from TEXT to VARCHAR(100)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.content,
    j.status,
    j.author_id,
    j.category_id,
    j.slug,
    j.upvotes,
    j.downvotes,
    j.score,
    j.created_at,
    j.updated_at,
    p.username as author_username,
    c.name as category_name,
    c.slug as category_slug
  FROM jokes j
  LEFT JOIN profiles p ON j.author_id = p.id
  LEFT JOIN categories c ON j.category_id = c.id
  WHERE 
    (p_status IS NULL OR j.status = p_status)
    AND (p_category_id IS NULL OR j.category_id = p_category_id)
  ORDER BY
    CASE WHEN p_order_by = 'created_at' AND p_ascending = FALSE THEN j.created_at END DESC,
    CASE WHEN p_order_by = 'created_at' AND p_ascending = TRUE THEN j.created_at END ASC,
    CASE WHEN p_order_by = 'score' AND p_ascending = FALSE THEN j.score END DESC,
    CASE WHEN p_order_by = 'score' AND p_ascending = TRUE THEN j.score END ASC
  LIMIT p_limit;
END;
$$;
;