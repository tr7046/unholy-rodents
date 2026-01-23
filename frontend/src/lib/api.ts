const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// Shows
export async function getShows() {
  return fetchApi<Show[]>('/shows');
}

export async function getPastShows(page = 1, limit = 10) {
  return fetchApi<Show[]>(`/shows/past?page=${page}&limit=${limit}`) as Promise<PaginatedResponse<Show>>;
}

export async function getShow(id: string) {
  return fetchApi<Show>(`/shows/${id}`);
}

// Releases
export async function getReleases() {
  return fetchApi<Release[]>('/releases');
}

export async function getRelease(id: string) {
  return fetchApi<Release>(`/releases/${id}`);
}

// Media
export async function getMedia(type?: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set('type', type);
  return fetchApi<Media[]>(`/media?${params}`) as Promise<PaginatedResponse<Media>>;
}

// Members
export async function getMembers() {
  return fetchApi<Member[]>('/members');
}

// Contact
export async function submitContact(data: ContactRequest) {
  return fetchApi<{ id: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Types (simplified for client)
export interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export interface Show {
  id: string;
  venue: Venue;
  date: string;
  doorsTime?: string;
  startTime?: string;
  ticketUrl?: string;
  ticketPrice?: number;
  ageRestriction?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  bands?: { bandName: string; setOrder: number; isHeadliner: boolean }[];
}

export interface Track {
  id: string;
  title: string;
  trackNumber: number;
  duration?: number;
  lyrics?: string;
}

export interface Release {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single' | 'demo' | 'split';
  releaseDate: string;
  coverArtUrl?: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  description?: string;
  tracks?: Track[];
}

export interface Media {
  id: string;
  type: 'photo' | 'video' | 'flyer';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  credit?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string;
}

export interface ContactRequest {
  type: 'booking' | 'press' | 'general' | 'merch';
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Site Content (CMS)
export async function getContent<T>(key: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}/content/${key}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function updateContent<T>(key: string, value: T, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/admin/content/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ value }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
