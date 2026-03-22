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

test('full CRUD flow', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/products',
    payload: validProduct
  });

  assert.equal(res.statusCode, 201);
  
  const newProduct = res.json();
  assert.ok(newProduct.id);
  assert.equal(newProduct.name, validProduct.name);

  const getRes = await app.inject({
    method: 'GET',
    url: `/api/products/${newProduct.id}`,
  });
  assert.equal(getRes.statusCode, 200);
  assert.equal(getRes.json().id, newProduct.id);

  const updatePayload = {
    ...validProduct,
    name: 'Harry Potter book',
    price: 120,
  }
  const updatedRes = await app.inject({
    method: 'PUT',
    url: '/api/products/' + newProduct.id,
    payload: updatePayload
  })
  assert.equal(updatedRes.statusCode, 200);
  assert.equal(updatedRes.json().id, newProduct.id);
  assert.equal(updatedRes.json().name, 'Harry Potter book');
  assert.equal(updatedRes.json().price, 120);

  const deleteRes = await app.inject({
    method: 'DELETE',
    url: '/api/products/' + newProduct.id,
  });
  assert.equal(deleteRes.statusCode, 204);

  const getDeleteRes = await app.inject({
    method: 'GET',
    url: '/api/products/' + newProduct.id,
  })
  assert.equal(getDeleteRes.statusCode, 404);
  assert.equal(getDeleteRes.json().message, 'Product not found');
})

test('invalid UUID return 400', async () => {
  const fakeUUID = 'fakeUUID';
  const res = await app.inject({
    method: 'GET',
    url: `/api/products/${fakeUUID}`,
  });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json().message, 'Invalid UUID');
})

test('invalid POST body returns 400', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/products',
    payload: {
      name: 'Watch',
      description: 'Watch description',
      price: 0,
      category: 'electronics',
      inStock: true
    }
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.json().message, 'Invalid input');
});

test('unknown route returns 404', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/fake/route'
  });

  assert.equal(res.statusCode, 404);
  assert.equal(res.json().message, 'Route not found');
});