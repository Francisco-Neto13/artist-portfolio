export interface Commission {
  id: string;
  title: string;
  price: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export type CommissionStatus = 'open' | 'closed' | 'waitlist';
export const DESCRIPTION_MAX = 300;