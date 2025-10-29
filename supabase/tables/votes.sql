CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joke_id INTEGER,
    vote_value INTEGER CHECK (vote_value IN (1,
    -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id,
    joke_id)
);