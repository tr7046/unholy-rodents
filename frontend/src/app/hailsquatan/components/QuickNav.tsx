'use client';

import Link from 'next/link';
import {
  ShoppingBagIcon,
  TicketIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  PhotoIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  ArrowLeftIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const allSections = {
  dashboard: { name: 'Dashboard', href: '/hailsquatan/dashboard', icon: Squares2X2Icon },
  messages: { name: 'Messages', href: '/hailsquatan/messages', icon: EnvelopeIcon },
  products: { name: 'Products', href: '/hailsquatan/products', icon: ShoppingBagIcon },
  shows: { name: 'Shows', href: '/hailsquatan/shows', icon: TicketIcon },
  music: { name: 'Music', href: '/hailsquatan/music', icon: MusicalNoteIcon },
  about: { name: 'About', href: '/hailsquatan/about', icon: UserGroupIcon },
  media: { name: 'Media', href: '/hailsquatan/media', icon: PhotoIcon },
  homepage: { name: 'Homepage', href: '/hailsquatan/homepage', icon: HomeIcon },
  orders: { name: 'Orders', href: '/hailsquatan/orders', icon: ClipboardDocumentListIcon },
};

interface QuickNavProps {
  current: keyof typeof allSections;
  related?: (keyof typeof allSections)[];
}

export function QuickNav({ current, related = [] }: QuickNavProps) {
  const relatedItems = related.map((key) => allSections[key]).filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Back to dashboard */}
      {current !== 'dashboard' && (
        <Link
          href="/hailsquatan/dashboard"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[#888888] hover:text-[#f5f5f0] bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      )}

      {/* Related sections */}
      {relatedItems.length > 0 && (
        <>
          <span className="text-[#666] text-sm hidden sm:inline">|</span>
          <span className="text-[#666] text-xs uppercase tracking-wider hidden sm:inline">Jump to:</span>
          {relatedItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[#888888] hover:text-[#f5f5f0] bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg transition-colors"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}

// Section header with integrated navigation
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  current: keyof typeof allSections;
  related?: (keyof typeof allSections)[];
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, current, related = [], action }: PageHeaderProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Quick Nav */}
      <QuickNav current={current} related={related} />

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f0]">{title}</h1>
          {subtitle && <p className="text-[#888888] mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
