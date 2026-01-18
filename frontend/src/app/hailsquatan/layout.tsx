'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBagIcon,
  TicketIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  PhotoIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Squares2X2Icon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/hailsquatan/dashboard', icon: Squares2X2Icon, shortName: 'Dash' },
  { name: 'Products', href: '/hailsquatan/products', icon: ShoppingBagIcon, shortName: 'Merch' },
  { name: 'Shows', href: '/hailsquatan/shows', icon: TicketIcon, shortName: 'Shows' },
  { name: 'Music', href: '/hailsquatan/music', icon: MusicalNoteIcon, shortName: 'Music' },
  { name: 'About', href: '/hailsquatan/about', icon: UserGroupIcon, shortName: 'About' },
  { name: 'Media', href: '/hailsquatan/media', icon: PhotoIcon, shortName: 'Media' },
  { name: 'Homepage', href: '/hailsquatan/homepage', icon: HomeIcon, shortName: 'Home' },
  { name: 'Orders', href: '/hailsquatan/orders', icon: ClipboardDocumentListIcon, shortName: 'Orders' },
  { name: 'Visibility', href: '/hailsquatan/visibility', icon: EyeIcon, shortName: 'Vis' },
];

// Quick access items for mobile bottom bar (most used)
const mobileNavItems = [
  { name: 'Dashboard', href: '/hailsquatan/dashboard', icon: Squares2X2Icon },
  { name: 'Products', href: '/hailsquatan/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/hailsquatan/orders', icon: ClipboardDocumentListIcon },
  { name: 'Shows', href: '/hailsquatan/shows', icon: TicketIcon },
  { name: 'More', href: '#more', icon: Bars3Icon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/products');
      setIsAuthenticated(res.ok);
    } catch {
      setIsAuthenticated(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/hailsquatan');
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#888888]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Mobile/tablet sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - visible on tablet+ */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1a1a] border-r border-[#333] transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#333]">
            <Link href="/hailsquatan" className="block">
              <h1 className="text-xl font-bold">
                <span className="text-[#c41e3a]">UNHOLY</span>
                <span className="text-[#f5f5f0]"> ADMIN</span>
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#c41e3a] text-white'
                      : 'text-[#888888] hover:bg-[#252525] hover:text-[#f5f5f0]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[#333]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[#888888] hover:bg-[#252525] hover:text-[#f5f5f0] transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium">Piss Off</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#333] safe-area-top">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:px-8">
            {/* Mobile: Current section title */}
            <div className="lg:hidden">
              <h1 className="text-lg font-bold text-[#f5f5f0]">
                {navigation.find(n => n.href === pathname)?.name || 'Admin'}
              </h1>
            </div>

            {/* Desktop/Tablet: Breadcrumb navigation */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Link
                href="/hailsquatan/dashboard"
                className="text-[#888888] hover:text-[#f5f5f0] transition-colors"
              >
                Admin
              </Link>
              {pathname !== '/hailsquatan' && pathname !== '/hailsquatan/dashboard' && (
                <>
                  <ChevronRightIcon className="w-4 h-4 text-[#666]" />
                  <span className="text-[#f5f5f0] font-medium">
                    {navigation.find(n => n.href === pathname)?.name || 'Page'}
                  </span>
                </>
              )}
              {pathname === '/hailsquatan/dashboard' && (
                <>
                  <ChevronRightIcon className="w-4 h-4 text-[#666]" />
                  <span className="text-[#f5f5f0] font-medium">Dashboard</span>
                </>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* View site link */}
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span className="text-sm hidden xs:inline">View Site</span>
              </Link>

              {/* Tablet/Desktop logout */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span className="text-sm">Piss Off</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content - add padding bottom on mobile for bottom nav */}
        <main className="flex-1 p-4 pb-24 lg:pb-6 lg:p-6 lg:p-8">{children}</main>

        {/* Tablet/Desktop Footer */}
        <footer className="hidden lg:block border-t border-[#333] px-6 py-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[#666]">
            <div>
              <span className="text-[#c41e3a]">Unholy Rodents</span> Admin Panel
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank" className="hover:text-[#f5f5f0] transition-colors">
                View Site
              </Link>
              <span>|</span>
              <span>Hail Squatan Ya Legends</span>
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Tab Bar - hidden on tablet+ where sidebar is visible */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#1a1a1a]/95 backdrop-blur-sm border-t border-[#333] pb-safe">
          <div className="flex items-center justify-around px-2 py-1">
            {mobileNavItems.map((item) => {
              const isActive = item.href === '#more' ? sidebarOpen : pathname === item.href;
              const isMore = item.href === '#more';

              if (isMore) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all"
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#c41e3a]/20' : ''}`}>
                      <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[#c41e3a]' : 'text-[#888888]'}`} />
                    </div>
                    <span className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-[#c41e3a]' : 'text-[#888888]'}`}>
                      {item.name}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all"
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#c41e3a]/20' : ''}`}>
                    <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[#c41e3a]' : 'text-[#888888]'}`} />
                  </div>
                  <span className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-[#c41e3a]' : 'text-[#888888]'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c41e3a] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
