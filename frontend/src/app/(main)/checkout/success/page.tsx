'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/lib/cart';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const hasCleared = useRef(false);

  // Always clear cart on success page — all providers redirect here
  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="relative pt-20">
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="font-display text-4xl text-[#f5f5f0] mb-4">ORDER CONFIRMED</h1>
          <p className="text-[#888888] text-lg mb-8">
            Thanks for your order! You&apos;ll receive a confirmation email shortly.
          </p>

          {sessionId && (
            <p className="text-sm text-[#888888] mb-8 font-mono">
              Reference: {sessionId.slice(-12).toUpperCase()}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/store"
              className="btn btn-blood"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="btn btn-outline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
