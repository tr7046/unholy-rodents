import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';
import { OrderSchema, OrderUpdateSchema, validateRequest } from '@/lib/schemas';
import { z } from 'zod';

type Order = z.infer<typeof OrderSchema> & { id: string; createdAt: string; updatedAt: string };

interface OrdersData {
  orders: Order[];
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<OrdersData>('orders');
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
    const data = await readData<OrdersData>('orders');

    const newOrder: Order = {
      ...order,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.orders.unshift(newOrder);
    await writeData('orders', data);

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
    const data = await readData<OrdersData>('orders');

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

    await writeData('orders', data);
    return NextResponse.json(data.orders[index]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
