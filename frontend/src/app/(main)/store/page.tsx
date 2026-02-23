import StoreClient from './StoreClient';
import type { ProductsData, ShippingRates } from '@/lib/products';
import { shippingRates as defaultShippingRates } from '@/lib/products';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getProductsData(): Promise<ProductsData> {
  try {
    const response = await fetch(`${API_URL}/content/products`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return { products: [], shippingRates: defaultShippingRates };
    }

    const data = await response.json();
    return {
      products: Array.isArray(data?.products) ? data.products : [],
      shippingRates: data?.shippingRates || defaultShippingRates,
    };
  } catch {
    return { products: [], shippingRates: defaultShippingRates };
  }
}

export default async function StorePage() {
  const data = await getProductsData();
  return <StoreClient products={data.products} shippingRates={data.shippingRates} />;
}
