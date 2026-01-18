'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ScanlinesProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function Scanlines({ children, className, intensity = 'light' }: ScanlinesProps) {
  const opacities = {
    light: 'after:opacity-[0.03]',
    medium: 'after:opacity-[0.06]',
    heavy: 'after:opacity-[0.1]',
  };

  return (
    <div className={cn('scanlines', opacities[intensity], className)}>
      {children}
    </div>
  );
}
