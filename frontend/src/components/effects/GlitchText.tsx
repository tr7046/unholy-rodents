'use client';

import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

export function GlitchText({ text, className, as: Component = 'span' }: GlitchTextProps) {
  return (
    <Component className={cn('glitch', className)} data-text={text}>
      {text}
    </Component>
  );
}
