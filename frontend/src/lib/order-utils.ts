/**
 * Shared order fulfillment utilities.
 * Used by webhook handlers and PayPal capture to update order status
 * and decrement stock after confirmed payment.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const INTERNAL_KEY = () => process.env.INTERNAL_API_KEY || '';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
}

interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  status: string;
  updatedAt?: string;
  paymentDetails?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Decrement stock for the given order items.
 */
async function decrementStock(items: OrderItem[]): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/content/products`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const products: Product[] = Array.isArray(data?.products) ? data.products : [];

    let changed = false;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
          changed = true;
        }
      }
    }

    if (changed) {
      await fetch(`${API_URL}/admin/content/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': INTERNAL_KEY(),
        },
        body: JSON.stringify({ value: { ...data, products } }),
      });
    }
  } catch {
    console.error('[order-utils] Failed to decrement stock');
  }
}

/**
 * Fulfill an order: update status to 'processing' and decrement stock.
 * Idempotent — only fulfills if order is currently 'pending'.
 */
export async function fulfillOrder(
  orderId: string,
  paymentDetails?: Record<string, unknown>,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/admin/content/orders`, {
      cache: 'no-store',
      headers: { 'X-Internal-API-Key': INTERNAL_KEY() },
    });
    if (!res.ok) {
      console.error(`[fulfillOrder] Failed to fetch orders: ${res.status}`);
      return false;
    }

    const data = await res.json();
    const value = data?.value ?? data;
    const orders: Order[] = Array.isArray(value?.orders) ? value.orders : [];

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      console.error(`[fulfillOrder] Order ${orderId} not found`);
      return false;
    }

    // Idempotent: only fulfill pending orders
    if (order.status !== 'pending') {
      console.log(`[fulfillOrder] Order ${orderId} already ${order.status}, skipping`);
      return true;
    }

    // Update order status to processing
    order.status = 'processing';
    order.updatedAt = new Date().toISOString();
    if (paymentDetails) {
      order.paymentDetails = paymentDetails;
    }

    const saveRes = await fetch(`${API_URL}/admin/content/orders`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': INTERNAL_KEY(),
      },
      body: JSON.stringify({ value: { orders } }),
    });

    if (!saveRes.ok) {
      console.error(`[fulfillOrder] Failed to save order: ${saveRes.status}`);
      return false;
    }

    // Decrement stock after confirmed payment
    await decrementStock(order.items);

    console.log(`[fulfillOrder] Order ${orderId} fulfilled successfully`);
    return true;
  } catch (error) {
    console.error('[fulfillOrder] Error:', error);
    return false;
  }
}
