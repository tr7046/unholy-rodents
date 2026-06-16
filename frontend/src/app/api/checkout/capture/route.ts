import { NextRequest, NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/order-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const PAYMENT_API_TIMEOUT = 15_000;

export const dynamic = 'force-dynamic';

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }>;
    };
  }>;
}

interface PayPalErrorResponse {
  name?: string;
  message?: string;
  details?: Array<{ issue?: string; description?: string }>;
}

interface ProviderConfig {
  isConfigured: boolean;
  mode: string;
  [key: string]: unknown;
}

interface PaymentConfig {
  activeProvider: string | null;
  paypal: ProviderConfig;
  [key: string]: unknown;
}

async function getPayPalConfig(): Promise<ProviderConfig | null> {
  try {
    const res = await fetch(`${API_URL}/admin/payment-config/decrypted`, {
      cache: 'no-store',
      headers: { 'X-Internal-API-Key': process.env.INTERNAL_API_KEY || '' },
    });
    if (!res.ok) return null;
    const config: PaymentConfig = await res.json();
    if (config.activeProvider !== 'paypal' || !config.paypal?.isConfigured) return null;
    return config.paypal;
  } catch {
    return null;
  }
}

/**
 * POST /api/checkout/capture
 *
 * Called by the success page after PayPal redirects back.
 * Captures the approved PayPal order and fulfills our internal order.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, orderId } = body;

    if (!token || !orderId) {
      return NextResponse.json({ error: 'Missing token or orderId' }, { status: 400 });
    }

    const config = await getPayPalConfig();
    if (!config) {
      return NextResponse.json({ error: 'PayPal is not configured' }, { status: 503 });
    }

    const clientId = config.clientId as string;
    const clientSecret = config.clientSecret as string;
    const isSandbox = config.mode === 'sandbox';
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
      console.error('[capture] PayPal auth failed');
      return NextResponse.json({ error: 'PayPal authentication failed' }, { status: 500 });
    }

    const { access_token } = await tokenRes.json();

    // Capture the approved order
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      signal: AbortSignal.timeout(PAYMENT_API_TIMEOUT),
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle already-captured orders (idempotent)
    if (!captureRes.ok) {
      const errorData: PayPalErrorResponse = await captureRes.json().catch(() => ({}));
      const isAlreadyCaptured = errorData.details?.some(d => d.issue === 'ORDER_ALREADY_CAPTURED');

      if (isAlreadyCaptured) {
        console.log(`[capture] PayPal order ${token} already captured, fulfilling`);
        await fulfillOrder(orderId, { provider: 'paypal', paypalOrderId: token, note: 'already-captured' });
        return NextResponse.json({ success: true, alreadyCaptured: true });
      }

      console.error('[capture] PayPal capture failed:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Payment capture failed' },
        { status: 500 },
      );
    }

    const captureData: PayPalCaptureResponse = await captureRes.json();

    if (captureData.status !== 'COMPLETED') {
      console.error(`[capture] PayPal capture status: ${captureData.status}`);
      return NextResponse.json(
        { error: `Payment not completed. Status: ${captureData.status}` },
        { status: 400 },
      );
    }

    // Verify the custom_id matches our order (security check)
    const customId = captureData.purchase_units?.[0]?.custom_id;
    if (customId && customId !== orderId) {
      console.error(`[capture] Order ID mismatch: expected ${orderId}, got ${customId}`);
      return NextResponse.json({ error: 'Order verification failed' }, { status: 400 });
    }

    // Fulfill the order — update status + decrement stock
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const fulfilled = await fulfillOrder(orderId, {
      provider: 'paypal',
      paypalOrderId: token,
      captureId,
    });

    if (!fulfilled) {
      console.error(`[capture] Failed to fulfill order ${orderId}`);
      // Payment was captured but fulfillment failed — admin should investigate
      return NextResponse.json({ error: 'Payment captured but order update failed. Contact support.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[capture] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
