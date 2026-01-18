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
  XMarkIcon,
  Squares2X2Icon,
  ArrowTopRightOnSquareIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/hailsquatan/dashboard', icon: Squares2X2Icon },
  { name: 'Products', href: '/hailsquatan/products', icon: ShoppingBagIcon },
  { name: 'Shows', href: '/hailsquatan/shows', icon: TicketIcon },
  { name: 'Music', href: '/hailsquatan/music', icon: MusicalNoteIcon },
  { name: 'About', href: '/hailsquatan/about', icon: UserGroupIcon },
  { name: 'Media', href: '/hailsquatan/media', icon: PhotoIcon },
  { name: 'Homepage', href: '/hailsquatan/homepage', icon: HomeIcon },
  { name: 'Orders', href: '/hailsquatan/orders', icon: ClipboardDocumentListIcon },
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
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1a1a] border-r border-[#333] transform transition-transform duration-300 lg:translate-x-0 ${
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
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#333]">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#f5f5f0] p-2 -ml-2 lg:hidden"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Mobile title */}
            <h1 className="text-lg font-bold lg:hidden">
              <span className="text-[#c41e3a]">UNHOLY</span>
              <span className="text-[#f5f5f0]"> ADMIN</span>
            </h1>

            {/* Desktop: Current section */}
            <div className="hidden lg:block">
              <span className="text-[#888888] text-sm">
                {navigation.find(n => n.href === pathname)?.name || 'Admin Panel'}
              </span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* View site link */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span className="text-sm">View Site</span>
              </Link>

              {/* Notifications placeholder */}
              <button className="relative p-2 text-[#888888] hover:text-[#f5f5f0] hover:bg-[#1a1a1a] rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>

              {/* Mobile close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className={`text-[#f5f5f0] p-2 -mr-2 lg:hidden ${sidebarOpen ? '' : 'invisible'}`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Desktop logout */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[#333] px-6 py-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[#666]">
            <div>
              <span className="text-[#c41e3a]">Unholy Rodents</span> Admin Panel
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank" className="hover:text-[#f5f5f0] transition-colors">
                View Site
              </Link>
              <span>|</span>
              <span>Hail Squatan</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
