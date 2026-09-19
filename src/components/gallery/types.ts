export interface Artwork {
  id: string;
  title: string;
  image_url: string;
  category: string;
  type: string;
  created_at: string;
  /**
   * Medidas do arquivo enviado. Anulaveis: obra gravada antes da migracao
   * 20260919140000 nao tem, e o card cai no comportamento antigo.
   */
  width?: number | null;
  height?: number | null;
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
  /** Medidas depois do redimensionamento — e o que vai para o banco. */
  width: number;
  height: number;
}

export const CATEGORY_NAME_MAX = 15;
export const THEME_NAME_MAX = 20;
export const ARTWORK_TITLE_MAX = 40; 