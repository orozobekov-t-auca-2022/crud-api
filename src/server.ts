import Fastify from 'fastify';
import routes from './routes/products.js';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true
})

fastify.register(routes);

const PORT = process.env.PORT;

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT)})
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()