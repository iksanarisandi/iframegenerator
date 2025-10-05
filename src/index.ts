/**
 * Slug Generator - All-in-One Cloudflare Worker
 * Handles frontend serving + API + slug viewing
 */

export interface Env {
  SLUG_KV: KVNamespace;
}

interface SlugData {
  name: string;
  url: string;
  createdAt: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// HTML Templates
function getHomepageHTML(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slug Generator - Apps Script URL Shortener</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      width: 100%;
      max-width: 600px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .dots {
      display: flex;
      gap: 6px;
    }
    
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .dot-blue { background: #4285F4; }
    .dot-green { background: #34A853; }
    .dot-yellow { background: #FBBC05; }
    
    h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    
    .subtitle {
      color: #6b7280;
      margin-top: 8px;
    }
    
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 40px;
      border: 1px solid #e5e7eb;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.3s;
      font-family: inherit;
    }
    
    input:focus {
      outline: none;
      border-color: #4285F4;
      box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
    }
    
    .help-text {
      margin-top: 6px;
      font-size: 12px;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .help-text code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 11px;
      color: #374151;
    }
    
    .btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-family: inherit;
    }
    
    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(66, 133, 244, 0.3);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .loading {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .loading.active {
      display: flex;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .result {
      display: none;
      margin-top: 24px;
      padding: 24px;
      background: linear-gradient(135deg, #d1fae5 0%, #dbeafe 100%);
      border-radius: 12px;
      border: 2px solid #34A853;
    }
    
    .result.active {
      display: block;
    }
    
    .result-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #047857;
      margin-bottom: 16px;
    }
    
    .check-icon {
      width: 24px;
      height: 24px;
    }
    
    .result-item {
      margin-bottom: 12px;
    }
    
    .result-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
    }
    
    .result-value {
      display: flex;
      gap: 8px;
    }
    
    .code {
      flex: 1;
      padding: 12px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      color: #34A853;
      overflow-x: auto;
    }
    
    .copy-btn {
      padding: 10px 16px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      transition: all 0.2s;
    }
    
    .copy-btn:hover {
      background: #f9fafb;
    }
    
    .copy-btn.copied {
      background: #34A853;
      color: white;
      border-color: #34A853;
    }
    
    .success-message {
      margin-top: 12px;
      font-size: 14px;
      color: #047857;
    }
    
    .error {
      display: none;
      margin-top: 16px;
      padding: 16px;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: 8px;
      color: #991b1b;
      font-size: 14px;
    }
    
    .error.active {
      display: block;
    }
    
    .footer {
      text-align: center;
      margin-top: 32px;
      color: #6b7280;
      font-size: 14px;
    }
    
    .footer a {
      color: #4285F4;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="dots">
          <div class="dot dot-blue"></div>
          <div class="dot dot-green"></div>
          <div class="dot dot-yellow"></div>
        </div>
        <h1>Slug Generator</h1>
      </div>
      <p class="subtitle">Generate custom URLs untuk Google Apps Script Web Apps Anda</p>
    </div>
    
    <div class="card">
      <form id="slugForm">
        <div class="form-group">
          <label for="appName">Nama Aplikasi</label>
          <input type="text" id="appName" placeholder="Contoh: My Awesome App" required>
          <p class="help-text">Slug akan dibuat otomatis dari nama ini</p>
        </div>
        
        <div class="form-group">
          <label for="appUrl">URL Apps Script Web App Deployment</label>
          <input type="url" id="appUrl" placeholder="https://script.google.com/macros/s/.../exec" required>
          <p class="help-text"><strong>⚠️ Penting:</strong> Gunakan URL <strong>deployment</strong> yang mengandung <code>/macros/s/</code> dan berakhir dengan <code>/exec</code></p>
        </div>
        
        <div class="error" id="error"></div>
        
        <button type="submit" class="btn" id="submitBtn">
          <span id="btnText">Generate Slug</span>
          <span class="loading" id="loading">
            <span class="spinner"></span>
            <span>Generating...</span>
          </span>
        </button>
      </form>
      
      <div class="result" id="result">
        <div class="result-title">
          <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Slug berhasil dibuat!</span>
        </div>
        
        <div class="result-item">
          <div class="result-label">Slug:</div>
          <div class="result-value">
            <code class="code" id="slugValue"></code>
          </div>
        </div>
        
        <div class="result-item">
          <div class="result-label">URL Custom:</div>
          <div class="result-value">
            <code class="code" id="urlValue"></code>
            <button class="copy-btn" id="copyBtn">Copy</button>
          </div>
        </div>
        
        <p class="success-message">🎉 Sekarang Anda bisa mengakses aplikasi melalui URL custom di atas!</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Powered by <a href="https://workers.cloudflare.com" target="_blank">Cloudflare Workers</a> & <a href="https://developers.google.com/apps-script" target="_blank">Google Apps Script</a></p>
    </div>
  </div>
  
  <script>
    const form = document.getElementById('slugForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const error = document.getElementById('error');
    const copyBtn = document.getElementById('copyBtn');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('appName').value;
      const url = document.getElementById('appUrl').value;
      
      // Reset states
      error.classList.remove('active');
      result.classList.remove('active');
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      loading.classList.add('active');
      
      try {
        const response = await fetch('/api/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, url })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Gagal membuat slug');
        }
        
        // Show result
        document.getElementById('slugValue').textContent = data.slug;
        document.getElementById('urlValue').textContent = data.url;
        result.classList.add('active');
        
        // Reset form
        form.reset();
      } catch (err) {
        error.textContent = err.message;
        error.classList.add('active');
      } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loading.classList.remove('active');
      }
    });
    
    copyBtn.addEventListener('click', async () => {
      const url = document.getElementById('urlValue').textContent;
      await navigator.clipboard.writeText(url);
      
      copyBtn.textContent = '✓ Copied!';
      copyBtn.classList.add('copied');
      
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  </script>
</body>
</html>`;
}

function getSlugViewerHTML(data: SlugData): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
</head>
<body>
  <iframe src="${data.url}" 
          title="${data.name}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
  </iframe>
</body>
</html>`;
}

function get404HTML(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slug Tidak Ditemukan</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      text-align: center;
      max-width: 500px;
    }
    
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 48px 40px;
      border: 1px solid #e5e7eb;
    }
    
    .icon {
      width: 64px;
      height: 64px;
      background: #fee2e2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    
    .icon svg {
      width: 32px;
      height: 32px;
      color: #dc2626;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 12px;
    }
    
    p {
      color: #6b7280;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(66, 133, 244, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      <h1>Slug Tidak Ditemukan</h1>
      <p>Maaf, slug yang Anda cari tidak ada dalam database kami.</p>
      <a href="/" class="btn">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Kembali ke Home
      </a>
    </div>
  </div>
</body>
</html>`;
}

// Main Worker Handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: Homepage
    if (path === '/') {
      return new Response(getHomepageHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Route: POST /api/create - Create new slug
    if (path === '/api/create' && request.method === 'POST') {
      try {
        const body = await request.json() as { name: string; url: string };

        // Validate input
        if (!body.name || !body.url) {
          return new Response(
            JSON.stringify({ error: 'Name and URL are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate URL - must be a deployed web app URL
        if (!body.url.includes('script.google.com/macros/s/')) {
          return new Response(
            JSON.stringify({ 
              error: 'URL harus berupa Apps Script Web App deployment URL (harus mengandung "/macros/s/" dan berakhir dengan "/exec"). Contoh: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec' 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate slug
        let slug = slugify(body.name);
        let finalSlug = slug;

        // Check for duplicates and add suffix if needed
        let attempts = 0;
        while (await env.SLUG_KV.get(finalSlug) !== null && attempts < 10) {
          finalSlug = `${slug}-${generateRandomSuffix()}`;
          attempts++;
        }

        if (attempts >= 10) {
          return new Response(
            JSON.stringify({ error: 'Failed to generate unique slug. Please try a different name.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Save to KV
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
            url: `${url.origin}/${finalSlug}`,
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

    // Route: GET /api/get/:slug - Get slug data (for API consumers)
    if (path.startsWith('/api/get/') && request.method === 'GET') {
      const slug = path.replace('/api/get/', '');

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

    // Route: GET /:slug - Slug viewer (iframe page)
    if (path !== '/' && !path.startsWith('/api/')) {
      const slug = path.substring(1); // Remove leading slash

      const data = await env.SLUG_KV.get(slug);

      if (!data) {
        return new Response(get404HTML(), {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      const slugData: SlugData = JSON.parse(data);

      return new Response(getSlugViewerHTML(slugData), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Default 404
    return new Response(get404HTML(), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
