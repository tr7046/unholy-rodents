import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { OrderSchema, OrderUpdateSchema, validateRequest } from '@/lib/schemas';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'orders';

type Order = z.infer<typeof OrderSchema> & { id: string; createdAt: string; updatedAt: string };

interface OrdersData {
  orders: Order[];
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
}

interface ProductsData {
  products: Product[];
}

const defaultData: OrdersData = {
  orders: [],
};

// --- Rate Limiting ---
const orderRateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max orders per window per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = orderRateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    orderRateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Clean up stale entries on each rate limit check (serverless-compatible, no setInterval)
function cleanupRateMap(): void {
  const now = Date.now();
  for (const [ip, entry] of orderRateMap) {
    if (now > entry.resetAt) orderRateMap.delete(ip);
  }
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<OrdersData> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}`, {
      cache: 'no-store',
      headers: { 'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '' },
    });
    if (!response.ok) return defaultData;
    const data = await response.json();
    const value = data?.value ?? data;
    return {
      orders: Array.isArray(value?.orders) ? value.orders : defaultData.orders,
    };
  } catch {
    return defaultData;
  }
}

async function saveContentToBackend(data: OrdersData): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ value: data }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function getProductsFromBackend(): Promise<ProductsData> {
  try {
    const response = await fetch(`${API_URL}/content/products`, { cache: 'no-store' });
    if (!response.ok) return { products: [] };
    const data = await response.json();
    return { products: Array.isArray(data?.products) ? data.products : [] };
  } catch {
    return { products: [] };
  }
}

async function getFullProductsFromBackend(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${API_URL}/content/products`, { cache: 'no-store' });
    if (!response.ok) return { products: [] };
    return await response.json();
  } catch {
    return { products: [] };
  }
}

async function saveFullProductsToBackend(data: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`${API_URL}/admin/content/products`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ value: data }),
    });
  } catch {
    console.error('[orders] Failed to update product stock');
  }
}

// Refund stock for an order's items (used when cancelling or deleting orders)
async function refundOrderStock(orderItems: Order['items']): Promise<void> {
  try {
    const fullData = await getFullProductsFromBackend();
    const products = Array.isArray((fullData as { products?: unknown }).products)
      ? (fullData as { products: Product[] }).products
      : [];

    let changed = false;
    for (const item of orderItems) {
      const product = products.find((p: Product) => p.id === item.productId);
      if (product) {
        const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
        if (variant) {
          variant.stock += item.quantity;
          changed = true;
        }
      }
    }

    if (changed) {
      await saveFullProductsToBackend({ ...fullData, products });
    }
  } catch {
    console.error('[orders] Failed to refund stock');
  }
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getContentFromBackend();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check — orders are created server-side via checkout flow or admin
    if (!(await isAuthenticated())) {
      // Also allow internal API key for server-to-server order creation
      const internalKey = request.headers.get('x-internal-api-key');
      const expectedKey = process.env.INTERNAL_API_KEY;
      if (!expectedKey || !internalKey || internalKey !== expectedKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Rate limiting (cleanup on each check — serverless-compatible)
    cleanupRateMap();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many orders. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const validation = validateRequest(OrderSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const order = validation.data;

    // --- Server-side price validation & stock check ---
    const productsData = await getProductsFromBackend();
    const priceErrors: string[] = [];
    const stockErrors: string[] = [];

    for (const item of order.items) {
      const product = productsData.products.find((p: Product) => p.id === item.productId);
      if (!product) {
        priceErrors.push(`Product "${item.productName}" not found`);
        continue;
      }

      const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
      if (!variant) {
        priceErrors.push(`Variant "${item.variantName}" not found for "${item.productName}"`);
        continue;
      }

      // Validate price matches server data
      if (variant.price !== item.price) {
        priceErrors.push(`Price mismatch for "${item.productName}" (${item.variantName}): expected ${variant.price}, got ${item.price}`);
      }

      // Validate stock
      if (variant.stock < item.quantity) {
        stockErrors.push(`Insufficient stock for "${item.productName}" (${item.variantName}): ${variant.stock} available, ${item.quantity} requested`);
      }
    }

    if (priceErrors.length > 0) {
      return NextResponse.json({ error: 'Price validation failed', details: priceErrors }, { status: 400 });
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({ error: 'Insufficient stock', details: stockErrors }, { status: 409 });
    }

    // --- Recalculate totals server-side (never trust client totals) ---
    const serverSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder: Order = {
      ...order,
      id: randomUUID(),
      subtotal: serverSubtotal,
      total: serverSubtotal + order.shipping.cost,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save order atomically
    const appendRes = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ field: 'orders', item: newOrder }),
    });

    if (!appendRes.ok) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Decrement stock (best-effort — order is already saved)
    // Uses getFullProductsFromBackend to preserve shippingRates and other top-level fields
    try {
      const fullData = await getFullProductsFromBackend();
      const fullProducts = Array.isArray((fullData as { products?: unknown }).products)
        ? (fullData as { products: Product[] }).products
        : [];

      for (const item of order.items) {
        const product = fullProducts.find((p: Product) => p.id === item.productId);
        if (product) {
          const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        }
      }

      await saveFullProductsToBackend({ ...fullData, products: fullProducts });
    } catch {
      console.error('[orders] Failed to decrement stock after order creation');
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequest(OrderUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { id, status, trackingNumber } = validation.data;
    const data = await getContentFromBackend();

    const index = data.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = data.orders[index].status;

    data.orders[index] = {
      ...data.orders[index],
      status: status,
      trackingNumber: trackingNumber || data.orders[index].trackingNumber,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveContentToBackend(data);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Refund stock when order is cancelled (only if it wasn't already cancelled)
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await refundOrderStock(data.orders[index].items);
    }

    return NextResponse.json(data.orders[index]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const data = await getContentFromBackend();
    const deletedOrder = data.orders.find((o) => o.id === id);

    if (!deletedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    data.orders = data.orders.filter((o) => o.id !== id);
    const saved = await saveContentToBackend(data);
    if (!saved) {
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }

    // Refund stock for deleted order (unless it was already cancelled/refunded)
    if (deletedOrder.status !== 'cancelled') {
      await refundOrderStock(deletedOrder.items);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
