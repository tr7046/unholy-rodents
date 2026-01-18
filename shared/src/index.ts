// Unholy Rodents - Shared Types

// ============================================
// SHOWS & VENUES
// ============================================

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity?: number;
  website?: string;
  lat?: number;
  lng?: number;
  createdAt: Date;
}

export interface ShowBand {
  id: string;
  showId: string;
  bandName: string;
  setOrder: number;
  isHeadliner: boolean;
}

export interface Show {
  id: string;
  venueId: string;
  venue?: Venue;
  date: Date;
  doorsTime?: string;
  startTime?: string;
  ticketUrl?: string;
  ticketPrice?: number;
  ageRestriction?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  notes?: string;
  bands?: ShowBand[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MUSIC & RELEASES
// ============================================

export interface Track {
  id: string;
  releaseId: string;
  title: string;
  trackNumber: number;
  duration?: number; // seconds
  lyrics?: string;
  spotifyId?: string;
  previewUrl?: string;
}

export interface Release {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single' | 'demo' | 'split';
  releaseDate: Date;
  coverArtUrl?: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  description?: string;
  tracks?: Track[];
  createdAt: Date;
}

// ============================================
// MEDIA
// ============================================

export interface MediaTag {
  id: string;
  mediaId: string;
  tag: string;
}

export interface Media {
  id: string;
  type: 'photo' | 'video' | 'flyer';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  credit?: string;
  showId?: string;
  tags?: MediaTag[];
  createdAt: Date;
}

// ============================================
// BAND MEMBERS
// ============================================

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string; // e.g., "Vocals", "Guitar", "Bass", "Drums"
  bio?: string;
  photoUrl?: string;
  isActive: boolean;
  joinedDate?: Date;
  gear?: string;
  socialLinks?: SocialLinks;
}

// ============================================
// MERCH (Phase 2)
// ============================================

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  priceOverride?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'shirt' | 'hoodie' | 'vinyl' | 'cd' | 'cassette' | 'patch' | 'poster' | 'other';
  images: string[];
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt: Date;
}

// ============================================
// SUBSCRIBERS & CONTACT
// ============================================

export interface SubscriberPreferences {
  showAlerts: boolean;
  newReleases: boolean;
  merchDrops: boolean;
  newsletter: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  source: 'website' | 'show' | 'merch' | 'other';
  isActive: boolean;
  preferences: SubscriberPreferences;
}

export interface ContactForm {
  id: string;
  type: 'booking' | 'press' | 'general' | 'merch';
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: Date;
}

// ============================================
// PRESS KIT
// ============================================

export interface PressKitFile {
  id: string;
  type: 'bio' | 'photo' | 'logo' | 'rider' | 'epk';
  fileUrl: string;
  description?: string;
  createdAt: Date;
}

// ============================================
// ADMIN
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: Date;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// API REQUEST TYPES
// ============================================

export interface CreateShowRequest {
  venueId: string;
  date: string;
  doorsTime?: string;
  startTime?: string;
  ticketUrl?: string;
  ticketPrice?: number;
  ageRestriction?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  notes?: string;
  bands?: Omit<ShowBand, 'id' | 'showId'>[];
}

export interface CreateReleaseRequest {
  title: string;
  type: Release['type'];
  releaseDate: string;
  coverArtUrl?: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  description?: string;
}

export interface SubscribeRequest {
  email: string;
  name?: string;
  source?: Subscriber['source'];
  preferences?: Partial<SubscriberPreferences>;
}

export interface ContactRequest {
  type: ContactForm['type'];
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<AdminUser, 'createdAt'>;
}
