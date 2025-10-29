-- Migration: setup_rls_policies
-- Created at: 1761759670

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
CREATE POLICY "Użytkownicy mogą usuwać własne ulubione" ON favorites FOR DELETE USING (auth.uid() = user_id);;