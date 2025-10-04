# 🚀 Setup Instructions

## Quick Setup Guide untuk Development

### 1. Install Wrangler (jika belum)

```bash
npm install -g wrangler
```

### 2. Login ke Cloudflare

```bash
wrangler login
```

### 3. Buat KV Namespaces

```bash
# Production namespace
wrangler kv:namespace create "SLUG_KV"

# Preview namespace
wrangler kv:namespace create "SLUG_KV" --preview
```

**Output contoh:**
```
⛅️ wrangler 3.x.x
-------------------
🌀  Creating namespace with title "slug-generator-api-SLUG_KV"
✨  Success!
Add the following to your wrangler.toml:
{ binding = "SLUG_KV", id = "abc123def456..." }

🌀  Creating namespace with title "slug-generator-api-SLUG_KV_preview"
✨  Success!
Add the following to your wrangler.toml:
{ binding = "SLUG_KV", preview_id = "xyz789uvw..." }
```

### 4. Update wrangler.toml

Ganti `your_kv_namespace_id` dan `your_preview_kv_namespace_id` dengan ID dari step 3:

```toml
kv_namespaces = [
  { binding = "SLUG_KV", id = "abc123def456...", preview_id = "xyz789uvw..." }
]
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Setup Environment Variables

Copy file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

### 7. Start Development

**Terminal 1** - Jalankan Worker:
```bash
npm run worker:dev
```

**Terminal 2** - Jalankan Next.js:
```bash
npm run dev
```

### 8. Test Aplikasi

Buka browser: `http://localhost:3000`

---

## Production Deployment

### Deploy Worker

```bash
npm run worker:deploy
```

Copy URL Worker yang dihasilkan (contoh: `https://slug-generator-api.your-subdomain.workers.dev`)

### Deploy Frontend ke Cloudflare Pages

**Option A: Via Dashboard (Recommended)**

1. Push code ke GitHub
2. Buka Cloudflare Dashboard → Pages → Create a project
3. Connect ke GitHub repository
4. Set configuration:
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Build output directory: `.next`
5. Add environment variable:
   - Key: `NEXT_PUBLIC_WORKER_URL`
   - Value: `https://slug-generator-api.your-subdomain.workers.dev`
6. Deploy!

**Option B: Via CLI**

```bash
# Build dulu
npm run build

# Deploy ke Pages
wrangler pages deploy .next
```

---

## Troubleshooting

### Error: KV namespace not found

**Solusi:**
1. Pastikan KV namespace sudah dibuat
2. Check ID di `wrangler.toml` sudah benar
3. Coba deploy ulang Worker: `npm run worker:deploy`

### Error: Worker URL not responding

**Solusi:**
1. Check Worker sudah running: `wrangler tail` untuk lihat logs
2. Pastikan `NEXT_PUBLIC_WORKER_URL` di `.env.local` sudah benar
3. Untuk local dev, gunakan: `http://localhost:8787`

### Error: CORS issue

**Solusi:**
- Worker API sudah include CORS headers
- Check browser console untuk detail error
- Pastikan request dari origin yang benar

### Error: Cannot find module '@cloudflare/workers-types'

**Solusi:**
```bash
npm install -D @cloudflare/workers-types
```

---

## Testing Commands

### Test KV Operations

```bash
# Insert test data
wrangler kv:key put "test-slug" '{"name":"Test App","url":"https://script.google.com/test","createdAt":"2025-10-04T00:00:00.000Z"}' --binding=SLUG_KV

# Get test data
wrangler kv:key get "test-slug" --binding=SLUG_KV

# Delete test data
wrangler kv:key delete "test-slug" --binding=SLUG_KV

# List all keys
wrangler kv:key list --binding=SLUG_KV
```

### View Worker Logs (Production)

```bash
wrangler tail
```

---

## Next Steps

1. ✅ Setup custom domain di Cloudflare Pages
2. ✅ Add rate limiting di Worker (via Cloudflare Dashboard)
3. ✅ Setup analytics tracking
4. ✅ Add monitoring & alerts
5. ✅ Configure caching rules

---

**Need help?** Check `README.md` untuk dokumentasi lengkap!
