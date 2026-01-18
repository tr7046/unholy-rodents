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
} from '@heroicons/react/24/outline';

const navigation = [
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
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#333] lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#f5f5f0] p-2 -ml-2"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">
              <span className="text-[#c41e3a]">UNHOLY</span>
              <span className="text-[#f5f5f0]"> ADMIN</span>
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`text-[#f5f5f0] p-2 -mr-2 ${sidebarOpen ? '' : 'invisible'}`}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
