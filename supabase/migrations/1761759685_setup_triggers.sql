-- Migration: setup_triggers
-- Created at: 1761759685

-- Trigger: Automatyczne aktualizowanie score przy zmianie głosów
CREATE OR REPLACE FUNCTION public.update_joke_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Aktualizuj upvotes, downvotes i score dla dowcipu
  UPDATE jokes
  SET 
    upvotes = (SELECT COUNT(*) FROM votes WHERE joke_id = COALESCE(NEW.joke_id, OLD.joke_id) AND vote_value = 1),
    downvotes = (SELECT COUNT(*) FROM votes WHERE joke_id = COALESCE(NEW.joke_id, OLD.joke_id) AND vote_value = -1),
    score = (SELECT COALESCE(SUM(vote_value), 0) FROM votes WHERE joke_id = COALESCE(NEW.joke_id, OLD.joke_id))
  WHERE id = COALESCE(NEW.joke_id, OLD.joke_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_changed ON votes;
CREATE TRIGGER on_vote_changed
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION public.update_joke_score();

-- Trigger: Automatyczne aktualizowanie updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_joke_updated ON jokes;
CREATE TRIGGER on_joke_updated
  BEFORE UPDATE ON jokes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();;