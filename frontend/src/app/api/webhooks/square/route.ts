import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { fulfillOrder } from '@/lib/order-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const dynamic = 'force-dynamic';

interface SquarePayment {
  id: string;
  status: string;
  order_id?: string;
  amount_money?: { amount: number; currency: string };
}

interface SquareEvent {
  type: string;
  data?: {
    type?: string;
    id?: string;
    object?: {
      payment?: SquarePayment;
    };
  };
}

function verifySquareSignature(
  rawBody: string,
  signature: string,
  signatureKey: string,
  notificationUrl: string,
): boolean {
  // Square signs: notificationUrl + rawBody
  const payload = notificationUrl + rawBody;
  const expected = createHmac('sha256', signatureKey).update(payload).digest('base64');

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function getSquareConfig(): Promise<{ accessToken: string; signatureKey: string; mode: string } | null> {
  try {
    const res = await fetch(`${API_URL}/admin/payment-config/decrypted`, {
      cache: 'no-store',
      headers: { 'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '' },
    });
    if (!res.ok) return null;
    const config = await res.json();
    if (!config.square?.isConfigured) return null;
    return {
      accessToken: config.square.accessToken as string,
      signatureKey: config.square.webhookSignatureKey as string,
      mode: config.square.mode as string,
    };
  } catch {
    return null;
  }
}

/**
 * Look up a Square order to get the reference_id (our order ID).
 */
async function getOrderReferenceId(
  squareOrderId: string,
  accessToken: string,
  isSandbox: boolean,
): Promise<string | null> {
  const baseUrl = isSandbox ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
  try {
    const res = await fetch(`${baseUrl}/v2/orders/${squareOrderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': '2026-01-22',
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.order?.reference_id as string) || null;
  } catch {
    return null;
  }
}

/**
 * POST /api/webhooks/square
 *
 * Handles Square webhook events. Primary mechanism for confirming payment.
 * Must be registered in Square Developer Dashboard → Webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-square-hmacsha256-signature');

    const squareConfig = await getSquareConfig();
    if (!squareConfig) {
      console.error('[square-webhook] Square not configured');
      return NextResponse.json({ error: 'Square not configured' }, { status: 503 });
    }

    // Verify signature if key is configured
    if (squareConfig.signatureKey && signature) {
      const notificationUrl = request.url;
      if (!verifySquareSignature(rawBody, signature, squareConfig.signatureKey, notificationUrl)) {
        console.error('[square-webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else if (!squareConfig.signatureKey) {
      console.warn('[square-webhook] No signature key configured — skipping verification');
    }

    const event: SquareEvent = JSON.parse(rawBody);

    if (event.type === 'payment.updated') {
      const payment = event.data?.object?.payment;
      if (!payment) {
        return NextResponse.json({ received: true });
      }

      if (payment.status === 'COMPLETED' && payment.order_id) {
        const isSandbox = squareConfig.mode === 'sandbox';
        const orderId = await getOrderReferenceId(payment.order_id, squareConfig.accessToken, isSandbox);

        if (orderId) {
          await fulfillOrder(orderId, {
            provider: 'square',
            squarePaymentId: payment.id,
            squareOrderId: payment.order_id,
            amount: payment.amount_money,
          });
        } else {
          console.error(`[square-webhook] Could not resolve reference_id for Square order ${payment.order_id}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[square-webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
