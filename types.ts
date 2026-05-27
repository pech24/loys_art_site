
export interface CommissionTier {
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  features: string[];
}

export enum ArtworkCategory {
    PORTRAIT = 'Portrait',
    FULL_ILLUSTRATION = 'Full Illustration'
}

export interface Artwork {
  id: string;
  title: string;
  category: ArtworkCategory | string;
  imageUrl: string;
  order?: number;
  lore?: string;
  specs?: {
    timeTaken?: string;
    tools?: string[];
    canvasSize?: string;
  };
}

export interface VerifiedArtwork {
  artworkId: string;
  title: string;
  imageUrl: string;
  artist: string;
  creationDate: string;
  commissioner: string;
  status: 'Commissioned' | 'Personal Work';
  processImages?: string;
  // GIA Report Fields
  characterName?: string;
  commissionType?: string;
  medium?: string;
  resolution?: string;
  aspectRatio?: string;
  uniqueCommission?: string;
  oneOfOne?: string;
  commercialRights?: string;
  reproductionLimit?: string;
  originalOwner?: string;
  transferable?: string;
  timelapseUrl?: string;
  referenceUrl?: string;
}

export type WaitlistStatus = 'Pending' | 'Sketching' | 'Rendering' | 'Finished' | 'On Hold' | 'Waiting' | 'Thumbnail' | 'Sketch & Lineart' | 'Coloring';

export interface WaitlistEntry {
  id: number;
  username: string;
  commissionType: string;
  status: WaitlistStatus;
  type?: 'rush' | 'normal';
}