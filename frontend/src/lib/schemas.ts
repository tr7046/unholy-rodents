import { z } from 'zod';

// ============================================
// PRODUCT SCHEMAS
// ============================================

export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name required'),
  price: z.number().int().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().optional(),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Product name required'),
  slug: z.string().min(1, 'Slug required'),
  description: z.string(),
  category: z.enum(['apparel', 'accessories', 'bundles', 'music']),
  images: z.array(z.string()),
  featured: z.boolean(),
  tags: z.array(z.string()),
  variants: z.array(ProductVariantSchema).min(1, 'At least one variant required'),
});

export const ShippingRatesSchema = z.object({
  standard: z.object({
    name: z.string(),
    price: z.number().int().min(0),
    estimatedDays: z.string(),
  }),
  express: z.object({
    name: z.string(),
    price: z.number().int().min(0),
    estimatedDays: z.string(),
  }),
  freeShippingThreshold: z.number().int().min(0),
});

// ============================================
// SHOW SCHEMAS
// ============================================

export const VenueSchema = z.object({
  name: z.string().min(1, 'Venue name required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
});

export const BandSchema = z.object({
  name: z.string().min(1, 'Band name required'),
  isHeadliner: z.boolean(),
});

export const ShowSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'Date required'),
  venue: VenueSchema,
  doorsTime: z.string().optional(),
  ticketUrl: z.string().url().nullable().optional(),
  bands: z.array(BandSchema).optional(),
});

// ============================================
// MUSIC SCHEMAS
// ============================================

export const TrackSchema = z.object({
  title: z.string().min(1, 'Track title required'),
  duration: z.string(),
});

export const StreamingLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

export const ReleaseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Release title required'),
  type: z.enum(['album', 'ep', 'single']),
  releaseDate: z.string(),
  coverArt: z.string(),
  tracks: z.array(TrackSchema),
  streamingLinks: z.array(StreamingLinkSchema),
});

// ============================================
// ABOUT SCHEMAS
// ============================================

export const MemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name required'),
  role: z.string().min(1, 'Role required'),
  bio: z.string(),
  image: z.string(),
});

export const PhilosophyItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// ============================================
// MEDIA SCHEMAS
// ============================================

export const MediaItemSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1, 'URL required'),
  thumbnailUrl: z.string().optional(),
  title: z.string().optional(),
  createdAt: z.string().optional(),
});

export const MediaTypeSchema = z.enum(['photos', 'videos', 'flyers']);

// ============================================
// HOMEPAGE SCHEMAS
// ============================================

export const HomepageHeroSchema = z.object({
  title: z.string(),
  tagline: z.array(z.string()),
  marqueeText: z.string(),
});

export const HomepageSchema = z.object({
  hero: HomepageHeroSchema,
  featuredShow: z.object({
    enabled: z.boolean(),
    showId: z.string().nullable(),
  }),
  featuredRelease: z.object({
    enabled: z.boolean(),
    releaseId: z.string().nullable(),
    placeholderText: z.string(),
  }),
});

// ============================================
// ORDER SCHEMAS
// ============================================

export const OrderAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

export const OrderCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address: OrderAddressSchema,
});

export const OrderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  variantName: z.string(),
  price: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const OrderStatusSchema = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

export const OrderSchema = z.object({
  id: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  customer: OrderCustomerSchema,
  shipping: z.object({
    method: z.enum(['standard', 'express']),
    cost: z.number().int().min(0),
  }),
  subtotal: z.number().int().min(0),
  total: z.number().int().min(0),
  status: OrderStatusSchema,
  trackingNumber: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const OrderUpdateSchema = z.object({
  id: z.string(),
  status: OrderStatusSchema,
  trackingNumber: z.string().optional(),
});

// ============================================
// FILE UPLOAD
// ============================================

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_FOLDERS = ['products', 'members', 'media'] as const;

export const UploadFolderSchema = z.enum(ALLOWED_FOLDERS);

// ============================================
// HELPER FUNCTION
// ============================================

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errors };
}
