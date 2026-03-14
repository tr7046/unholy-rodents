import { Router, Request, Response } from 'express';
import { prisma } from '../../db';
import { encrypt, decrypt, isEncrypted } from '../../utils/encryption';

const router = Router();
const CONTENT_KEY = 'payment_config';

// Fields that must be encrypted per provider
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  stripe: ['secretKey', 'webhookSecret'],
  square: ['accessToken', 'webhookSignatureKey'],
  paypal: ['clientSecret'],
};

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

const defaultConfig: PaymentConfig = {
  activeProvider: null,
  stripe: { publishableKey: '', secretKey: '', webhookSecret: '', mode: 'test', isConfigured: false },
  square: { applicationId: '', accessToken: '', locationId: '', webhookSignatureKey: '', mode: 'sandbox', isConfigured: false },
  paypal: { clientId: '', clientSecret: '', mode: 'sandbox', isConfigured: false },
};

function maskSecret(value: string): string {
  if (!value || value.length < 8) return '••••••••';
  return value.substring(0, 7) + '•'.repeat(Math.min(20, value.length - 7));
}

function decryptProviderSecrets(provider: string, config: ProviderConfig): ProviderConfig {
  const result = { ...config };
  const fields = ENCRYPTED_FIELDS[provider] || [];

  for (const field of fields) {
    const val = result[field];
    if (typeof val === 'string' && val && isEncrypted(val)) {
      try {
        result[field] = decrypt(val);
      } catch {
        // If decryption fails, leave as-is
      }
    }
  }

  return result;
}

function maskProviderSecrets(provider: string, config: ProviderConfig): ProviderConfig {
  const result = { ...config };
  const fields = ENCRYPTED_FIELDS[provider] || [];

  for (const field of fields) {
    const val = result[field];
    if (typeof val === 'string' && val) {
      // Decrypt first if encrypted, then mask
      let plaintext = val;
      if (isEncrypted(val)) {
        try {
          plaintext = decrypt(val);
        } catch {
          plaintext = val;
        }
      }
      result[field] = maskSecret(plaintext);
    }
  }

  return result;
}

function encryptProviderSecrets(provider: string, newConfig: ProviderConfig, existingConfig?: ProviderConfig): ProviderConfig {
  const result = { ...newConfig };
  const fields = ENCRYPTED_FIELDS[provider] || [];

  for (const field of fields) {
    const val = result[field];
    if (typeof val === 'string' && val) {
      // If value contains mask characters, keep the existing encrypted value
      if (val.includes('••')) {
        if (existingConfig && typeof existingConfig[field] === 'string') {
          result[field] = existingConfig[field];
        }
        continue;
      }
      // Skip if already encrypted
      if (isEncrypted(val)) continue;
      // Encrypt the plaintext
      result[field] = encrypt(val);
    }
  }

  return result;
}

// GET /api/v1/admin/payment-config - Get payment config (masked secrets for admin UI)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: CONTENT_KEY },
    });

    if (!content) {
      return res.json(defaultConfig);
    }

    const config = content.value as unknown as PaymentConfig;

    // Return config with masked secrets
    const masked: PaymentConfig = {
      activeProvider: config.activeProvider,
      stripe: maskProviderSecrets('stripe', config.stripe || defaultConfig.stripe),
      square: maskProviderSecrets('square', config.square || defaultConfig.square),
      paypal: maskProviderSecrets('paypal', config.paypal || defaultConfig.paypal),
    };

    res.json(masked);
  } catch (error) {
    console.error('[payment-config] GET failed:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment config' });
  }
});

// GET /api/v1/admin/payment-config/decrypted - Get decrypted config (server-to-server ONLY)
// This endpoint is used by the checkout route to get the actual secret keys.
// It is protected by authenticateInternal (X-Internal-API-Key) and should NEVER
// be exposed to the browser.
router.get('/decrypted', async (_req: Request, res: Response) => {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: CONTENT_KEY },
    });

    if (!content) {
      return res.json(defaultConfig);
    }

    const config = content.value as unknown as PaymentConfig;

    // Decrypt secrets for server-side use
    const decrypted: PaymentConfig = {
      activeProvider: config.activeProvider,
      stripe: decryptProviderSecrets('stripe', config.stripe || defaultConfig.stripe),
      square: decryptProviderSecrets('square', config.square || defaultConfig.square),
      paypal: decryptProviderSecrets('paypal', config.paypal || defaultConfig.paypal),
    };

    res.json(decrypted);
  } catch (error) {
    console.error('[payment-config] GET /decrypted failed:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment config' });
  }
});

// PUT /api/v1/admin/payment-config - Save payment config
router.put('/', async (req: Request, res: Response) => {
  try {
    const incoming = req.body as PaymentConfig;

    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid config' });
    }

    // Get existing config for secret preservation
    const existing = await prisma.siteContent.findUnique({
      where: { key: CONTENT_KEY },
    });
    const existingConfig = existing?.value as unknown as PaymentConfig | null;

    // Encrypt secrets before storing
    const toStore: PaymentConfig = {
      activeProvider: incoming.activeProvider,
      stripe: encryptProviderSecrets('stripe', incoming.stripe || defaultConfig.stripe, existingConfig?.stripe),
      square: encryptProviderSecrets('square', incoming.square || defaultConfig.square, existingConfig?.square),
      paypal: encryptProviderSecrets('paypal', incoming.paypal || defaultConfig.paypal, existingConfig?.paypal),
    };

    // Serialize to plain JSON for Prisma InputJsonValue compatibility
    const jsonValue = JSON.parse(JSON.stringify(toStore));

    await prisma.siteContent.upsert({
      where: { key: CONTENT_KEY },
      update: { value: jsonValue },
      create: { key: CONTENT_KEY, value: jsonValue },
    });

    // Return masked version
    const masked: PaymentConfig = {
      activeProvider: toStore.activeProvider,
      stripe: maskProviderSecrets('stripe', toStore.stripe),
      square: maskProviderSecrets('square', toStore.square),
      paypal: maskProviderSecrets('paypal', toStore.paypal),
    };

    res.json({ success: true, config: masked });
  } catch (error) {
    console.error('[payment-config] PUT failed:', error);
    res.status(500).json({ success: false, error: 'Failed to save payment config' });
  }
});

// POST /api/v1/admin/payment-config/test - Test connection by calling the actual provider API
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { provider } = req.body as { provider: string };

    if (!['stripe', 'square', 'paypal'].includes(provider)) {
      return res.status(400).json({ success: false, error: 'Invalid provider' });
    }

    const content = await prisma.siteContent.findUnique({
      where: { key: CONTENT_KEY },
    });

    if (!content) {
      return res.json({ success: false, error: 'No payment config found. Save your credentials first.' });
    }

    const config = content.value as unknown as PaymentConfig;
    const providerConfig = decryptProviderSecrets(provider, config[provider as keyof PaymentConfig] as ProviderConfig);

    let valid = false;
    let message = '';

    switch (provider) {
      case 'stripe': {
        const sk = providerConfig.secretKey as string;
        const pk = providerConfig.publishableKey as string;
        if (!sk || !pk) {
          message = 'Missing publishable key or secret key';
          break;
        }

        // Actually call Stripe API to validate the key
        try {
          const stripeRes = await fetch('https://api.stripe.com/v1/balance', {
            signal: AbortSignal.timeout(15000),
            headers: { 'Authorization': `Bearer ${sk}` },
          });

          if (stripeRes.ok) {
            valid = true;
            const data = await stripeRes.json() as { livemode?: boolean };
            const isLive = data.livemode;
            message = `Connected to Stripe (${isLive ? 'LIVE' : 'TEST'} mode). Your account is ready to accept payments.`;
          } else {
            const err = await stripeRes.json() as { error?: { message?: string } };
            message = `Stripe rejected the key: ${err.error?.message || 'Invalid API key'}`;
          }
        } catch {
          message = 'Could not reach Stripe API. Check your internet connection.';
        }
        break;
      }

      case 'square': {
        const token = providerConfig.accessToken as string;
        const appId = providerConfig.applicationId as string;
        const locId = providerConfig.locationId as string;
        if (!token || !appId) {
          message = 'Missing application ID or access token';
          break;
        }
        if (!locId) {
          message = 'Missing location ID — required for processing payments';
          break;
        }

        // Call Square Locations API to validate
        try {
          const isSandbox = providerConfig.mode === 'sandbox';
          const baseUrl = isSandbox ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
          const squareRes = await fetch(`${baseUrl}/v2/locations/${locId}`, {
            signal: AbortSignal.timeout(15000),
            headers: {
              'Authorization': `Bearer ${token}`,
              'Square-Version': '2024-01-18',
              'Content-Type': 'application/json',
            },
          });

          if (squareRes.ok) {
            const data = await squareRes.json() as { location?: { name?: string } };
            valid = true;
            message = `Connected to Square. Location: ${data.location?.name || locId} (${isSandbox ? 'sandbox' : 'production'})`;
          } else {
            const err = await squareRes.json() as { errors?: { detail?: string }[] };
            const errMsg = err.errors?.[0]?.detail || 'Invalid credentials';
            message = `Square rejected the credentials: ${errMsg}`;
          }
        } catch {
          message = 'Could not reach Square API. Check your internet connection.';
        }
        break;
      }

      case 'paypal': {
        const clientId = providerConfig.clientId as string;
        const secret = providerConfig.clientSecret as string;
        if (!clientId || !secret) {
          message = 'Missing client ID or client secret';
          break;
        }

        // Call PayPal OAuth to validate credentials
        try {
          const isSandbox = providerConfig.mode === 'sandbox';
          const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
          const authString = Buffer.from(`${clientId}:${secret}`).toString('base64');

          const ppRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            signal: AbortSignal.timeout(15000),
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
          });

          if (ppRes.ok) {
            valid = true;
            message = `Connected to PayPal (${isSandbox ? 'sandbox' : 'live'}). Your account is ready to accept payments.`;
          } else {
            const err = await ppRes.json() as { error_description?: string; error?: string };
            message = `PayPal rejected the credentials: ${err.error_description || err.error || 'Invalid credentials'}`;
          }
        } catch {
          message = 'Could not reach PayPal API. Check your internet connection.';
        }
        break;
      }
    }

    res.json({ success: valid, message });
  } catch (error) {
    console.error('[payment-config] POST /test failed:', error);
    res.status(500).json({ success: false, error: 'Connection test failed' });
  }
});

export default router;
