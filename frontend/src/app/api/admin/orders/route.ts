import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { OrderSchema, OrderUpdateSchema, validateRequest } from '@/lib/schemas';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'orders';

type Order = z.infer<typeof OrderSchema> & { id: string; createdAt: string; updatedAt: string };

interface OrdersData {
  orders: Order[];
}

const defaultData: OrdersData = {
  orders: [],
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<OrdersData> {
  try {
    const response = await fetch(`${API_URL}/content/${CONTENT_KEY}`, {
      cache: 'no-store',
    });
    if (!response.ok) return defaultData;
    return await response.json();
  } catch {
    return defaultData;
  }
}

async function saveContentToBackend(data: OrdersData, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${CONTENT_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ value: data }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getContentFromBackend();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Orders can be created without admin auth (from checkout)
    const body = await request.json();
    const validation = validateRequest(OrderSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const order = validation.data;
    const data = await getContentFromBackend();
    // For public order creation, we don't have admin token - use empty string
    const token = request.cookies.get('admin_token')?.value || '';

    const newOrder: Order = {
      ...order,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.orders.unshift(newOrder);
    await saveContentToBackend(data, token);

    return NextResponse.json(newOrder, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequest(OrderUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { id, status, trackingNumber } = validation.data;
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    const index = data.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    data.orders[index] = {
      ...data.orders[index],
      status: status,
      trackingNumber: trackingNumber || data.orders[index].trackingNumber,
      updatedAt: new Date().toISOString(),
    };

    await saveContentToBackend(data, token);
    return NextResponse.json(data.orders[index]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
