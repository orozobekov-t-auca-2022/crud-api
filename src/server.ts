import Fastify from 'fastify';
import routes from './routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

export function buildApp() {
  const fastify = Fastify({
    logger: true
  })

  fastify.register(routes);

  fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: 'Route not found' });
  });

  fastify.setErrorHandler((err, req, reply) => {
    console.error(err);
    reply.code(500).send({ message: 'Internal server error' });
  });

  return fastify;
}
