import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readData, writeData, generateId } from '@/lib/data';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  featured: boolean;
  tags: string[];
  variants: ProductVariant[];
}

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

    const product = await request.json();
    const data = await readData<ProductsData>('products');

    const newProduct: Product = {
      ...product,
      id: generateId(),
      variants: product.variants?.map((v: Omit<ProductVariant, 'id'>) => ({
        ...v,
        id: generateId(),
      })) || [],
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

    const product = await request.json();
    const data = await readData<ProductsData>('products');

    const index = data.products.findIndex((p) => p.id === product.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    data.products[index] = product;
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
