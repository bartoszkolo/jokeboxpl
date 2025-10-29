CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description_seo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);