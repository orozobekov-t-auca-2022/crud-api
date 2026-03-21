import { createProd, deleteProd, getProd, getProds, updateProd } from "../controllers/controller.js";
import type { FastifyInstance } from "fastify";



export default async function routes(fastify: FastifyInstance) {
  fastify.get('/api/products', getProds);
  fastify.get('/api/products/:productId', getProd);
  fastify.post('/api/products', createProd);
  fastify.put('/api/products/:productId', updateProd);
  fastify.delete('/api/products/:productId', deleteProd);
}