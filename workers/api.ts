/**
 * Cloudflare Worker API untuk Slug Generator
 * Endpoints:
 * - POST /api/create - Buat slug baru dengan KV storage
 * - GET /api/get/:slug - Ambil data URL berdasarkan slug
 */

export interface Env {
  SLUG_KV: KVNamespace;
}

interface SlugData {
  name: string;
  url: string;
  createdAt: string;
}

// Utility: Generate random suffix
function generateRandomSuffix(length: number = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility: Slugify nama aplikasi
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, '')    // Hapus karakter non-word
    .replace(/\-\-+/g, '-')      // Ganti multiple - dengan single -
    .replace(/^-+/, '')          // Trim - dari awal
    .replace(/-+$/, '');         // Trim - dari akhir
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POST /api/create - Buat slug baru
    if (url.pathname === '/api/create' && request.method === 'POST') {
      try {
        const body = await request.json() as { name: string; url: string };
        
        // Validasi input
        if (!body.name || !body.url) {
          return new Response(
            JSON.stringify({ error: 'Name and URL are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validasi URL Apps Script
        if (!body.url.includes('script.google.com')) {
          return new Response(
            JSON.stringify({ error: 'URL must be a valid Google Apps Script URL' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate slug
        let slug = slugify(body.name);
        let finalSlug = slug;

        // Cek apakah slug sudah dipakai, tambahkan suffix jika perlu
        let attempts = 0;
        while (await env.SLUG_KV.get(finalSlug) !== null && attempts < 10) {
          finalSlug = `${slug}-${generateRandomSuffix()}`;
          attempts++;
        }

        // Jika masih gagal setelah 10 percobaan
        if (attempts >= 10) {
          return new Response(
            JSON.stringify({ error: 'Failed to generate unique slug. Please try a different name.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Simpan ke KV
        const slugData: SlugData = {
          name: body.name,
          url: body.url,
          createdAt: new Date().toISOString(),
        };

        await env.SLUG_KV.put(finalSlug, JSON.stringify(slugData));

        return new Response(
          JSON.stringify({ 
            success: true, 
            slug: finalSlug,
            url: `${url.origin}/${finalSlug}`
          }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET /api/get/:slug - Ambil data slug
    if (url.pathname.startsWith('/api/get/') && request.method === 'GET') {
      const slug = url.pathname.replace('/api/get/', '');
      
      if (!slug) {
        return new Response(
          JSON.stringify({ error: 'Slug is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await env.SLUG_KV.get(slug);
      
      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Slug not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(data, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default 404
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  },
};
