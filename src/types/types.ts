export interface Product {
  name: string;
  description: string;
  price: number;
  category: "electronics" | "books" | "clothing";
  inStock: boolean
}

export interface ProductWithId extends Product{
  id: string
}