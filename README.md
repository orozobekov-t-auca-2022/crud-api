# Product Catalog CRUD API

Fastify-based CRUD API for a Product Catalog with in-memory storage.

## Requirements

- Node.js 24.10.0 or newer
- npm

## Installation

1. Clone the repository:

	git clone https://github.com/orozobekov-t-auca-2022/crud-api.git

2. Go to the project directory:

	cd crud-api

3. Install dependencies:

	npm install

## Environment Variables

The app uses PORT from .env.

1. Create .env from .env.example:

	copy .env.example .env

2. Example .env:

	PORT=4000

Note: .env should not be committed. Keep .env.example in the repository.

## Available Scripts

- Development mode:

	npm run start:dev

  Starts one server instance with tsx in watch mode.

- Production mode:

	npm run start:prod

  Builds TypeScript and runs the compiled app from dist.

- Horizontal scaling mode (production build):

	npm run start:multi

  Builds TypeScript and starts cluster mode with a load balancer.

- Horizontal scaling mode (development):

	npm run start:multi:dev

- Build only:

	npm run build

- Tests:

	npm test

- Tests in watch mode:

	npm run test:watch

## API Base URL

Single instance mode:

	http://localhost:4000

Cluster mode:

- Load balancer: http://localhost:4000
- Workers: http://localhost:4001, http://localhost:4002, ...

## Product Model

Each product has:

- id: string (uuid, generated on the server)
- name: string (required)
- description: string (required)
- price: number (required, must be greater than 0)
- category: string (required, for example electronics, books, clothing)
- inStock: boolean (required)

## Endpoints

### GET /api/products

- 200: returns all products

### GET /api/products/:productId

- 200: returns product
- 400: invalid uuid
- 404: product not found

### POST /api/products

- 201: created product
- 400: invalid payload (missing required fields or invalid price)

### PUT /api/products/:productId

- 200: updated product
- 400: invalid uuid
- 404: product not found

### DELETE /api/products/:productId

- 204: deleted successfully
- 400: invalid uuid
- 404: product not found

### Unknown routes

- 404: Route not found

### Internal errors

- 500: Internal server error

## Request Examples

Create product:

	curl -X POST http://localhost:4000/api/products \
	  -H "content-type: application/json" \
	  -d "{\"name\":\"Iphone X\",\"description\":\"smartphone\",\"price\":100000,\"category\":\"electronics\",\"inStock\":true}"

Get all products:

	curl http://localhost:4000/api/products

Get product by id:

	curl http://localhost:4000/api/products/<productId>

Update product:

	curl -X PUT http://localhost:4000/api/products/<productId> \
	  -H "content-type: application/json" \
	  -d "{\"name\":\"Iphone X Updated\",\"description\":\"smartphone\",\"price\":120000,\"category\":\"electronics\",\"inStock\":true}"

Delete product:

	curl -X DELETE http://localhost:4000/api/products/<productId>

## Horizontal Scaling Details

In cluster mode:

- The load balancer listens on PORT.
- Worker processes listen on PORT + n.
- Requests to the load balancer are distributed in round-robin order.
- Product state is shared through IPC with the primary process, so data remains consistent across workers.

Example when PORT=4000 and available parallelism is 4:

- Load balancer: localhost:4000
- Workers: localhost:4001, localhost:4002, localhost:4003

## Testing

The repository includes API tests covering:

- empty list retrieval
- full CRUD flow
- invalid uuid handling
- invalid payload handling
- unknown route handling

Run tests with:

	npm test
