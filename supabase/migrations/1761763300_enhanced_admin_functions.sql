-- Migration: enhanced_admin_functions
-- Created at: 1761763300

-- Enhanced function for admin joke management with full filtering and pagination
CREATE OR REPLACE FUNCTION get_jokes_admin(
  p_status TEXT DEFAULT NULL,
  p_category_id INTEGER DEFAULT NULL,
  p_author_username TEXT DEFAULT NULL,
  p_search_content TEXT DEFAULT NULL,
  p_order_by TEXT DEFAULT 'created_at',
  p_ascending BOOLEAN DEFAULT FALSE,
  p_offset INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 10
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
  category_slug TEXT,
  total_count BIGINT
) AS $$
DECLARE
  total_count_result BIGINT;
BEGIN
  -- Count total matching records for pagination
  SELECT COUNT(*) INTO total_count_result
  FROM jokes j
  LEFT JOIN profiles p ON j.author_id = p.id
  WHERE
    (p_status IS NULL OR j.status = p_status)
    AND (p_category_id IS NULL OR j.category_id = p_category_id)
    AND (p_author_username IS NULL OR p.username ILIKE p_author_username)
    AND (p_search_content IS NULL OR j.content ILIKE '%' || p_search_content || '%');

  -- Main query with pagination
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
    c.slug as category_slug,
    total_count_result
  FROM jokes j
  LEFT JOIN profiles p ON j.author_id = p.id
  LEFT JOIN categories c ON j.category_id = c.id
  WHERE
    (p_status IS NULL OR j.status = p_status)
    AND (p_category_id IS NULL OR j.category_id = p_category_id)
    AND (p_author_username IS NULL OR p.username ILIKE p_author_username)
    AND (p_search_content IS NULL OR j.content ILIKE '%' || p_search_content || '%')
  ORDER BY
    CASE
      WHEN p_order_by = 'created_at' AND p_ascending = FALSE THEN j.created_at
    END DESC,
    CASE
      WHEN p_order_by = 'created_at' AND p_ascending = TRUE THEN j.created_at
    END ASC,
    CASE
      WHEN p_order_by = 'score' AND p_ascending = FALSE THEN j.score
    END DESC,
    CASE
      WHEN p_order_by = 'score' AND p_ascending = TRUE THEN j.score
    END ASC,
    CASE
      WHEN p_order_by = 'upvotes' AND p_ascending = FALSE THEN j.upvotes
    END DESC,
    CASE
      WHEN p_order_by = 'upvotes' AND p_ascending = TRUE THEN j.upvotes
    END ASC,
    CASE
      WHEN p_order_by = 'content' AND p_ascending = FALSE THEN j.content
    END DESC,
    CASE
      WHEN p_order_by = 'content' AND p_ascending = TRUE THEN j.content
    END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  total_jokes BIGINT,
  pending_jokes BIGINT,
  published_jokes BIGINT,
  rejected_jokes BIGINT,
  total_users BIGINT,
  admin_users BIGINT,
  total_categories BIGINT,
  total_votes BIGINT,
  recent_jokes JSONB,
  recent_users JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH joke_stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'published') as published,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected
    FROM jokes
  ),
  user_stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_admin = true) as admin_count
    FROM profiles
  ),
  recent_data AS (
    SELECT
      jsonb_agg(
        jsonb_build_object(
          'id', j.id,
          'content', LEFT(j.content, 100),
          'status', j.status,
          'created_at', j.created_at,
          'author_username', p.username,
          'category_name', c.name
        )
      ) FILTER (WHERE j.id IS NOT NULL) as recent_jokes,
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'username', p.username,
          'created_at', p.created_at
        )
      ) FILTER (WHERE p.id IS NOT NULL) as recent_users
    FROM (
      SELECT j.id, j.content, j.status, j.created_at, j.author_id, j.category_id
      FROM jokes j
      ORDER BY j.created_at DESC
      LIMIT 5
    ) j
    LEFT JOIN profiles p ON j.author_id = p.id
    LEFT JOIN categories c ON j.category_id = c.id
    CROSS JOIN (
      SELECT p.id, p.username, p.created_at
      FROM profiles p
      ORDER BY p.created_at DESC
      LIMIT 3
    ) p
  )
  SELECT
    js.total,
    js.pending,
    js.published,
    js.rejected,
    us.total,
    us.admin_count,
    (SELECT COUNT(*) FROM categories),
    (SELECT COUNT(*) FROM votes),
    rd.recent_jokes,
    rd.recent_users
  FROM joke_stats js, user_stats us, recent_data rd;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users with statistics
CREATE OR REPLACE FUNCTION get_users_admin(
  p_search_username TEXT DEFAULT NULL,
  p_is_admin BOOLEAN DEFAULT NULL,
  p_order_by TEXT DEFAULT 'created_at',
  p_ascending BOOLEAN DEFAULT FALSE,
  p_offset INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  is_admin BOOLEAN,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  jokes_count BIGINT,
  total_count BIGINT
) AS $$
DECLARE
  total_count_result BIGINT;
BEGIN
  -- Count total matching records for pagination
  SELECT COUNT(*) INTO total_count_result
  FROM profiles p
  WHERE
    (p_search_username IS NULL OR p.username ILIKE '%' || p_search_username || '%')
    AND (p_is_admin IS NULL OR p.is_admin = p_is_admin);

  -- Main query with pagination
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.is_admin,
    p.created_at,
    p.last_sign_in_at,
    COALESCE(jc.jokes_count, 0) as jokes_count,
    total_count_result
  FROM profiles p
  LEFT JOIN (
    SELECT
      author_id,
      COUNT(*) as jokes_count
    FROM jokes
    GROUP BY author_id
  ) jc ON p.id = jc.author_id
  WHERE
    (p_search_username IS NULL OR p.username ILIKE '%' || p_search_username || '%')
    AND (p_is_admin IS NULL OR p.is_admin = p_is_admin)
  ORDER BY
    CASE
      WHEN p_order_by = 'created_at' AND p_ascending = FALSE THEN p.created_at
    END DESC,
    CASE
      WHEN p_order_by = 'created_at' AND p_ascending = TRUE THEN p.created_at
    END ASC,
    CASE
      WHEN p_order_by = 'username' AND p_ascending = FALSE THEN p.username
    END DESC,
    CASE
      WHEN p_order_by = 'username' AND p_ascending = TRUE THEN p.username
    END ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (admin check will be done via RLS)
GRANT EXECUTE ON FUNCTION get_jokes_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_admin TO authenticated;