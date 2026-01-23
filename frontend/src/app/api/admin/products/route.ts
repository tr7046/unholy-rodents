import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ProductSchema, validateRequest } from '@/lib/schemas';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const CONTENT_KEY = 'products';

type Product = z.infer<typeof ProductSchema> & { id: string };

interface ProductsData {
  products: Product[];
  shippingRates: {
    standard: { name: string; price: number; estimatedDays: string };
    express: { name: string; price: number; estimatedDays: string };
    freeShippingThreshold: number;
  };
}

const defaultData: ProductsData = {
  products: [],
  shippingRates: {
    standard: { name: 'Standard Shipping', price: 5.99, estimatedDays: '5-7' },
    express: { name: 'Express Shipping', price: 12.99, estimatedDays: '2-3' },
    freeShippingThreshold: 50,
  },
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Disable caching for dynamic data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getContentFromBackend(): Promise<ProductsData> {
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

async function saveContentToBackend(data: ProductsData, token: string): Promise<boolean> {
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
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateRequest(ProductSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const product = validation.data;
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    const newProduct: Product = {
      ...product,
      id: generateId(),
      variants: product.variants.map((v) => ({
        ...v,
        id: v.id || generateId(),
      })),
    };

    data.products.push(newProduct);
    await saveContentToBackend(data, token);

    return NextResponse.json(newProduct, { status: 201 });
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
    const validation = validateRequest(ProductSchema.extend({ id: z.string() }), body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const product = validation.data;
    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';

    const index = data.products.findIndex((p) => p.id === product.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    data.products[index] = product as Product;
    await saveContentToBackend(data, token);

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const data = await getContentFromBackend();
    const token = request.cookies.get('admin_token')?.value || '';
    data.products = data.products.filter((p) => p.id !== id);
    await saveContentToBackend(data, token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
