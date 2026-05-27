import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'seed.json'), 'utf8'));

function esc(value) {
  if (value === undefined || value === null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

const lines = ['-- Auto-generated from data/seed.json', 'PRAGMA foreign_keys = OFF;'];

for (const row of data.gallery) {
  lines.push(
    `INSERT OR REPLACE INTO gallery (id, title, category, image_url, display_order, created_at, updated_at) VALUES (${esc(row.id)}, ${esc(row.title)}, ${esc(row.category)}, ${esc(row.imageUrl)}, ${row.order ?? 0}, ${esc(row.createdAt)}, ${esc(row.updatedAt)});`
  );
}

for (const row of data.verified_artworks) {
  lines.push(
    `INSERT OR REPLACE INTO verified_artworks (
      id, artwork_id, title, image_url, artist, creation_date, commissioner, status,
      character_name, commission_type, medium, resolution, aspect_ratio,
      unique_commission, one_of_one, commercial_rights, reproduction_limit,
      original_owner, transferable, process_images, timelapse_url, reference_url, updated_at
    ) VALUES (
      ${esc(row.id)}, ${esc(row.artworkId)}, ${esc(row.title)}, ${esc(row.imageUrl)}, ${esc(row.artist ?? 'Loys')},
      ${esc(row.creationDate)}, ${esc(row.commissioner)}, ${esc(row.status)},
      ${esc(row.characterName)}, ${esc(row.commissionType)}, ${esc(row.medium)}, ${esc(row.resolution)}, ${esc(row.aspectRatio)},
      ${esc(row.uniqueCommission)}, ${esc(row.oneOfOne)}, ${esc(row.commercialRights)}, ${esc(row.reproductionLimit)},
      ${esc(row.originalOwner)}, ${esc(row.transferable)}, ${esc(row.processImages ?? '')},
      ${esc(row.timelapseUrl)}, ${esc(row.referenceUrl)}, ${esc(row.updatedAt)}
    );`
  );
}

writeFileSync(join(root, 'migrations', '0002_seed.sql'), lines.join('\n') + '\n');
console.log('Wrote migrations/0002_seed.sql');
