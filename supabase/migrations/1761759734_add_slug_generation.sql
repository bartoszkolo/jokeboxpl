-- Migration: add_slug_generation
-- Created at: 1761759734

-- Funkcja do generowania slug z polskich znaków
CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    slug := LOWER(text_input);
    
    -- Zamiana polskich znaków
    slug := REPLACE(slug, 'ą', 'a');
    slug := REPLACE(slug, 'ć', 'c');
    slug := REPLACE(slug, 'ę', 'e');
    slug := REPLACE(slug, 'ł', 'l');
    slug := REPLACE(slug, 'ń', 'n');
    slug := REPLACE(slug, 'ó', 'o');
    slug := REPLACE(slug, 'ś', 's');
    slug := REPLACE(slug, 'ź', 'z');
    slug := REPLACE(slug, 'ż', 'z');
    
    -- Usunięcie znaków specjalnych i zamiana spacji na myślniki
    slug := REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g');
    slug := REGEXP_REPLACE(slug, '\s+', '-', 'g');
    slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
    slug := TRIM(BOTH '-' FROM slug);
    
    -- Ograniczenie długości
    slug := SUBSTRING(slug FROM 1 FOR 50);
    slug := TRIM(BOTH '-' FROM slug);
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funkcja do generowania unikalnego slug dla dowcipu
CREATE OR REPLACE FUNCTION public.generate_joke_slug(joke_content TEXT, joke_id INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Wygeneruj bazowy slug z pierwszych słów treści dowcipu
    base_slug := public.slugify(SUBSTRING(joke_content FROM 1 FOR 100));
    
    -- Jeśli slug jest pusty, użyj losowej wartości
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'dowcip-' || FLOOR(RANDOM() * 100000);
    END IF;
    
    final_slug := base_slug;
    
    -- Sprawdź czy slug jest unikalny i dodaj licznik jeśli potrzeba
    WHILE EXISTS (
        SELECT 1 FROM jokes 
        WHERE slug = final_slug 
        AND (joke_id IS NULL OR id != joke_id)
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznego generowania slug przy dodawaniu dowcipu
CREATE OR REPLACE FUNCTION public.set_joke_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_joke_slug(NEW.content, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_joke_slug_trigger ON jokes;
CREATE TRIGGER set_joke_slug_trigger
    BEFORE INSERT OR UPDATE ON jokes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_joke_slug();;