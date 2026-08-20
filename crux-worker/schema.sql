-- CRUX D1 SQLite Database Schema
CREATE TABLE IF NOT EXISTS crux_content (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'CRUX',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    short_text TEXT,
    author TEXT DEFAULT 'UTCRUX',
    category TEXT DEFAULT 'GENERAL',
    image_url TEXT,
    visibility TEXT DEFAULT 'PUBLIC',
    status TEXT DEFAULT 'PUBLISHED',
    priority INTEGER DEFAULT 10,
    published_at TEXT NOT NULL,
    scheduled_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    expires_at TEXT,
    question TEXT,
    options TEXT,
    correct_answer TEXT,
    explanation TEXT,
    difficulty TEXT,
    points INTEGER DEFAULT 10
);

-- Index for performant feed queries sorted by priority and published_at
CREATE INDEX IF NOT EXISTS idx_feed_sorting ON crux_content (status, visibility, priority DESC, published_at DESC);
