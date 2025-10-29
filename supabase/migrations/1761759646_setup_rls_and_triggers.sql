-- Migration: setup_rls_and_triggers
-- Created at: 1761759646

-- Włączenie RLS dla wszystkich tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies dla profiles
CREATE POLICY "Publiczny odczyt profili" ON profiles FOR SELECT USING (true);
CREATE POLICY "Użytkownicy mogą edytować własny profil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Użytkownicy mogą wstawić własny profil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies dla categories
CREATE POLICY "Publiczny odczyt kategorii" ON categories FOR SELECT USING (true);
CREATE POLICY "Tylko admini mogą zarządzać kategoriami" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Policies dla jokes
CREATE POLICY "Publiczny odczyt opublikowanych dowcipów" ON jokes FOR SELECT USING (status = 'published' OR author_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Zalogowani mogą dodawać dowcipy" ON jokes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Autorzy mogą edytować własne dowcipy" ON jokes FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admini mogą usuwać dowcipy" ON jokes FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Policies dla votes
CREATE POLICY "Użytkownicy widzą własne głosy" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Zalogowani mogą głosować" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Użytkownicy mogą aktualizować własne głosy" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Użytkownicy mogą usuwać własne głosy" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Policies dla favorites
CREATE POLICY "Użytkownicy widzą własne ulubione" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Zalogowani mogą dodawać ulubione" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Użytkownicy mogą usuwać własne ulubione" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Trigger: Automatyczne tworzenie profilu przy rejestracji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE TRIGGER on_joke_updated
  BEFORE UPDATE ON jokes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();;