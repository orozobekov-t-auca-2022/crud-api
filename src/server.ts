import Fastify from 'fastify';
import routes from './routes/products.js';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true
})

fastify.register(routes);

const PORT = process.env.PORT;

fastify.setNotFoundHandler((req, reply) => {
  reply.code(404).send({ message: 'Route not found' });
});

fastify.setErrorHandler((err, req, reply) => {
  console.error(err);
  reply.code(500).send({ message: 'Internal server error' });
});

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT)})
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()