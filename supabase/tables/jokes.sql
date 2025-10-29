CREATE TABLE jokes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending',
    'published',
    'rejected')),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category_id INTEGER,
    slug VARCHAR(255) UNIQUE NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);