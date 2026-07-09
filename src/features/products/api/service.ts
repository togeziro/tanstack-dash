// ============================================================
// Product Service — Server-function wrappers
// ============================================================
// These wrappers expose the server-only data access (PostgreSQL via
// Drizzle) as TanStack Start server functions. The actual DB module is
// imported dynamically inside each handler, so the `postgres` driver is
// never bundled into the client. Response shapes (ProductsResponse /
// ProductByIdResponse) are preserved so routes & components are untouched.

import { createServerFn } from '@tanstack/react-start';
import type { ProductFilters, ProductMutationPayload } from './types';

export const getProductsFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as ProductFilters)
  .handler(async ({ data }) => {
    const { getProducts } = await import('@/lib/db/products');
    return getProducts(data);
  });

export const getProductByIdFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as number)
  .handler(async ({ data: id }) => {
    const { getProductById } = await import('@/lib/db/products');
    return getProductById(id);
  });

export const createProductFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as ProductMutationPayload)
  .handler(async ({ data }) => {
    const { createProduct } = await import('@/lib/db/products');
    return createProduct(data);
  });

export const updateProductFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { id: number; values: ProductMutationPayload })
  .handler(async ({ data: { id, values } }) => {
    const { updateProduct } = await import('@/lib/db/products');
    return updateProduct(id, values);
  });

export const deleteProductFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as number)
  .handler(async ({ data: id }) => {
    const { deleteProduct } = await import('@/lib/db/products');
    return deleteProduct(id);
  });
