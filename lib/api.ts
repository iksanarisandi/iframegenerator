/**
 * API Client untuk berkomunikasi dengan Cloudflare Worker
 */

// Sesuaikan dengan URL Worker Anda setelah deployment
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';

export interface CreateSlugRequest {
  name: string;
  url: string;
}

export interface CreateSlugResponse {
  success: boolean;
  slug: string;
  url: string;
}

export interface SlugData {
  name: string;
  url: string;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Buat slug baru
 */
export async function createSlug(data: CreateSlugRequest): Promise<CreateSlugResponse> {
  const response = await fetch(`${WORKER_URL}/api/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(response.status, error.error || 'Failed to create slug');
  }

  return response.json();
}

/**
 * Ambil data slug
 */
export async function getSlugData(slug: string): Promise<SlugData> {
  const response = await fetch(`${WORKER_URL}/api/get/${slug}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(response.status, error.error || 'Slug not found');
  }

  return response.json();
}
