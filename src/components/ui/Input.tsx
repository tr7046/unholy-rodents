'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-bold uppercase tracking-wider text-dirty-white mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn('input-punk', error && 'border-blood-red', className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-blood-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
