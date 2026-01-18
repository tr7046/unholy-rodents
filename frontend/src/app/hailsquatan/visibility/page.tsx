'use client';

import { useState, useEffect } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  Bars3Icon,
  RectangleGroupIcon,
  CursorArrowRaysIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { VisibilityConfig, defaultVisibilityConfig, visibilityLabels } from '@/lib/visibility-config';

// ============================================
// TOGGLE SWITCH COMPONENT
// ============================================

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, label, description, size = 'md', disabled = false }: ToggleSwitchProps) {
  const sizes = {
    sm: { switch: 'w-9 h-5', dot: 'w-4 h-4', translate: 'translate-x-4' },
    md: { switch: 'w-11 h-6', dot: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { switch: 'w-14 h-7', dot: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          {enabled ? (
            <EyeIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <EyeSlashIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <span className={`font-medium ${enabled ? 'text-[#f5f5f0]' : 'text-[#666]'}`}>{label}</span>
        </div>
        {description && <p className="text-xs text-[#666] mt-0.5 ml-6">{description}</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex flex-shrink-0 ${s.switch} rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${
          enabled ? 'bg-[#c41e3a]' : 'bg-[#333]'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`${s.dot} inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
            enabled ? s.translate : 'translate-x-0.5'
          }`}
          style={{ marginTop: '0.125rem' }}
        />
      </button>
    </div>
  );
}

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  level?: number;
  allEnabled?: boolean;
  onToggleAll?: (enabled: boolean) => void;
}

function CollapsibleSection({
  title,
  description,
  icon,
  children,
  defaultOpen = false,
  level = 0,
  allEnabled,
  onToggleAll,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const bgColors = ['bg-[#1a1a1a]', 'bg-[#151515]', 'bg-[#111]'];
  const borderColors = ['border-[#333]', 'border-[#2a2a2a]', 'border-[#222]'];

  return (
    <div className={`${bgColors[level]} border ${borderColors[level]} rounded-lg overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#252525] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#c41e3a]">{icon}</span>
          <div className="text-left">
            <h3 className="font-bold text-[#f5f5f0]">{title}</h3>
            {description && <p className="text-xs text-[#666]">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onToggleAll !== undefined && allEnabled !== undefined && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAll(!allEnabled);
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                allEnabled
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {allEnabled ? 'All ON' : 'All OFF'}
            </button>
          )}
          {isOpen ? (
            <ChevronDownIcon className="w-5 h-5 text-[#666]" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-[#666]" />
          )}
        </div>
      </button>
      {isOpen && <div className="p-4 pt-0 space-y-1">{children}</div>}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function VisibilityPage() {
  const [config, setConfig] = useState<VisibilityConfig>(defaultVisibilityConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/visibility');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Failed to load visibility config:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Update a single setting
  const updateSetting = async (path: string, value: boolean) => {
    // Optimistic update
    const parts = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(config)) as VisibilityConfig;
    let current: Record<string, unknown> = newConfig as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;

    setConfig(newConfig);
    setHasChanges(true);

    try {
      const res = await fetch('/api/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, value }),
      });

      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Toggle all in a group
  const toggleAllInGroup = (basePath: string, keys: string[], enabled: boolean) => {
    keys.forEach((key) => {
      updateSetting(`${basePath}.${key}`, enabled);
    });
  };

  // Check if all in a group are enabled
  const allInGroupEnabled = (obj: Record<string, boolean> | object): boolean => {
    return Object.values(obj as Record<string, boolean>).every((v) => v === true);
  };

  // Save all changes
  const saveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveStatus('success');
        setHasChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    if (confirm('Reset all visibility settings to default? This will show everything.')) {
      setConfig(defaultVisibilityConfig);
      await fetch('/api/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultVisibilityConfig),
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#888]">Loading visibility settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#f5f5f0]">VISIBILITY CONTROLS</h1>
          <p className="text-[#888] mt-1">Toggle site sections on/off without code. Changes save automatically.</p>
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
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm text-[#888] hover:text-[#f5f5f0] hover:bg-[#252525] rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 inline mr-1" />
            Reset All
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#f5f5f0]">
            {Object.values(config.pages).filter(Boolean).length}/{Object.keys(config.pages).length}
          </div>
          <div className="text-sm text-[#888]">Pages Active</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#f5f5f0]">
            {Object.values(config.navigation.header.links).filter(Boolean).length}/
            {Object.keys(config.navigation.header.links).length}
          </div>
          <div className="text-sm text-[#888]">Nav Links Active</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#f5f5f0]">
            {Object.values(config.sections).flatMap((s) => Object.values(s)).filter(Boolean).length}/
            {Object.values(config.sections).flatMap((s) => Object.values(s)).length}
          </div>
          <div className="text-sm text-[#888]">Sections Active</div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#f5f5f0]">
            {Object.values(config.elements.buttons).filter(Boolean).length +
              Object.values(config.elements.features).filter(Boolean).length}
            /
            {Object.keys(config.elements.buttons).length + Object.keys(config.elements.features).length}
          </div>
          <div className="text-sm text-[#888]">Elements Active</div>
        </div>
      </div>

      {/* Level 1: Pages */}
      <CollapsibleSection
        title="Pages"
        description="Enable or disable entire pages"
        icon={<GlobeAltIcon className="w-6 h-6" />}
        defaultOpen={true}
        allEnabled={allInGroupEnabled(config.pages)}
        onToggleAll={(enabled) =>
          toggleAllInGroup('pages', Object.keys(config.pages), enabled)
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(config.pages).map(([key, enabled]) => {
            const label = visibilityLabels.pages[key as keyof typeof visibilityLabels.pages] as { label: string; description: string };
            return (
              <ToggleSwitch
                key={key}
                enabled={enabled}
                onChange={(value) => updateSetting(`pages.${key}`, value)}
                label={label?.label || key}
                description={label?.description}
              />
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Navigation */}
      <CollapsibleSection
        title="Navigation"
        description="Control header and footer elements"
        icon={<Bars3Icon className="w-6 h-6" />}
        defaultOpen={true}
      >
        {/* Header Links */}
        <CollapsibleSection
          title="Header Navigation"
          description="Main navigation links"
          icon={<ChevronRightIcon className="w-5 h-5" />}
          level={1}
          defaultOpen={true}
          allEnabled={allInGroupEnabled(config.navigation.header.links)}
          onToggleAll={(enabled) =>
            toggleAllInGroup('navigation.header.links', Object.keys(config.navigation.header.links), enabled)
          }
        >
          <ToggleSwitch
            enabled={config.navigation.header.logo}
            onChange={(value) => updateSetting('navigation.header.logo', value)}
            label="Logo"
            description="UNHOLY RODENTS branding"
          />
          <div className="border-t border-[#333] mt-2 pt-2">
            {Object.entries(config.navigation.header.links).map(([key, enabled]) => (
              <ToggleSwitch
                key={key}
                enabled={enabled}
                onChange={(value) => updateSetting(`navigation.header.links.${key}`, value)}
                label={`${key.charAt(0).toUpperCase() + key.slice(1)} Link`}
                description={`Link to ${key} page`}
                disabled={!config.pages[key as keyof typeof config.pages]}
              />
            ))}
          </div>
        </CollapsibleSection>

        {/* Footer */}
        <CollapsibleSection
          title="Footer"
          description="Footer sections and social links"
          icon={<ChevronRightIcon className="w-5 h-5" />}
          level={1}
          defaultOpen={false}
        >
          <ToggleSwitch
            enabled={config.navigation.footer.visible}
            onChange={(value) => updateSetting('navigation.footer.visible', value)}
            label="Show Footer"
            description="Entire footer section"
          />
          <div className="border-t border-[#333] mt-2 pt-2 space-y-1">
            <ToggleSwitch
              enabled={config.navigation.footer.brand}
              onChange={(value) => updateSetting('navigation.footer.brand', value)}
              label="Brand Section"
              description="Logo and tagline"
              disabled={!config.navigation.footer.visible}
            />
            <ToggleSwitch
              enabled={config.navigation.footer.quickLinks}
              onChange={(value) => updateSetting('navigation.footer.quickLinks', value)}
              label="Quick Links"
              description="Navigation shortcuts"
              disabled={!config.navigation.footer.visible}
            />
            <ToggleSwitch
              enabled={config.navigation.footer.contact}
              onChange={(value) => updateSetting('navigation.footer.contact', value)}
              label="Contact Info"
              description="Email address"
              disabled={!config.navigation.footer.visible}
            />
            <ToggleSwitch
              enabled={config.navigation.footer.copyright}
              onChange={(value) => updateSetting('navigation.footer.copyright', value)}
              label="Copyright"
              description="Bottom copyright text"
              disabled={!config.navigation.footer.visible}
            />
          </div>
          <div className="border-t border-[#333] mt-2 pt-2">
            <p className="text-xs text-[#888] mb-2">Social Icons</p>
            {Object.entries(config.navigation.footer.socialLinks).map(([key, enabled]) => (
              <ToggleSwitch
                key={key}
                enabled={enabled}
                onChange={(value) => updateSetting(`navigation.footer.socialLinks.${key}`, value)}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                disabled={!config.navigation.footer.visible}
              />
            ))}
          </div>
        </CollapsibleSection>
      </CollapsibleSection>

      {/* Level 2: Sections by Page */}
      <CollapsibleSection
        title="Page Sections"
        description="Control visibility of content blocks within each page"
        icon={<RectangleGroupIcon className="w-6 h-6" />}
        defaultOpen={true}
      >
        {Object.entries(config.sections).map(([pageKey, sections]) => {
          const pageLabels = visibilityLabels.sections[pageKey as keyof typeof visibilityLabels.sections] as Record<string, { label: string; description: string } | string>;
          const pageEnabled = config.pages[pageKey as keyof typeof config.pages];

          return (
            <CollapsibleSection
              key={pageKey}
              title={pageLabels?._title as string || `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} Page`}
              icon={<ChevronRightIcon className="w-5 h-5" />}
              level={1}
              defaultOpen={false}
              allEnabled={allInGroupEnabled(sections as Record<string, boolean>)}
              onToggleAll={(enabled) =>
                toggleAllInGroup(`sections.${pageKey}`, Object.keys(sections), enabled)
              }
            >
              {!pageEnabled && (
                <div className="text-xs text-amber-500 bg-amber-500/10 px-3 py-2 rounded mb-2">
                  Note: This page is currently disabled
                </div>
              )}
              {Object.entries(sections).map(([sectionKey, enabled]) => {
                const sectionLabel = pageLabels?.[sectionKey] as { label: string; description: string };
                return (
                  <ToggleSwitch
                    key={sectionKey}
                    enabled={enabled as boolean}
                    onChange={(value) => updateSetting(`sections.${pageKey}.${sectionKey}`, value)}
                    label={sectionLabel?.label || sectionKey}
                    description={sectionLabel?.description}
                    disabled={!pageEnabled}
                  />
                );
              })}
            </CollapsibleSection>
          );
        })}
      </CollapsibleSection>

      {/* Level 3: Elements */}
      <CollapsibleSection
        title="Individual Elements"
        description="Fine-grained control over buttons and features"
        icon={<CursorArrowRaysIcon className="w-6 h-6" />}
        defaultOpen={false}
      >
        {/* Buttons */}
        <CollapsibleSection
          title="Buttons & Links"
          icon={<ChevronRightIcon className="w-5 h-5" />}
          level={1}
          defaultOpen={false}
          allEnabled={allInGroupEnabled(config.elements.buttons)}
          onToggleAll={(enabled) =>
            toggleAllInGroup('elements.buttons', Object.keys(config.elements.buttons), enabled)
          }
        >
          {Object.entries(config.elements.buttons).map(([key, enabled]) => {
            const labelObj = visibilityLabels.elements.buttons[key as keyof typeof visibilityLabels.elements.buttons];
            const label = typeof labelObj === 'object' && labelObj !== null ? labelObj : null;
            return (
              <ToggleSwitch
                key={key}
                enabled={enabled}
                onChange={(value) => updateSetting(`elements.buttons.${key}`, value)}
                label={label?.label || key}
                description={label?.description}
              />
            );
          })}
        </CollapsibleSection>

        {/* Features */}
        <CollapsibleSection
          title="Interactive Features"
          icon={<ChevronRightIcon className="w-5 h-5" />}
          level={1}
          defaultOpen={false}
          allEnabled={allInGroupEnabled(config.elements.features)}
          onToggleAll={(enabled) =>
            toggleAllInGroup('elements.features', Object.keys(config.elements.features), enabled)
          }
        >
          {Object.entries(config.elements.features).map(([key, enabled]) => {
            const labelObj = visibilityLabels.elements.features[key as keyof typeof visibilityLabels.elements.features];
            const label = typeof labelObj === 'object' && labelObj !== null ? labelObj : null;
            return (
              <ToggleSwitch
                key={key}
                enabled={enabled}
                onChange={(value) => updateSetting(`elements.features.${key}`, value)}
                label={label?.label || key}
                description={label?.description}
              />
            );
          })}
        </CollapsibleSection>
      </CollapsibleSection>

      {/* Floating Save Button */}
      {hasChanges && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
          <button
            onClick={saveAll}
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
                Save All Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
