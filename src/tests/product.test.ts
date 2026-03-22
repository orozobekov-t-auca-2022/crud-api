import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../server.js";
import { clearProducts } from "../models/product.js";

let app: FastifyInstance;

const validProduct = {
  name: 'Iphone X',
  description: 'smartphone',
  price: 100000,
  category: 'electronics',
  inStock: true,
} as const;

beforeEach(async () => {
  app = buildApp();
  await app.ready();
  clearProducts();
})

afterEach(async () => {
  await app.close();
})

test('GET /api/products returns empty array ([])', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/api/products',
  });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), [])
})
