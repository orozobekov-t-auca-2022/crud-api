import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/controller.js";


export default async function routes(fastify: any) {
  fastify.get('/api/products', getProducts);
  fastify.get('/api/products/:productId', getProduct);
  fastify.post('/api/products', createProduct);
  fastify.put('/api/products/:productId', updateProduct);
  fastify.delete('/api/products/:productId', deleteProduct);
}