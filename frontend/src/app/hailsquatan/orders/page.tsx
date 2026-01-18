'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  shipping: {
    method: 'standard' | 'express';
    cost: number;
  };
  subtotal: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersData {
  orders: Order[];
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500', icon: ClockIcon },
  processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-500', icon: ClockIcon },
  shipped: { label: 'Shipped', color: 'bg-purple-500/20 text-purple-500', icon: TruckIcon },
  delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-500', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-500', icon: XCircleIcon },
};

export default function OrdersAdminPage() {
  const [data, setData] = useState<OrdersData | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/admin/orders');
    if (res.ok) {
      setData(await res.json());
    }
  }

  async function updateOrderStatus(id: string, status: Order['status'], trackingNumber?: string) {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, trackingNumber }),
    });
    await fetchData();
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f5f5f0]">Orders</h1>
        <p className="text-[#888888] mt-1">{data.orders.length} orders</p>
      </div>

      {/* Orders List */}
      {data.orders.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-12 text-center">
          <TruckIcon className="w-12 h-12 text-[#666] mx-auto mb-4" />
          <p className="text-[#888888]">No orders yet ya cunts. Tell the fans to buy some merch!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[#252525] transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[#f5f5f0] font-medium">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-sm text-[#888888]">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-[#f5f5f0]">{order.customer.name}</div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig[order.status].label}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[#f5f5f0] font-medium">{formatPrice(order.total)}</div>
                      <div className="text-sm text-[#888888]">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-[#888888]" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-[#888888]" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#333] p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-medium text-[#888888] uppercase tracking-wider mb-3">
                          Items
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-[#f5f5f0]">
                                {item.productName} ({item.variantName}) x{item.quantity}
                              </span>
                              <span className="text-[#888888]">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-[#333] pt-2 mt-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#888888]">Subtotal</span>
                              <span className="text-[#f5f5f0]">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#888888]">
                                Shipping ({order.shipping.method})
                              </span>
                              <span className="text-[#f5f5f0]">
                                {formatPrice(order.shipping.cost)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-medium mt-1">
                              <span className="text-[#f5f5f0]">Total</span>
                              <span className="text-[#c41e3a]">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer */}
                      <div>
                        <h4 className="text-sm font-medium text-[#888888] uppercase tracking-wider mb-3">
                          Customer
                        </h4>
                        <div className="text-sm text-[#f5f5f0]">
                          <p>{order.customer.name}</p>
                          <p className="text-[#888888]">{order.customer.email}</p>
                        </div>
                        <div className="text-sm text-[#888888] mt-3">
                          <p>{order.customer.address.line1}</p>
                          {order.customer.address.line2 && <p>{order.customer.address.line2}</p>}
                          <p>
                            {order.customer.address.city}, {order.customer.address.state}{' '}
                            {order.customer.address.zip}
                          </p>
                          <p>{order.customer.address.country}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h4 className="text-sm font-medium text-[#888888] uppercase tracking-wider mb-3">
                          Update Status
                        </h4>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as Order['status'])
                          }
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {(order.status === 'shipped' || order.status === 'delivered') && (
                          <div className="mt-3">
                            <label className="block text-sm text-[#888888] mb-1">
                              Tracking Number
                            </label>
                            <input
                              type="text"
                              value={order.trackingNumber || ''}
                              onChange={(e) =>
                                updateOrderStatus(order.id, order.status, e.target.value)
                              }
                              placeholder="Enter tracking number"
                              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
