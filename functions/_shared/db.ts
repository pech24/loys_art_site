export interface GalleryRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface VerifiedRow {
  id: string;
  artwork_id: string;
  title: string;
  image_url: string;
  artist: string;
  creation_date: string;
  commissioner: string;
  status: string;
  character_name: string | null;
  commission_type: string | null;
  medium: string | null;
  resolution: string | null;
  aspect_ratio: string | null;
  unique_commission: string | null;
  one_of_one: string | null;
  commercial_rights: string | null;
  reproduction_limit: string | null;
  original_owner: string | null;
  transferable: string | null;
  process_images: string | null;
  timelapse_url: string | null;
  reference_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const fallbackVerifiedRows: VerifiedRow[] = [
  {
    id: 'LYS-01242026-01',
    artwork_id: 'LYS-01242026-01',
    title: 'Cameron',
    image_url: 'https://i.imgur.com/6lYbiQO.png',
    artist: 'Loys',
    creation_date: '2026-01-24',
    commissioner: 'Cameron',
    status: 'Commissioned',
    character_name: '-Discreet-',
    commission_type: 'Full Illustration',
    medium: 'Clip Studio Paint, Photoshop',
    resolution: '1500x1500',
    aspect_ratio: '1:1',
    unique_commission: 'Yes',
    one_of_one: 'Yes',
    commercial_rights: 'No',
    reproduction_limit: '0',
    original_owner: 'Cameron',
    transferable: 'No',
    process_images: '',
    timelapse_url: 'https://youtube.com/shorts/uGmQQo4HfRg',
    reference_url: 'https://i.imgur.com/W9Yyxjm.png',
    created_at: null,
    updated_at: '2026-04-18T07:30:26.379Z',
  },
];

export function galleryToApi(row: GalleryRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.image_url,
    order: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function verifiedToApi(row: VerifiedRow) {
  return {
    artworkId: row.artwork_id,
    title: row.title,
    imageUrl: row.image_url,
    artist: row.artist,
    creationDate: row.creation_date,
    commissioner: row.commissioner,
    status: row.status,
    characterName: row.character_name ?? undefined,
    commissionType: row.commission_type ?? undefined,
    medium: row.medium ?? undefined,
    resolution: row.resolution ?? undefined,
    aspectRatio: row.aspect_ratio ?? undefined,
    uniqueCommission: row.unique_commission ?? undefined,
    oneOfOne: row.one_of_one ?? undefined,
    commercialRights: row.commercial_rights ?? undefined,
    reproductionLimit: row.reproduction_limit ?? undefined,
    originalOwner: row.original_owner ?? undefined,
    transferable: row.transferable ?? undefined,
    processImages: row.process_images ?? undefined,
    timelapseUrl: row.timelapse_url ?? undefined,
    referenceUrl: row.reference_url ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function findVerified(db: D1Database, id: string): Promise<VerifiedRow | null> {
  try {
    let row = await db.prepare('SELECT * FROM verified_artworks WHERE id = ?').bind(id).first<VerifiedRow>();
    if (row) return row;
    row = await db.prepare('SELECT * FROM verified_artworks WHERE artwork_id = ?').bind(id).first<VerifiedRow>();
    return row ?? null;
  } catch (e) {
    console.error('Verified artwork lookup failed; checking fallback seed data', e);
    const normalizedId = id.trim().toLowerCase();
    return fallbackVerifiedRows.find((row) =>
      row.id.toLowerCase() === normalizedId || row.artwork_id.toLowerCase() === normalizedId
    ) ?? null;
  }
}
