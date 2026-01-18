import { promises as fs } from 'fs';
import path from 'path';
import StoreClient from './StoreClient';
import type { ProductsData } from '@/lib/products';

async function getProductsData(): Promise<ProductsData> {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export default async function StorePage() {
  const data = await getProductsData();
  return <StoreClient products={data.products} shippingRates={data.shippingRates} />;
}
