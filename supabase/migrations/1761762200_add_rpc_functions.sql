-- Migration: add_rpc_functions
-- Created at: 1761762200

-- Funkcja do pobierania dowcipów z pełnymi danymi
CREATE OR REPLACE FUNCTION get_jokes_with_details(
  p_status TEXT DEFAULT 'published',
  p_category_id INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_order_by TEXT DEFAULT 'created_at',
  p_ascending BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id INTEGER,
  content TEXT,
  status TEXT,
  author_id UUID,
  category_id INTEGER,
  slug TEXT,
  upvotes INTEGER,
  downvotes INTEGER,
  score INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_username TEXT,
  category_name TEXT,
  category_slug TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uprawnienia dla anon
GRANT EXECUTE ON FUNCTION get_jokes_with_details TO anon, authenticated;;