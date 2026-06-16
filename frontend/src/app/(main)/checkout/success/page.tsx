'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useCart } from '@/lib/cart';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const paypalToken = searchParams.get('token'); // PayPal adds this on return
  const { clearCart } = useCart();
  const hasRun = useRef(false);

  const [captureState, setCaptureState] = useState<'idle' | 'capturing' | 'success' | 'error'>(
    paypalToken ? 'capturing' : 'idle',
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (paypalToken && orderId) {
      // PayPal flow: capture the approved payment
      fetch('/api/checkout/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: paypalToken, orderId }),
      })
        .then(async (res) => {
          if (res.ok) {
            setCaptureState('success');
            clearCart();
          } else {
            const data = await res.json().catch(() => ({}));
            setCaptureState('error');
            setErrorMessage(data.error || 'Payment capture failed. Please contact support.');
          }
        })
        .catch(() => {
          setCaptureState('error');
          setErrorMessage('Could not process payment. Please contact support.');
        });
    } else {
      // Stripe/Square flow: webhook handles confirmation, just clear cart
      clearCart();
    }
  }, [clearCart, paypalToken, orderId]);

  // PayPal capture in progress
  if (captureState === 'capturing') {
    return (
      <div className="relative pt-20">
        <section className="py-24 bg-[#0a0a0a]">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <Loader2 className="w-20 h-20 text-[#888888] mx-auto mb-6 animate-spin" />
            <h1 className="font-display text-4xl text-[#f5f5f0] mb-4">PROCESSING PAYMENT</h1>
            <p className="text-[#888888] text-lg">
              Finalizing your PayPal payment. Please don&apos;t close this page...
            </p>
          </div>
        </section>
      </div>
    );
  }

  // PayPal capture failed
  if (captureState === 'error') {
    return (
      <div className="relative pt-20">
        <section className="py-24 bg-[#0a0a0a]">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="font-display text-4xl text-[#f5f5f0] mb-4">PAYMENT ISSUE</h1>
            <p className="text-[#888888] text-lg mb-8">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/store" className="btn btn-blood">
                Return to Store
              </Link>
              <Link href="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Success (all providers)
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
