'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'punk';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-asphalt-gray border border-concrete',
      punk: 'card-punk',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'p-6',
          variants[variant],
          hover && 'transition-all duration-200 hover:border-neon-green hover:shadow-lg hover:shadow-neon-green/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
