import {
  getAllProducts as getAllProductsLocal,
  getProductById as getProductByIdLocal,
  createProduct as createProductLocal,
  updateProduct as updateProductLocal,
  deleteProduct as deleteProductLocal,
} from "../models/product.js";
import type { Product, ProductWithId, PendingRequest, StoreAction, StoreRequest, StoreResponse } from "../types/types.js";

const useIpcStore = process.env.USE_IPC_STORE === "true";
const pending = new Map<string, PendingRequest>();
let requestCounter = 0;
let ipcListenerInitialized = false;

function ensureIpcListener() {
  if (!useIpcStore || ipcListenerInitialized) {
    return;
  }

  process.on("message", (message: Partial<StoreResponse>) => {
    const msg = message;
    if (msg?.type !== "store_response" || typeof msg.requestId !== "string") {
      return;
    }

    const pendingRequest = pending.get(msg.requestId);
    if (!pendingRequest) {
      return;
    }

    clearTimeout(pendingRequest.timeout);
    pending.delete(msg.requestId);

    if (!msg.ok) {
      pendingRequest.reject(new Error(msg.error ?? "IPC store error"));
      return;
    }

    pendingRequest.resolve(msg.data);
  });

  ipcListenerInitialized = true;
}

function sendStoreRequest<T>(action: StoreAction, payload?: unknown): Promise<T> {
  if (!process.send) {
    return Promise.reject(new Error("IPC is not available in this process"));
  }

  ensureIpcListener();

  requestCounter += 1;
  const requestId = `${process.pid}-${requestCounter}`;

  const request: StoreRequest = {
    type: "store_request",
    requestId,
    action,
    payload,
  };

  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error("IPC request timeout"));
    }, 5000);

    pending.set(requestId, {
      resolve: (value) => resolve(value as T),
      reject,
      timeout,
    });

    process.send?.(request);
  });
}

export async function getAllProducts(): Promise<ProductWithId[]> {
  if (!useIpcStore) {
    return getAllProductsLocal();
  }
  return sendStoreRequest<ProductWithId[]>("getAllProducts");
}

export async function getProductById(id: string): Promise<ProductWithId | undefined> {
  if (!useIpcStore) {
    return getProductByIdLocal(id);
  }
  return sendStoreRequest<ProductWithId | undefined>("getProductById", { id });
}

export async function createProduct(newProduct: Product): Promise<ProductWithId> {
  if (!useIpcStore) {
    return createProductLocal(newProduct);
  }
  return sendStoreRequest<ProductWithId>("createProduct", { newProduct });
}

export async function updateProduct(id: string, data: Product): Promise<ProductWithId | null> {
  if (!useIpcStore) {
    return updateProductLocal(id, data);
  }
  return sendStoreRequest<ProductWithId | null>("updateProduct", { id, data });
}

export async function deleteProduct(id: string): Promise<boolean | null> {
  if (!useIpcStore) {
    return deleteProductLocal(id);
  }
  return sendStoreRequest<boolean | null>("deleteProduct", { id });
}
