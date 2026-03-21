import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../models/product.js"
import type { Product } from "../types/types.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { validateUUID } from "../utils/validateUUID.js";

type ProductIdParams = {
  productId: string;
};

export const getProds = async (_req: FastifyRequest, reply: FastifyReply) => {
  reply.code(200).send(getAllProducts());
}

export const getProd = async (req: FastifyRequest<{ Params: ProductIdParams }>, reply: FastifyReply) => {
  const { productId } = req.params;
  if (!validateUUID(productId)) {
    return reply.code(400).send({message: 'Invalid UUID'});
  };
  const product = getProductById(productId);
  if (!product) {
    return reply.code(404).send({message: 'Product not found'});
  };
  reply.code(200).send(product);
}

export const createProd = async (req: FastifyRequest<{ Body: Product }>, reply: FastifyReply) => {
  const product = req.body;
  if(!product.name || 
    !product.description || 
    !product.category || 
    product.price <= 0 || 
    typeof product.inStock !== 'boolean') {
    return reply.code(400).send({message: 'Invalid input'});
  }
  const newProduct = createProduct(product);
  reply.code(201).send(newProduct);
}

export const updateProd = async (req: FastifyRequest<{ Params: ProductIdParams, Body: Product }>, reply: FastifyReply) => {
  const { productId } = req.params;
  if (!validateUUID(productId)) {
    return reply.code(400).send({message: 'Invalid UUID'});
  };
  const product = updateProduct(productId, req.body);
  if (!product) {
    return reply.code(404).send({message: 'Product not found'});
  };
  reply.code(200).send(product);
}

export const deleteProd = async (req: FastifyRequest<{ Params: ProductIdParams }>, reply: FastifyReply) => {
  const { productId } = req.params;
  if (!validateUUID(productId)) {
    return reply.code(400).send({message: 'Invalid UUID'});
  };
  const product = deleteProduct(productId);
  if (!product) {
    return reply.code(404).send({message: 'Product not found'});
  };
  reply.code(204).send();
}