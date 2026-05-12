CREATE TABLE IF NOT EXISTS daily_puzzles (
  date DATE PRIMARY KEY,
  edition_no INTEGER NOT NULL UNIQUE,
  lineup_artists JSONB NOT NULL,
  theme_pull_quote TEXT,
  marginalia_quote TEXT,
  connections_categories JSONB NOT NULL,
  connections_tiles JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_captures (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,
  edition_id INTEGER REFERENCES daily_puzzles(edition_no),
  device_id TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS email_captures_lower_email_key ON email_captures(LOWER(email));

CREATE TABLE IF NOT EXISTS streaks (
  device_id TEXT PRIMARY KEY,
  current INTEGER NOT NULL DEFAULT 0,
  longest INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  device_id TEXT,
  edition_id INTEGER,
  meta JSONB
);
