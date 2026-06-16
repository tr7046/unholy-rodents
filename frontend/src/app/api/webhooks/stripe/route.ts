import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { fulfillOrder } from '@/lib/order-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const SIGNATURE_TOLERANCE = 300; // 5 minutes

export const dynamic = 'force-dynamic';

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_status?: string;
      metadata?: Record<string, string>;
      amount_total?: number;
      currency?: string;
      customer_email?: string;
    };
  };
}

function verifyStripeSignature(payload: string, signature: string, secret: string): boolean {
  const elements = signature.split(',');
  const timestampStr = elements.find(e => e.startsWith('t='))?.slice(2);
  const v1Sig = elements.find(e => e.startsWith('v1='))?.slice(3);

  if (!timestampStr || !v1Sig) return false;

  const timestamp = parseInt(timestampStr, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - timestamp > SIGNATURE_TOLERANCE) {
    console.error('[stripe-webhook] Signature timestamp too old');
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1Sig));
  } catch {
    return false;
  }
}

async function getWebhookSecret(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/admin/payment-config/decrypted`, {
      cache: 'no-store',
      headers: { 'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '' },
    });
    if (!res.ok) return null;
    const config = await res.json();
    return (config.stripe?.webhookSecret as string) || null;
  } catch {
    return null;
  }
}

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. Primary mechanism for confirming payment.
 * Must be registered in Stripe Dashboard → Webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
    }

    const webhookSecret = await getWebhookSecret();
    if (!webhookSecret) {
      console.error('[stripe-webhook] Webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
    }

    if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
      console.error('[stripe-webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event: StripeEvent = JSON.parse(rawBody);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.order_id;

        if (!orderId) {
          console.error('[stripe-webhook] No order_id in session metadata');
          return NextResponse.json({ received: true });
        }

        if (session.payment_status === 'paid') {
          await fulfillOrder(orderId, {
            provider: 'stripe',
            stripeSessionId: session.id,
            amountTotal: session.amount_total,
            currency: session.currency,
          });
        } else {
          console.log(`[stripe-webhook] Session ${session.id} payment_status: ${session.payment_status}`);
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        // Handles ACH, bank transfers, etc.
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await fulfillOrder(orderId, {
            provider: 'stripe',
            stripeSessionId: session.id,
            asyncPayment: true,
          });
        }
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
