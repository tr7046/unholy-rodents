'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  TicketIcon,
  MusicalNoteIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  products: {
    total: number;
    totalStock: number;
    lowStock: number;
    featured: number;
  };
  shows: {
    upcoming: number;
    past: number;
  };
  orders: {
    total: number;
    pending: number;
    revenue: number;
  };
  music: {
    releases: number;
  };
}

interface AdminTodo {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todos, setTodos] = useState<AdminTodo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    loadTodos();
  }, []);

  async function fetchDashboardData() {
    try {
      const [productsRes, showsRes, ordersRes, musicRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/shows'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/music'),
      ]);

      const products = productsRes.ok ? await productsRes.json() : { products: [] };
      const shows = showsRes.ok ? await showsRes.json() : { upcomingShows: [], pastShows: [] };
      const orders = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      const music = musicRes.ok ? await musicRes.json() : { releases: [] };

      const productStats = {
        total: products.products?.length || 0,
        totalStock: products.products?.reduce((sum: number, p: { variants: { stock: number }[] }) =>
          sum + p.variants.reduce((s: number, v: { stock: number }) => s + v.stock, 0), 0) || 0,
        lowStock: products.products?.filter((p: { variants: { stock: number }[] }) =>
          p.variants.some((v: { stock: number }) => v.stock < 5)).length || 0,
        featured: products.products?.filter((p: { featured: boolean }) => p.featured).length || 0,
      };

      const orderStats = {
        total: orders.orders?.length || 0,
        pending: orders.orders?.filter((o: { status: string }) => o.status === 'pending').length || 0,
        revenue: orders.orders?.reduce((sum: number, o: { total: number }) => sum + (o.total || 0), 0) || 0,
      };

      setStats({
        products: productStats,
        shows: {
          upcoming: shows.upcomingShows?.length || 0,
          past: shows.pastShows?.length || 0,
        },
        orders: orderStats,
        music: {
          releases: music.releases?.length || 0,
        },
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadTodos() {
    const saved = localStorage.getItem('admin_todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }

  function saveTodos(newTodos: AdminTodo[]) {
    localStorage.setItem('admin_todos', JSON.stringify(newTodos));
    setTodos(newTodos);
  }

  function addTodo() {
    if (!newTodo.trim()) return;
    const todo: AdminTodo = {
      id: Date.now().toString(),
      task: newTodo.trim(),
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveTodos([todo, ...todos]);
    setNewTodo('');
  }

  function toggleTodo(id: string) {
    saveTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function deleteTodo(id: string) {
    saveTodos(todos.filter(t => t.id !== id));
  }

  function formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#888888]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f5f5f0]">Dashboard</h1>
        <p className="text-[#888888] mt-1">G'day ya sick cunt, welcome to the Squnderworld</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products */}
        <Link href="/hailsquatan/products" className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 hover:border-[#c41e3a] transition-colors group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#252525] rounded-lg flex items-center justify-center group-hover:bg-[#c41e3a]/10">
              <ShoppingBagIcon className="w-6 h-6 text-[#c41e3a]" />
            </div>
            <ChevronRightIcon className="w-5 h-5 text-[#666] group-hover:text-[#c41e3a]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#f5f5f0]">{stats?.products.total || 0}</div>
            <div className="text-sm text-[#888888]">Products</div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-[#888888]">{stats?.products.totalStock || 0} total units</span>
            {(stats?.products.lowStock || 0) > 0 && (
              <span className="text-[#c41e3a] ml-2">({stats?.products.lowStock} low stock)</span>
            )}
          </div>
        </Link>

        {/* Shows */}
        <Link href="/hailsquatan/shows" className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 hover:border-[#c41e3a] transition-colors group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#252525] rounded-lg flex items-center justify-center group-hover:bg-[#c41e3a]/10">
              <TicketIcon className="w-6 h-6 text-[#c41e3a]" />
            </div>
            <ChevronRightIcon className="w-5 h-5 text-[#666] group-hover:text-[#c41e3a]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#f5f5f0]">{stats?.shows.upcoming || 0}</div>
            <div className="text-sm text-[#888888]">Upcoming Shows</div>
          </div>
          <div className="mt-2 text-sm text-[#888888]">
            {stats?.shows.past || 0} past shows
          </div>
        </Link>

        {/* Orders */}
        <Link href="/hailsquatan/orders" className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 hover:border-[#c41e3a] transition-colors group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#252525] rounded-lg flex items-center justify-center group-hover:bg-[#c41e3a]/10">
              <ClipboardDocumentListIcon className="w-6 h-6 text-[#c41e3a]" />
            </div>
            <ChevronRightIcon className="w-5 h-5 text-[#666] group-hover:text-[#c41e3a]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#f5f5f0]">{stats?.orders.total || 0}</div>
            <div className="text-sm text-[#888888]">Total Orders</div>
          </div>
          <div className="mt-2 text-sm">
            {(stats?.orders.pending || 0) > 0 ? (
              <span className="text-yellow-500">{stats?.orders.pending} pending</span>
            ) : (
              <span className="text-[#888888]">All orders fulfilled</span>
            )}
          </div>
        </Link>

        {/* Revenue */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-[#252525] rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#f5f5f0]">{formatCurrency(stats?.orders.revenue || 0)}</div>
            <div className="text-sm text-[#888888]">Total Revenue</div>
          </div>
          <div className="mt-2 text-sm text-[#888888]">
            {stats?.music.releases || 0} music releases
          </div>
        </div>
      </div>

      {/* Alerts & Todos Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#f5f5f0] mb-4">Alerts</h2>
          <div className="space-y-3">
            {(stats?.products.lowStock || 0) > 0 && (
              <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#f5f5f0] font-medium">Low Stock Warning, Ya Muppet</div>
                  <div className="text-sm text-[#888888]">{stats?.products.lowStock} products have less than 5 units. Get off ya arse!</div>
                </div>
              </div>
            )}
            {(stats?.orders.pending || 0) > 0 && (
              <div className="flex items-start gap-3 bg-[#c41e3a]/10 border border-[#c41e3a]/30 rounded-lg p-4">
                <ClipboardDocumentListIcon className="w-5 h-5 text-[#c41e3a] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#f5f5f0] font-medium">Pending Orders, Ya Dropkick</div>
                  <div className="text-sm text-[#888888]">{stats?.orders.pending} orders need attention. Ship 'em ya bludger!</div>
                </div>
              </div>
            )}
            {stats?.shows.upcoming === 0 && (
              <div className="flex items-start gap-3 bg-[#252525] border border-[#333] rounded-lg p-4">
                <TicketIcon className="w-5 h-5 text-[#888888] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#f5f5f0] font-medium">No Upcoming Shows, Ya Flamin' Galah</div>
                  <div className="text-sm text-[#888888]">Book a show ya fuck! The fans are waiting</div>
                </div>
              </div>
            )}
            {(stats?.products.lowStock || 0) === 0 &&
             (stats?.orders.pending || 0) === 0 &&
             (stats?.shows.upcoming || 0) > 0 && (
              <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#f5f5f0] font-medium">All Good, Legend</div>
                  <div className="text-sm text-[#888888]">No dramas at the moment, ya bloody beauty</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Todos */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#f5f5f0] mb-4">Admin Tasks</h2>

          {/* Add Todo */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a task ya cunt..."
              className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] placeholder-[#666] focus:outline-none focus:border-[#c41e3a]"
            />
            <button
              onClick={addTodo}
              className="bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Todo List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {todos.length === 0 ? (
              <div className="text-[#666] text-sm text-center py-4">No tasks ya lazy cunt</div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    todo.completed
                      ? 'bg-[#0a0a0a] border-[#252525]'
                      : 'bg-[#252525] border-[#333]'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-[#666] hover:border-[#c41e3a]'
                    }`}
                  >
                    {todo.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      todo.completed ? 'text-[#666] line-through' : 'text-[#f5f5f0]'
                    }`}
                  >
                    {todo.task}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-[#666] hover:text-[#c41e3a] text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
        <h2 className="text-lg font-bold text-[#f5f5f0] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/hailsquatan/products"
            className="flex flex-col items-center gap-2 p-4 bg-[#252525] rounded-lg hover:bg-[#333] transition-colors"
          >
            <ShoppingBagIcon className="w-8 h-8 text-[#c41e3a]" />
            <span className="text-sm text-[#f5f5f0]">Add Product</span>
          </Link>
          <Link
            href="/hailsquatan/shows"
            className="flex flex-col items-center gap-2 p-4 bg-[#252525] rounded-lg hover:bg-[#333] transition-colors"
          >
            <TicketIcon className="w-8 h-8 text-[#c41e3a]" />
            <span className="text-sm text-[#f5f5f0]">Add Show</span>
          </Link>
          <Link
            href="/hailsquatan/music"
            className="flex flex-col items-center gap-2 p-4 bg-[#252525] rounded-lg hover:bg-[#333] transition-colors"
          >
            <MusicalNoteIcon className="w-8 h-8 text-[#c41e3a]" />
            <span className="text-sm text-[#f5f5f0]">Add Release</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex flex-col items-center gap-2 p-4 bg-[#252525] rounded-lg hover:bg-[#333] transition-colors"
          >
            <ArrowTrendingUpIcon className="w-8 h-8 text-[#c41e3a]" />
            <span className="text-sm text-[#f5f5f0]">View Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
