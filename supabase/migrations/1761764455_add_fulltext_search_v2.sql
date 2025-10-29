-- Migration: add_fulltext_search_v2
-- Created at: 1761764455


-- Dodaj kolumnę tsvector dla full-text search (używamy 'simple' dla wsparcia znaków polskich)
ALTER TABLE jokes ADD COLUMN IF NOT EXISTS content_search tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED;

-- Utworz indeks GIN dla szybkiego wyszukiwania
CREATE INDEX IF NOT EXISTS jokes_content_search_idx ON jokes USING GIN (content_search);

-- Funkcja RPC dla wyszukiwania dowcipów
CREATE OR REPLACE FUNCTION search_jokes(
  search_query TEXT,
  p_category_id INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_order_by TEXT DEFAULT 'relevance'
)
RETURNS TABLE(
  id INTEGER,
  content TEXT,
  status VARCHAR(20),
  author_id UUID,
  category_id INTEGER,
  slug VARCHAR(255),
  upvotes INTEGER,
  downvotes INTEGER,
  score INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  author_username VARCHAR(50),
  category_name VARCHAR(100),
  category_slug VARCHAR(100),
  rank REAL
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
    c.slug as category_slug,
    ts_rank(j.content_search, plainto_tsquery('simple', search_query)) as rank
  FROM jokes j
  LEFT JOIN profiles p ON j.author_id = p.id
  LEFT JOIN categories c ON j.category_id = c.id
  WHERE 
    j.status = 'published'
    AND j.content_search @@ plainto_tsquery('simple', search_query)
    AND (p_category_id IS NULL OR j.category_id = p_category_id)
  ORDER BY
    CASE WHEN p_order_by = 'relevance' THEN ts_rank(j.content_search, plainto_tsquery('simple', search_query)) END DESC,
    CASE WHEN p_order_by = 'created_at' THEN j.created_at END DESC,
    CASE WHEN p_order_by = 'score' THEN j.score END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Funkcja do liczenia wyników wyszukiwania
CREATE OR REPLACE FUNCTION count_search_results(
  search_query TEXT,
  p_category_id INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO result_count
  FROM jokes j
  WHERE 
    j.status = 'published'
    AND j.content_search @@ plainto_tsquery('simple', search_query)
    AND (p_category_id IS NULL OR j.category_id = p_category_id);
  
  RETURN result_count;
END;
$$;
;