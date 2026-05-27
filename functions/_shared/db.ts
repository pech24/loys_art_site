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
  let row = await db.prepare('SELECT * FROM verified_artworks WHERE id = ?').bind(id).first<VerifiedRow>();
  if (row) return row;
  row = await db.prepare('SELECT * FROM verified_artworks WHERE artwork_id = ?').bind(id).first<VerifiedRow>();
  return row ?? null;
}
