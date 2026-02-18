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