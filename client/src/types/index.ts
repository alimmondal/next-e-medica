export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  price: number; // price should be a number, not a string
  brand: string;
  rating: number; // rating should be a number, not a string
  numReviews: number;
  stock: number;
  description: string;
  isFeatured?: boolean; // optional property
  banner?: string; // optional property
}
