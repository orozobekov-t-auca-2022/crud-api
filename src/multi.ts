import cluster from "node:cluster";
import http from "node:http";
import { availableParallelism } from "node:os";
import dotenv from "dotenv";
import { buildApp } from "./server.js";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "./models/product.js";
import type { Product, WorkerPayloadMap, StoreRequest, StoreResponse } from "./types/types.js";

dotenv.config();

const basePort = Number(process.env.PORT ?? 4000);
const workersCount = Math.max(1, availableParallelism() - 1);
const workerPorts = Array.from({ length: workersCount }, (_, idx) => basePort + idx + 1);

if (cluster.isPrimary) {
  const workerByPort = new Map<number, cluster.Worker>();
  const workerPayloadMap: WorkerPayloadMap = {};
  let roundRobinIndex = 0;

  function forkWorker(port: number) {
    const worker = cluster.fork({
      ...process.env,
      WORKER_PORT: String(port),
      USE_IPC_STORE: "true",
    });

    workerByPort.set(port, worker);
    workerPayloadMap[worker.id] = { port };

    worker.on("message", (message: Partial<StoreRequest>) => {
      const msg = message;
      if (msg?.type !== "store_request" || typeof msg.requestId !== "string") {
        return;
      }

      const response: StoreResponse = {
        type: "store_response",
        requestId: msg.requestId,
        ok: true,
      };

      try {
        switch (msg.action) {
          case "getAllProducts": {
            response.data = getAllProducts();
            break;
          }
          case "getProductById": {
            const payload = msg.payload as { id: string };
            response.data = getProductById(payload.id);
            break;
          }
          case "createProduct": {
            const payload = msg.payload as { newProduct: Product };
            response.data = createProduct(payload.newProduct);
            break;
          }
          case "updateProduct": {
            const payload = msg.payload as { id: string; data: Product };
            response.data = updateProduct(payload.id, payload.data);
            break;
          }
          case "deleteProduct": {
            const payload = msg.payload as { id: string };
            response.data = deleteProduct(payload.id);
            break;
          }
          default: {
            response.ok = false;
            response.error = "Unknown store action";
          }
        }
      } catch (err) {
        response.ok = false;
        response.error = err instanceof Error ? err.message : "Store operation failed";
      }

      worker.send(response);
    });
  }

  for (const port of workerPorts) {
    forkWorker(port);
  }

  cluster.on("exit", (worker) => {
    const payload = workerPayloadMap[worker.id];
    if (!payload) {
      return;
    }

    const { port } = payload;
    delete workerPayloadMap[worker.id];
    workerByPort.delete(port);
    forkWorker(port);
  });

  const balancer = http.createServer((req, res) => {
    const targetPort = workerPorts[roundRobinIndex];
    roundRobinIndex = (roundRobinIndex + 1) % workerPorts.length;

    const proxyReq = http.request(
      {
        hostname: "127.0.0.1",
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      },
    );

    proxyReq.on("error", () => {
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "Bad gateway" }));
    });

    req.pipe(proxyReq, { end: true });
  });

  balancer.listen(basePort, "0.0.0.0", () => {
    console.log(`Load balancer listening on port ${basePort}`);
    console.log(`Workers listening on: ${workerPorts.join(", ")}`);
  });
} else {
  const workerPort = Number(process.env.WORKER_PORT);
  const app = buildApp();

  app
    .listen({ port: workerPort, host: "127.0.0.1" })
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
}
