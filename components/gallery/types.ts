export interface Artwork {
  id: string;
  title: string;
  image_url: string;
  category: string;
  type: string;
  created_at: string;
}

export interface ArtworkCategory {
  id: string;
  name: string;
  created_at?: string;
}

export interface ArtworkType {
  id: string;
  name: string;
  created_at?: string;
}

export interface ConversionResult {
  blob: Blob;
  wasResized: boolean;
}

export const CATEGORY_NAME_MAX = 15;
export const THEME_NAME_MAX = 20;
export const ARTWORK_TITLE_MAX = 40; 