'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  VisibilityConfig,
  defaultVisibilityConfig,
  getConfigValue,
} from '@/lib/visibility-config';

// ============================================
// CONTEXT TYPES
// ============================================

interface VisibilityContextType {
  config: VisibilityConfig;
  isLoading: boolean;
  isVisible: (path: string) => boolean;
  refreshConfig: () => Promise<void>;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface VisibilityProviderProps {
  children: ReactNode;
  initialConfig?: VisibilityConfig;
}

export function VisibilityProvider({ children, initialConfig }: VisibilityProviderProps) {
  const [config, setConfig] = useState<VisibilityConfig>(initialConfig || defaultVisibilityConfig);
  const [isLoading, setIsLoading] = useState(!initialConfig);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/visibility');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch visibility config:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    }
  }, [initialConfig, fetchConfig]);

  const isVisible = useCallback(
    (path: string): boolean => {
      return getConfigValue(config, path);
    },
    [config]
  );

  const refreshConfig = useCallback(async () => {
    setIsLoading(true);
    await fetchConfig();
  }, [fetchConfig]);

  return (
    <VisibilityContext.Provider value={{ config, isLoading, isVisible, refreshConfig }}>
      {children}
    </VisibilityContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useVisibility() {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
}

// ============================================
// VISIBILITY WRAPPER COMPONENT
// ============================================

interface VisibleProps {
  path: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that shows/hides content based on visibility config
 *
 * Usage:
 * <Visible path="sections.home.hero">
 *   <HeroSection />
 * </Visible>
 */
export function Visible({ path, children, fallback = null }: VisibleProps) {
  const { isVisible, isLoading } = useVisibility();

  // Show content while loading to prevent flash
  if (isLoading) {
    return <>{children}</>;
  }

  if (!isVisible(path)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================
// CONDITIONAL RENDER HOOK
// ============================================

/**
 * Hook for conditional rendering based on visibility
 *
 * Usage:
 * const showHero = useIsVisible('sections.home.hero');
 * if (!showHero) return null;
 */
export function useIsVisible(path: string): boolean {
  const { isVisible, isLoading } = useVisibility();

  // Default to visible while loading
  if (isLoading) return true;

  return isVisible(path);
}

// ============================================
// PAGE ACCESS HOOK
// ============================================

/**
 * Hook to check if a page is accessible
 * Returns { accessible: boolean, loading: boolean }
 */
export function usePageAccess(page: string): { accessible: boolean; loading: boolean } {
  const { config, isLoading } = useVisibility();

  if (isLoading) {
    return { accessible: true, loading: true };
  }

  const pageKey = page === '/' ? 'home' : page.replace('/', '') as keyof typeof config.pages;
  const accessible = config.pages[pageKey] ?? true;

  return { accessible, loading: false };
}
