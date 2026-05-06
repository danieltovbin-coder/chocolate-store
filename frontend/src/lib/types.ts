export type Candy = {
  id: string;
  name: string;
  slug: string;
  description: string;
  origin: string | null;
  price_cents: number;
  image_url: string;
  tags: string[];
  in_stock: boolean;
  created_at: string;
};

export type CartLine = {
  candyId: string;
  quantity: number;
};

export type CheckoutPayload = {
  customer_name: string;
  customer_email: string;
  items: { candy_id: string; quantity: number }[];
};

export type CheckoutResponse = {
  order_id: string;
  total_cents: number;
};
