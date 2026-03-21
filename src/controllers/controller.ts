import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../models/product.js"
import type { ProductWithId } from "../types/types.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export const getProds = async (_req: FastifyRequest, reply: any) => {
  reply.code(200).send(getAllProducts());
}

export const getProd = async (req: FastifyRequest<{Params: ProductWithId}>, reply: FastifyReply) => {
  const { id } = req.params;
  if (!id) {
    return reply.code(400).send({message: 'Invalid UUID'});
  };
  const product = getProductById(id);
  if (!product) {
    return reply.code(404).send({message: 'Product not found'});
  };
  reply.code(200).send(product);
}

export const createProd = async (req: FastifyRequest<{Body: ProductWithId}>, reply: FastifyReply) => {
  const product = req.body;
  if(!product.name || 
    !product.description || 
    !product.category || 
    product.price <= 0 || 
    typeof product.inStock === 'boolean') {
    return reply.code(400).send({message: 'Invalid input'});
  }
  const newProduct = createProduct(product);
  reply.code(200).send(newProduct);
}

export const updateProd = async (req: FastifyRequest<{Params: ProductWithId, Body: ProductWithId}>, reply: FastifyReply) => {
  const { id } = req.params;
  if (!id) {
    return reply.code(400).send({message: 'Invalid UUID'});
  };
  const product = updateProduct(id, req.body);
  if (!product) {
    return reply.code(404).send({message: 'Product not found'});
  };
  reply.code(200).send(product);
}

export const deleteProd = async (req: FastifyRequest<{Params: ProductWithId}>, reply: FastifyReply) => {
  const {id} = req.params;
  if (!id) {
    return reply.code(400).send({message: 'Invalid UUID'});
  };
  const product = deleteProduct(id);
  if (!product) {
    return reply.code(404).send({message: 'Product not found'});
  };
  reply.code(200).send(product);
}