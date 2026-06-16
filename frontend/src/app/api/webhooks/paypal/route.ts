import { NextRequest, NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/order-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const PAYMENT_API_TIMEOUT = 15_000;

export const dynamic = 'force-dynamic';

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status?: string;
    custom_id?: string;
    amount?: { value: string; currency_code: string };
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
  };
}

async function getPayPalConfig(): Promise<{
  clientId: string;
  clientSecret: string;
  mode: string;
  webhookId?: string;
} | null> {
  try {
    const res = await fetch(`${API_URL}/admin/payment-config/decrypted`, {
      cache: 'no-store',
      headers: { 'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '' },
    });
    if (!res.ok) return null;
    const config = await res.json();
    if (!config.paypal?.isConfigured) return null;
    return {
      clientId: config.paypal.clientId as string,
      clientSecret: config.paypal.clientSecret as string,
      mode: config.paypal.mode as string,
      webhookId: config.paypal.webhookId as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Verify PayPal webhook signature via their API.
 */
async function verifyPayPalWebhook(
  request: NextRequest,
  rawBody: string,
  config: { clientId: string; clientSecret: string; mode: string; webhookId?: string },
): Promise<boolean> {
  if (!config.webhookId) {
    console.warn('[paypal-webhook] No webhookId configured — skipping signature verification');
    return true;
  }

  const isSandbox = config.mode === 'sandbox';
  const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

  // Get access token
  const authString = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    signal: AbortSignal.timeout(PAYMENT_API_TIMEOUT),
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) return false;
  const { access_token } = await tokenRes.json();

  // Verify webhook signature
  const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    signal: AbortSignal.timeout(PAYMENT_API_TIMEOUT),
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: request.headers.get('paypal-auth-algo'),
      cert_url: request.headers.get('paypal-cert-url'),
      transmission_id: request.headers.get('paypal-transmission-id'),
      transmission_sig: request.headers.get('paypal-transmission-sig'),
      transmission_time: request.headers.get('paypal-transmission-time'),
      webhook_id: config.webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  if (!verifyRes.ok) return false;
  const result = await verifyRes.json();
  return result.verification_status === 'SUCCESS';
}

/**
 * POST /api/webhooks/paypal
 *
 * Backup webhook for PayPal. Primary capture happens on the success page.
 * This catches edge cases where capture succeeded but fulfillment failed.
 * Must be registered in PayPal Developer Dashboard → Webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const config = await getPayPalConfig();

    if (!config) {
      console.error('[paypal-webhook] PayPal not configured');
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 503 });
    }

    // Verify signature
    const verified = await verifyPayPalWebhook(request, rawBody, config);
    if (!verified) {
      console.error('[paypal-webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event: PayPalWebhookEvent = JSON.parse(rawBody);

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const capture = event.resource;
      const orderId = capture.custom_id;

      if (orderId) {
        await fulfillOrder(orderId, {
          provider: 'paypal',
          captureId: capture.id,
          paypalOrderId: capture.supplementary_data?.related_ids?.order_id,
          webhookEventId: event.id,
        });
      } else {
        console.warn(`[paypal-webhook] No custom_id in capture ${capture.id}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[paypal-webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
