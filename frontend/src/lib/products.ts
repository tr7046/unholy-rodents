// ============================================
// PRODUCT TYPES AND HELPERS
// ============================================

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'apparel' | 'accessories' | 'bundles' | 'music';
  images: string[];
  variants: ProductVariant[];
  featured?: boolean;
  tags?: string[];
}

export interface ShippingRates {
  standard: {
    name: string;
    price: number;
    estimatedDays: string;
  };
  express: {
    name: string;
    price: number;
    estimatedDays: string;
  };
  freeShippingThreshold: number;
}

export interface ProductsData {
  products: Product[];
  shippingRates: ShippingRates;
}

// Default shipping rates (used by cart which needs sync access)
export const shippingRates: ShippingRates = {
  standard: {
    name: 'Standard Shipping',
    price: 599,
    estimatedDays: '5-7 business days',
  },
  express: {
    name: 'Express Shipping',
    price: 1299,
    estimatedDays: '2-3 business days',
  },
  freeShippingThreshold: 7500,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function isInStock(variant: ProductVariant): boolean {
  return variant.stock > 0;
}

export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function getLowestPrice(product: Product): number {
  return Math.min(...product.variants.map(v => v.price));
}

export function calculateShipping(subtotal: number, method: 'standard' | 'express' = 'standard'): number {
  if (subtotal >= shippingRates.freeShippingThreshold) {
    return 0;
  }
  return shippingRates[method].price;
}

// Server-side data loading functions
export function getProductBySlug(products: Product[], slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductById(products: Product[], id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getFeaturedProducts(products: Product[]): Product[] {
  return products.filter(p => p.featured);
}

export function getProductsByCategory(products: Product[], category: Product['category']): Product[] {
  return products.filter(p => p.category === category);
}
