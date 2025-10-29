-- Migration: add_foreign_keys
-- Created at: 1761761824

-- Dodaj foreign keys dla relationships

-- jokes -> profiles (author)
ALTER TABLE jokes
ADD CONSTRAINT jokes_author_id_fkey
FOREIGN KEY (author_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- jokes -> categories
ALTER TABLE jokes
ADD CONSTRAINT jokes_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE SET NULL;

-- votes -> users
ALTER TABLE votes
ADD CONSTRAINT votes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- votes -> jokes
ALTER TABLE votes
ADD CONSTRAINT votes_joke_id_fkey
FOREIGN KEY (joke_id)
REFERENCES jokes(id)
ON DELETE CASCADE;

-- favorites -> users
ALTER TABLE favorites
ADD CONSTRAINT favorites_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- favorites -> jokes
ALTER TABLE favorites
ADD CONSTRAINT favorites_joke_id_fkey
FOREIGN KEY (joke_id)
REFERENCES jokes(id)
ON DELETE CASCADE;;