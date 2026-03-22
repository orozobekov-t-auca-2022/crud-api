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

export type StoreAction = "getAllProducts" | "getProductById" | "createProduct" | "updateProduct" | "deleteProduct";

export type StoreRequest = {
  type: "store_request";
  requestId: string;
  action: StoreAction;
  payload?: unknown;
};

export type StoreResponse = {
  type: "store_response";
  requestId: string;
  ok: boolean;
  data?: unknown;
  error?: string;
};

export type WorkerPayloadMap = Record<number, { port: number }>;

export type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};