import { randomUUID } from "node:crypto";
import { Product, ProductWithId } from "../types/types.js";

const products: ProductWithId[] = [];

export function getAllProducts() {
  return products;
}

export function getProductById(id: string) {
  return products.find(product => product.id === id);
}

export function createProduct(newProduct: Product){
  const product = { id: randomUUID(), ...newProduct};
  products.push(product);
  return product;
}

export function updateProduct(id: string, data: Product) {
  const product = getProductById(id);
  if (!product) {
    return null;
  }
  Object.assign(product, data);
  return product;
}

export function deleteProduct(id: string) {
  const index = products.findIndex(product => product.id === id);
  if(index === -1) {
    return null;
  }
  products.splice(index, 1);
  return true;
}

export function clearProducts() {
  products.length = 0;
}