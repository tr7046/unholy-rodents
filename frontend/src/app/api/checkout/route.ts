import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const CheckoutItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  variantName: z.string(),
  price: z.number().int().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
});

const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  shippingMethod: z.enum(['standard', 'express']),
  shippingCost: z.number().int().min(0),
});

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  images: string[];
  variants: ProductVariant[];
}

interface ShippingRate {
  name: string;
  price: number;
  estimatedDays: string;
}

interface ShippingRates {
  standard: ShippingRate;
  express: ShippingRate;
  freeShippingThreshold: number;
}

interface ProviderConfig {
  isConfigured: boolean;
  mode: string;
  [key: string]: unknown;
}

interface PaymentConfig {
  activeProvider: string | null;
  stripe: ProviderConfig;
  square: ProviderConfig;
  paypal: ProviderConfig;
}

const DEFAULT_SHIPPING: ShippingRates = {
  standard: { name: 'Standard Shipping', price: 599, estimatedDays: '5-7 business days' },
  express: { name: 'Express Shipping', price: 1299, estimatedDays: '2-3 business days' },
  freeShippingThreshold: 7500,
};

// Timeout for external payment provider API calls (15 seconds)
const PAYMENT_API_TIMEOUT = 15_000;

// Sanitize image URL — only allow http(s) and relative paths, no data: or javascript: URIs
function sanitizeImageUrl(url: string | undefined, origin: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/')) return `${origin}${url}`;
  if (url.startsWith('https://') || url.startsWith('http://')) return url;
  return undefined;
}

export const dynamic = 'force-dynamic';

// Fetch decrypted payment config from backend (server-to-server only)
async function getDecryptedPaymentConfig(): Promise<PaymentConfig | null> {
  try {
    const res = await fetch(`${API_URL}/admin/payment-config/decrypted`, {
      cache: 'no-store',
      headers: { 'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CheckoutSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { items, shippingMethod, shippingCost } = result.data;

    // --- Get decrypted payment config from backend ---
    const paymentConfig = await getDecryptedPaymentConfig();

    if (!paymentConfig?.activeProvider) {
      return NextResponse.json(
        { error: 'Payment processing is not set up yet. Please contact the site admin.' },
        { status: 503 }
      );
    }

    const activeProvider = paymentConfig.activeProvider;
    const providerConfig = paymentConfig[activeProvider as keyof PaymentConfig] as ProviderConfig;

    if (!providerConfig?.isConfigured) {
      return NextResponse.json(
        { error: 'Payment provider is not fully configured. Please contact the site admin.' },
        { status: 503 }
      );
    }

    // --- Validate prices against product data ---
    const productsRes = await fetch(`${API_URL}/content/products`, { cache: 'no-store' });
    if (!productsRes.ok) {
      return NextResponse.json({ error: 'Could not verify product prices' }, { status: 500 });
    }
    const productsData = await productsRes.json();
    const products: Product[] = Array.isArray(productsData?.products) ? productsData.products : [];
    const serverShipping: ShippingRates = productsData?.shippingRates || DEFAULT_SHIPPING;

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productName}` }, { status: 400 });
      }
      const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: `Variant not found: ${item.variantName}` }, { status: 400 });
      }
      if (variant.price !== item.price) {
        return NextResponse.json({ error: `Price changed for ${item.productName}. Please refresh and try again.` }, { status: 409 });
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${item.productName} (${item.variantName})` }, { status: 409 });
      }
    }

    // --- Validate shipping cost server-side ---
    const itemTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const freeShipping = itemTotal >= serverShipping.freeShippingThreshold;
    const expectedShippingCost = freeShipping ? 0 : serverShipping[shippingMethod].price;

    if (shippingCost !== expectedShippingCost) {
      return NextResponse.json(
        { error: 'Shipping cost mismatch. Please refresh and try again.' },
        { status: 409 }
      );
    }

    // --- Create pending order before redirecting to payment ---
    const orderId = randomUUID();
    const total = itemTotal + shippingCost;
    const pendingOrder = {
      id: orderId,
      items: items.map(i => ({
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        price: i.price,
        quantity: i.quantity,
      })),
      customer: {
        name: 'Pending',
        email: 'pending@checkout',
        address: { line1: '', city: '', state: '', zip: '', country: '' },
      },
      shipping: { method: shippingMethod, cost: shippingCost },
      subtotal: itemTotal,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save order atomically via backend append
    const appendRes = await fetch(`${API_URL}/admin/content/orders/append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ field: 'orders', item: pendingOrder }),
    });

    if (!appendRes.ok) {
      console.error('[checkout] Failed to create pending order');
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Decrement stock (best-effort — order is already saved)
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const variant = product.variants.find((v: ProductVariant) => v.id === item.variantId);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
        }
      }
    }
    // Save updated stock
    try {
      await fetch(`${API_URL}/admin/content/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '',
        },
        body: JSON.stringify({ value: { products, shippingRates: serverShipping } }),
      });
    } catch {
      console.error('[checkout] Failed to update stock');
    }

    // --- Route to the correct payment provider ---
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    switch (activeProvider) {
      case 'stripe':
        return await handleStripeCheckout(providerConfig, items, shippingMethod, shippingCost, origin, orderId);

      case 'square':
        return await handleSquareCheckout(providerConfig, items, shippingMethod, shippingCost, origin, orderId);

      case 'paypal':
        return await handlePayPalCheckout(providerConfig, items, shippingMethod, shippingCost, origin, orderId);

      default:
        return NextResponse.json({ error: `Unsupported payment provider: ${activeProvider}` }, { status: 503 });
    }
  } catch (error) {
    console.error('[checkout] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================
// STRIPE CHECKOUT
// ============================================

async function handleStripeCheckout(
  config: ProviderConfig,
  items: z.infer<typeof CheckoutItemSchema>[],
  shippingMethod: string,
  shippingCost: number,
  origin: string,
  orderId: string,
) {
  const secretKey = config.secretKey as string;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe secret key is missing. Go to Settings to add it.' }, { status: 503 });
  }

  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.productName,
        description: item.variantName,
        ...(item.image ? (() => { const safe = sanitizeImageUrl(item.image, origin); return safe && !safe.includes('placeholder') ? { images: [safe] } : {}; })() : {}),
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  if (shippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Shipping (${shippingMethod})`,
          description: shippingMethod === 'express' ? '2-3 business days' : '5-7 business days',
        },
        unit_amount: shippingCost,
      },
      quantity: 1,
    });
  }

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    signal: AbortSignal.timeout(PAYMENT_API_TIMEOUT),
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: buildStripeBody({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/store`,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      metadata: {
        order_id: orderId,
        shipping_method: shippingMethod,
        shipping_cost: String(shippingCost),
      },
    }),
  });

  if (!stripeRes.ok) {
    const errText = await stripeRes.text();
    try { console.error('[checkout] Stripe error:', JSON.parse(errText)); } catch { console.error('[checkout] Stripe error:', errText); }
    return NextResponse.json({ error: 'Failed to create checkout session. Check your Stripe settings.' }, { status: 500 });
  }

  const session = await stripeRes.json();
  return NextResponse.json({ url: session.url });
}

// ============================================
// SQUARE CHECKOUT
// ============================================

async function handleSquareCheckout(
  config: ProviderConfig,
  items: z.infer<typeof CheckoutItemSchema>[],
  shippingMethod: string,
  shippingCost: number,
  origin: string,
  orderId: string,
) {
  const accessToken = config.accessToken as string;
  const locationId = config.locationId as string;
  const isSandbox = config.mode === 'sandbox';

  if (!accessToken || !locationId) {
    return NextResponse.json({ error: 'Square credentials incomplete. Go to Settings to configure.' }, { status: 503 });
  }

  const baseUrl = isSandbox ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';

  // Build Square line items
  const lineItems = items.map(item => ({
    name: `${item.productName} (${item.variantName})`,
    quantity: String(item.quantity),
    base_price_money: {
      amount: item.price,
      currency: 'USD',
    },
  }));

  // Add shipping
  if (shippingCost > 0) {
    lineItems.push({
      name: `Shipping (${shippingMethod})`,
      quantity: '1',
      base_price_money: {
        amount: shippingCost,
        currency: 'USD',
      },
    });
  }

  const squareRes = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
    method: 'POST',
    signal: AbortSignal.timeout(PAYMENT_API_TIMEOUT),
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Square-Version': '2024-01-18',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idempotency_key: orderId,
      quick_pay: undefined,
      order: {
        location_id: locationId,
        line_items: lineItems,
      },
      checkout_options: {
        redirect_url: `${origin}/checkout/success?order_id=${orderId}`,
        ask_for_shipping_address: true,
      },
    }),
  });

  if (!squareRes.ok) {
    const errText = await squareRes.text();
    try { console.error('[checkout] Square error:', JSON.parse(errText)); } catch { console.error('[checkout] Square error:', errText); }
    return NextResponse.json({ error: 'Failed to create Square checkout. Check your Square settings.' }, { status: 500 });
  }

  const data = await squareRes.json();
  const paymentLink = data.payment_link;

  if (!paymentLink?.url) {
    return NextResponse.json({ error: 'Square did not return a checkout URL' }, { status: 500 });
  }

  return NextResponse.json({ url: paymentLink.url });
}

// ============================================
// PAYPAL CHECKOUT
// ============================================

async function handlePayPalCheckout(
  config: ProviderConfig,
  items: z.infer<typeof CheckoutItemSchema>[],
  shippingMethod: string,
  shippingCost: number,
  origin: string,
  orderId: string,
) {
  const clientId = config.clientId as string;
  const clientSecret = config.clientSecret as string;
  const isSandbox = config.mode === 'sandbox';

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'PayPal credentials incomplete. Go to Settings to configure.' }, { status: 503 });
  }

  const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

  // Get access token
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    signal: AbortSignal.timeout(PAYMENT_API_TIMEOUT),
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) {
    console.error('[checkout] PayPal auth failed');
    return NextResponse.json({ error: 'PayPal authentication failed. Check your credentials.' }, { status: 500 });
  }

  const { access_token } = await tokenRes.json();

  // Calculate totals
  const itemTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = itemTotal + shippingCost;

  // Create order
  const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    signal: AbortSignal.timeout(PAYMENT_API_TIMEOUT),
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: (total / 100).toFixed(2),
          breakdown: {
            item_total: { currency_code: 'USD', value: (itemTotal / 100).toFixed(2) },
            shipping: { currency_code: 'USD', value: (shippingCost / 100).toFixed(2) },
          },
        },
        items: items.map(item => ({
          name: item.productName,
          description: item.variantName,
          unit_amount: { currency_code: 'USD', value: (item.price / 100).toFixed(2) },
          quantity: String(item.quantity),
          category: 'PHYSICAL_GOODS',
        })),
        shipping: {
          options: [{
            id: shippingMethod,
            label: shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping',
            selected: true,
            amount: { currency_code: 'USD', value: (shippingCost / 100).toFixed(2) },
          }],
        },
      }],
      application_context: {
        return_url: `${origin}/checkout/success?order_id=${orderId}`,
        cancel_url: `${origin}/store`,
        shipping_preference: 'GET_FROM_FILE',
        user_action: 'PAY_NOW',
      },
    }),
  });

  if (!orderRes.ok) {
    const errText = await orderRes.text();
    try { console.error('[checkout] PayPal order error:', JSON.parse(errText)); } catch { console.error('[checkout] PayPal order error:', errText); }
    return NextResponse.json({ error: 'Failed to create PayPal order. Check your settings.' }, { status: 500 });
  }

  const order = await orderRes.json();
  const approveLink = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve');

  if (!approveLink?.href) {
    return NextResponse.json({ error: 'PayPal did not return a checkout URL' }, { status: 500 });
  }

  return NextResponse.json({ url: approveLink.href });
}

// ============================================
// STRIPE URL ENCODER (no SDK needed)
// ============================================

function buildStripeBody(params: Record<string, unknown>, prefix = ''): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          parts.push(buildStripeBody(item as Record<string, unknown>, `${fullKey}[${index}]`));
        } else {
          parts.push(`${encodeURIComponent(`${fullKey}[${index}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      parts.push(buildStripeBody(value as Record<string, unknown>, fullKey));
    } else if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.filter(Boolean).join('&');
}
