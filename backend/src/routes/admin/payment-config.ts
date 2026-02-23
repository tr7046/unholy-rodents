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

// GET /api/v1/admin/payment-config - Get payment config (masked secrets)
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

// POST /api/v1/admin/payment-config/test - Test connection to a provider
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { provider } = req.body as { provider: string };

    if (!['stripe', 'square', 'paypal'].includes(provider)) {
      return res.status(400).json({ success: false, error: 'Invalid provider' });
    }

    // Get the config and decrypt secrets
    const content = await prisma.siteContent.findUnique({
      where: { key: CONTENT_KEY },
    });

    if (!content) {
      return res.json({ success: false, error: 'No payment config found. Save your credentials first.' });
    }

    const config = content.value as unknown as PaymentConfig;
    const providerConfig = decryptProviderSecrets(provider, config[provider as keyof PaymentConfig] as ProviderConfig);

    // Basic validation per provider
    let valid = false;
    let message = '';

    switch (provider) {
      case 'stripe': {
        const sk = providerConfig.secretKey as string;
        const pk = providerConfig.publishableKey as string;
        if (!sk || !pk) {
          message = 'Missing publishable key or secret key';
        } else if (providerConfig.mode === 'test' && (!sk.startsWith('sk_test_') || !pk.startsWith('pk_test_'))) {
          message = 'Test mode keys should start with sk_test_ and pk_test_';
        } else if (providerConfig.mode === 'live' && (!sk.startsWith('sk_live_') || !pk.startsWith('pk_live_'))) {
          message = 'Live mode keys should start with sk_live_ and pk_live_';
        } else {
          valid = true;
          message = 'Stripe credentials look valid. Full validation will occur during checkout.';
        }
        break;
      }
      case 'square': {
        const token = providerConfig.accessToken as string;
        const appId = providerConfig.applicationId as string;
        const locId = providerConfig.locationId as string;
        if (!token || !appId) {
          message = 'Missing application ID or access token';
        } else if (!locId) {
          message = 'Missing location ID — required for processing payments';
        } else {
          valid = true;
          message = 'Square credentials look valid. Full validation will occur during checkout.';
        }
        break;
      }
      case 'paypal': {
        const clientId = providerConfig.clientId as string;
        const secret = providerConfig.clientSecret as string;
        if (!clientId || !secret) {
          message = 'Missing client ID or client secret';
        } else {
          valid = true;
          message = 'PayPal credentials look valid. Full validation will occur during checkout.';
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
