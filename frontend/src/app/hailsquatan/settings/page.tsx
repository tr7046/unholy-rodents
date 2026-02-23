'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: 'test' | 'live';
  isConfigured: boolean;
}

interface SquareConfig {
  applicationId: string;
  accessToken: string;
  locationId: string;
  webhookSignatureKey: string;
  mode: 'sandbox' | 'production';
  isConfigured: boolean;
}

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
  isConfigured: boolean;
}

interface PaymentConfig {
  activeProvider: string | null;
  stripe: StripeConfig;
  square: SquareConfig;
  paypal: PayPalConfig;
}

type ProviderKey = 'stripe' | 'square' | 'paypal';

const defaultConfig: PaymentConfig = {
  activeProvider: null,
  stripe: { publishableKey: '', secretKey: '', webhookSecret: '', mode: 'test', isConfigured: false },
  square: { applicationId: '', accessToken: '', locationId: '', webhookSignatureKey: '', mode: 'sandbox', isConfigured: false },
  paypal: { clientId: '', clientSecret: '', mode: 'sandbox', isConfigured: false },
};

const providerInfo: Record<ProviderKey, { name: string; description: string; color: string; docs: string }> = {
  stripe: {
    name: 'Stripe',
    description: 'Credit cards, Apple Pay, Google Pay',
    color: '#635BFF',
    docs: 'https://dashboard.stripe.com/apikeys',
  },
  square: {
    name: 'Square',
    description: 'In-person + online payments',
    color: '#006AFF',
    docs: 'https://developer.squareup.com/apps',
  },
  paypal: {
    name: 'PayPal',
    description: 'PayPal, Venmo, Pay Later',
    color: '#003087',
    docs: 'https://developer.paypal.com/dashboard/applications',
  },
};

// ============================================
// SECRET INPUT COMPONENT
// ============================================

function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  helpText?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isMasked = value.includes('••');

  return (
    <div>
      <label className="block text-sm font-medium text-[#f5f5f0] mb-1">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (isMasked) onChange('');
          }}
          placeholder={placeholder}
          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 pr-10 text-[#f5f5f0] placeholder-[#555] focus:outline-none focus:border-[#c41e3a] focus:ring-1 focus:ring-[#c41e3a] font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#f5f5f0] transition-colors"
        >
          {visible ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </button>
      </div>
      {helpText && <p className="text-xs text-[#666] mt-1">{helpText}</p>}
    </div>
  );
}

// ============================================
// TEXT INPUT COMPONENT
// ============================================

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  helpText?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#f5f5f0] mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-[#f5f5f0] placeholder-[#555] focus:outline-none focus:border-[#c41e3a] focus:ring-1 focus:ring-[#c41e3a] font-mono text-sm"
      />
      {helpText && <p className="text-xs text-[#666] mt-1">{helpText}</p>}
    </div>
  );
}

// ============================================
// MODE TOGGLE
// ============================================

function ModeToggle({
  mode,
  onChange,
  options,
}: {
  mode: string;
  onChange: (mode: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === opt.value
              ? 'bg-[#c41e3a] text-white'
              : 'bg-[#0a0a0a] text-[#888] border border-[#333] hover:border-[#555]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ============================================
// PROVIDER CARD COMPONENT
// ============================================

function ProviderCard({
  provider,
  config,
  isActive,
  onActivate,
  onUpdate,
  onTest,
  testResult,
  isTesting,
}: {
  provider: ProviderKey;
  config: StripeConfig | SquareConfig | PayPalConfig;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (updates: Partial<StripeConfig | SquareConfig | PayPalConfig>) => void;
  onTest: () => void;
  testResult: { success: boolean; message: string } | null;
  isTesting: boolean;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const info = providerInfo[provider];

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isActive ? 'border-[#c41e3a] bg-[#1a1a1a]' : 'border-[#333] bg-[#1a1a1a]'
      }`}
    >
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#252525] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: info.color }}
          >
            {info.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#f5f5f0]">{info.name}</h3>
              {isActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#c41e3a]/20 text-[#c41e3a]">
                  Active
                </span>
              )}
              {config.isConfigured && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Configured
                </span>
              )}
            </div>
            <p className="text-sm text-[#888]">{info.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDownIcon className="w-5 h-5 text-[#666]" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-[#666]" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#333]">
          <div className="pt-4">
            {/* Mode Toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Environment</label>
              {provider === 'stripe' && (
                <ModeToggle
                  mode={(config as StripeConfig).mode}
                  onChange={(m) => onUpdate({ mode: m as 'test' | 'live' })}
                  options={[
                    { value: 'test', label: 'Test Mode' },
                    { value: 'live', label: 'Live Mode' },
                  ]}
                />
              )}
              {provider === 'square' && (
                <ModeToggle
                  mode={(config as SquareConfig).mode}
                  onChange={(m) => onUpdate({ mode: m as 'sandbox' | 'production' })}
                  options={[
                    { value: 'sandbox', label: 'Sandbox' },
                    { value: 'production', label: 'Production' },
                  ]}
                />
              )}
              {provider === 'paypal' && (
                <ModeToggle
                  mode={(config as PayPalConfig).mode}
                  onChange={(m) => onUpdate({ mode: m as 'sandbox' | 'live' })}
                  options={[
                    { value: 'sandbox', label: 'Sandbox' },
                    { value: 'live', label: 'Live Mode' },
                  ]}
                />
              )}
            </div>

            {/* Provider-specific fields */}
            <div className="space-y-3">
              {provider === 'stripe' && (
                <>
                  <TextInput
                    label="Publishable Key"
                    value={(config as StripeConfig).publishableKey}
                    onChange={(v) => onUpdate({ publishableKey: v })}
                    placeholder="pk_test_..."
                    helpText="Starts with pk_test_ or pk_live_"
                  />
                  <SecretInput
                    label="Secret Key"
                    value={(config as StripeConfig).secretKey}
                    onChange={(v) => onUpdate({ secretKey: v })}
                    placeholder="sk_test_..."
                    helpText="Starts with sk_test_ or sk_live_. Encrypted at rest."
                  />
                  <SecretInput
                    label="Webhook Secret"
                    value={(config as StripeConfig).webhookSecret}
                    onChange={(v) => onUpdate({ webhookSecret: v })}
                    placeholder="whsec_..."
                    helpText="Optional. Found in Stripe Dashboard > Webhooks. Encrypted at rest."
                  />
                </>
              )}

              {provider === 'square' && (
                <>
                  <TextInput
                    label="Application ID"
                    value={(config as SquareConfig).applicationId}
                    onChange={(v) => onUpdate({ applicationId: v })}
                    placeholder="sq0idp-..."
                    helpText="Found in Square Developer Dashboard"
                  />
                  <SecretInput
                    label="Access Token"
                    value={(config as SquareConfig).accessToken}
                    onChange={(v) => onUpdate({ accessToken: v })}
                    placeholder="EAAAl..."
                    helpText="Personal access token or OAuth token. Encrypted at rest."
                  />
                  <TextInput
                    label="Location ID"
                    value={(config as SquareConfig).locationId}
                    onChange={(v) => onUpdate({ locationId: v })}
                    placeholder="L..."
                    helpText="Required. Found in Square Dashboard > Locations."
                  />
                  <SecretInput
                    label="Webhook Signature Key"
                    value={(config as SquareConfig).webhookSignatureKey}
                    onChange={(v) => onUpdate({ webhookSignatureKey: v })}
                    placeholder=""
                    helpText="Optional. For verifying webhook events. Encrypted at rest."
                  />
                </>
              )}

              {provider === 'paypal' && (
                <>
                  <TextInput
                    label="Client ID"
                    value={(config as PayPalConfig).clientId}
                    onChange={(v) => onUpdate({ clientId: v })}
                    placeholder="AV..."
                    helpText="Found in PayPal Developer Dashboard > Apps"
                  />
                  <SecretInput
                    label="Client Secret"
                    value={(config as PayPalConfig).clientSecret}
                    onChange={(v) => onUpdate({ clientSecret: v })}
                    placeholder="EK..."
                    helpText="Found alongside Client ID. Encrypted at rest."
                  />
                </>
              )}
            </div>

            {/* Help link */}
            <p className="text-xs text-[#666] mt-3">
              Find your credentials at{' '}
              <a
                href={info.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c41e3a] hover:underline"
              >
                {info.name} Developer Dashboard
              </a>
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#333]">
              {!isActive ? (
                <button
                  type="button"
                  onClick={onActivate}
                  className="px-4 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Set as Active Provider
                </button>
              ) : (
                <span className="text-sm text-green-400 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4" />
                  Active payment provider
                </span>
              )}

              <button
                type="button"
                onClick={onTest}
                disabled={isTesting}
                className="px-4 py-2 bg-[#252525] hover:bg-[#333] text-[#f5f5f0] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isTesting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`mt-3 p-3 rounded-lg text-sm flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {testResult.success ? (
                  <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                {testResult.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN SETTINGS PAGE
// ============================================

// ============================================
// SOCIAL LINKS TYPES
// ============================================

interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  spotify: string;
  tiktok: string;
  twitter: string;
  bandcamp: string;
}

const defaultSocials: SocialLinks = {
  instagram: '',
  facebook: '',
  youtube: '',
  spotify: '',
  tiktok: '',
  twitter: '',
  bandcamp: '',
};

const socialPlatforms: { key: keyof SocialLinks; label: string; placeholder: string; color: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourband', color: '#E4405F' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourband', color: '#1877F2' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourband', color: '#FF0000' },
  { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/...', color: '#1DB954' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourband', color: '#000000' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourband', color: '#1DA1F2' },
  { key: 'bandcamp', label: 'Bandcamp', placeholder: 'https://yourband.bandcamp.com', color: '#629AA9' },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<PaymentConfig>(defaultConfig);
  const [socials, setSocials] = useState<SocialLinks>(defaultSocials);
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [socialsSaveStatus, setSocialsSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSocialChanges, setHasSocialChanges] = useState(false);

  // Load config
  useEffect(() => {
    async function load() {
      try {
        const [paymentRes, socialsRes] = await Promise.all([
          fetch('/api/admin/payment-config'),
          fetch('/api/admin/socials'),
        ]);
        if (paymentRes.ok) {
          const data = await paymentRes.json();
          setConfig(data);
        }
        if (socialsRes.ok) {
          const data = await socialsRes.json();
          setSocials({ ...defaultSocials, ...data });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Update social link
  const updateSocial = (key: keyof SocialLinks, value: string) => {
    setSocials((prev) => ({ ...prev, [key]: value }));
    setHasSocialChanges(true);
  };

  // Save social links
  const saveSocials = async () => {
    setIsSavingSocials(true);
    try {
      const res = await fetch('/api/admin/socials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socials),
      });
      if (res.ok) {
        setSocialsSaveStatus('success');
        setHasSocialChanges(false);
        setTimeout(() => setSocialsSaveStatus('idle'), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch {
      setSocialsSaveStatus('error');
      setTimeout(() => setSocialsSaveStatus('idle'), 3000);
    } finally {
      setIsSavingSocials(false);
    }
  };

  // Update provider config
  const updateProvider = (provider: ProviderKey, updates: Record<string, unknown>) => {
    setConfig((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], ...updates },
    }));
    setHasChanges(true);
  };

  // Set active provider
  const setActiveProvider = (provider: ProviderKey) => {
    setConfig((prev) => ({ ...prev, activeProvider: provider }));
    setHasChanges(true);
  };

  // Disable payments
  const disablePayments = () => {
    setConfig((prev) => ({ ...prev, activeProvider: null }));
    setHasChanges(true);
  };

  // Save config
  const save = async () => {
    setIsSaving(true);
    try {
      // Mark providers as configured based on required fields
      const toSave = { ...config };

      // Check Stripe
      const s = toSave.stripe;
      toSave.stripe = { ...s, isConfigured: !!(s.publishableKey && s.secretKey && !s.secretKey.includes('••') ? true : s.isConfigured) };

      // Check Square
      const sq = toSave.square;
      toSave.square = { ...sq, isConfigured: !!(sq.applicationId && sq.accessToken && sq.locationId && !sq.accessToken.includes('••') ? true : sq.isConfigured) };

      // Check PayPal
      const pp = toSave.paypal;
      toSave.paypal = { ...pp, isConfigured: !!(pp.clientId && pp.clientSecret && !pp.clientSecret.includes('••') ? true : pp.isConfigured) };

      const res = await fetch('/api/admin/payment-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
        setSaveStatus('success');
        setHasChanges(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Test connection
  const testConnection = async (provider: ProviderKey) => {
    setTestingProvider(provider);
    setTestResults((prev) => ({ ...prev, [provider]: null }));

    try {
      // Save first so backend has the latest keys
      await save();

      const res = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: data.success, message: data.message || data.error || 'Unknown result' },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, message: 'Network error — could not reach server' },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#888]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#f5f5f0]">SETTINGS</h1>
          <p className="text-[#888] mt-1">Configure payment processing and site settings.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <CheckCircleIcon className="w-4 h-4" /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-500 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4" /> Error saving
            </span>
          )}
        </div>
      </div>

      {/* Social Links Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#f5f5f0]">Social Links</h2>
            <p className="text-sm text-[#888]">
              Set your social media URLs. These appear in the footer, contact page, and across the site.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {socialsSaveStatus === 'success' && (
              <span className="flex items-center gap-1 text-green-500 text-sm">
                <CheckCircleIcon className="w-4 h-4" /> Saved
              </span>
            )}
            {socialsSaveStatus === 'error' && (
              <span className="flex items-center gap-1 text-red-500 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" /> Error
              </span>
            )}
            <button
              onClick={saveSocials}
              disabled={isSavingSocials || !hasSocialChanges}
              className="px-4 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSavingSocials ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Social Links'
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg divide-y divide-[#333]">
          {socialPlatforms.map((platform) => (
            <div key={platform.key} className="flex items-center gap-4 p-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                style={{ backgroundColor: platform.color }}
              >
                {platform.label[0]}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#f5f5f0] mb-1">{platform.label}</label>
                <input
                  type="url"
                  value={socials[platform.key]}
                  onChange={(e) => updateSocial(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] placeholder-[#555] focus:outline-none focus:border-[#c41e3a] focus:ring-1 focus:ring-[#c41e3a] font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Provider Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#f5f5f0]">Payment Providers</h2>
            <p className="text-sm text-[#888]">
              Configure your payment processor. Only one provider can be active at a time.
            </p>
          </div>
          {config.activeProvider && (
            <button
              type="button"
              onClick={disablePayments}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Disable Payments
            </button>
          )}
        </div>

        {/* Status Banner */}
        <div
          className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            config.activeProvider
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
          }`}
        >
          {config.activeProvider ? (
            <>
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              Payments enabled via <strong className="ml-1">{providerInfo[config.activeProvider as ProviderKey]?.name}</strong>
              <span className="text-green-400/60 ml-1">
                ({config[config.activeProvider as ProviderKey]?.mode} mode)
              </span>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              No payment provider active. Customers cannot checkout.
            </>
          )}
        </div>

        {/* Provider Cards */}
        <div className="space-y-3">
          {(['stripe', 'square', 'paypal'] as const).map((provider) => (
            <ProviderCard
              key={provider}
              provider={provider}
              config={config[provider]}
              isActive={config.activeProvider === provider}
              onActivate={() => setActiveProvider(provider)}
              onUpdate={(updates) => updateProvider(provider, updates)}
              onTest={() => testConnection(provider)}
              testResult={testResults[provider] || null}
              isTesting={testingProvider === provider}
            />
          ))}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#f5f5f0] mb-2">Security</h3>
        <ul className="text-xs text-[#888] space-y-1">
          <li>Secret keys and tokens are encrypted with AES-256-GCM before database storage.</li>
          <li>Secrets are never sent back to the browser in plaintext — only masked previews.</li>
          <li>Publishable keys and client IDs are safe for frontend use by design.</li>
          <li>Clearing a field and saving will remove the stored secret.</li>
        </ul>
      </div>

      {/* Floating Save Button - Payment Config */}
      {hasChanges && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
          <button
            onClick={save}
            disabled={isSaving}
            className="bg-[#c41e3a] hover:bg-[#a01830] text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Save Payment Config
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
