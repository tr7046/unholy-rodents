import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';
import { ProductSchema, validateRequest } from '@/lib/schemas';
import { z } from 'zod';

type Product = z.infer<typeof ProductSchema> & { id: string };

interface ProductsData {
  products: Product[];
  shippingRates: {
    standard: { name: string; price: number; estimatedDays: string };
    express: { name: string; price: number; estimatedDays: string };
    freeShippingThreshold: number;
  };
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await readData<ProductsData>('products');
    return NextResponse.json(data);
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
    const data = await readData<ProductsData>('products');

    const newProduct: Product = {
      ...product,
      id: generateId(),
      variants: product.variants.map((v) => ({
        ...v,
        id: v.id || generateId(),
      })),
    };

    data.products.push(newProduct);
    await writeData('products', data);

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
    const data = await readData<ProductsData>('products');

    const index = data.products.findIndex((p) => p.id === product.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    data.products[index] = product as Product;
    await writeData('products', data);

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

    const data = await readData<ProductsData>('products');
    data.products = data.products.filter((p) => p.id !== id);
    await writeData('products', data);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
