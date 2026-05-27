CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_gallery_category_order
  ON gallery(category, display_order, id);

CREATE TABLE IF NOT EXISTS verified_artworks (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Loys',
  creation_date TEXT NOT NULL,
  commissioner TEXT NOT NULL,
  status TEXT NOT NULL,
  character_name TEXT,
  commission_type TEXT,
  medium TEXT,
  resolution TEXT,
  aspect_ratio TEXT,
  unique_commission TEXT,
  one_of_one TEXT,
  commercial_rights TEXT,
  reproduction_limit TEXT,
  original_owner TEXT,
  transferable TEXT,
  process_images TEXT,
  timelapse_url TEXT,
  reference_url TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_verified_artwork_id ON verified_artworks(artwork_id);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, endpoint, window_start)
);
