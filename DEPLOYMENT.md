# 🚢 Deployment Checklist

## Pre-Deployment Checklist

### ✅ Persiapan Cloudflare

- [ ] Akun Cloudflare sudah dibuat
- [ ] Wrangler CLI sudah terinstall (`npm install -g wrangler`)
- [ ] Sudah login via `wrangler login`
- [ ] KV namespace production sudah dibuat
- [ ] KV namespace preview sudah dibuat
- [ ] ID namespace sudah diupdate di `wrangler.toml`

### ✅ Environment Setup

- [ ] File `.env.local` sudah dibuat untuk local development
- [ ] Environment variables production sudah disiapkan
- [ ] Worker URL sudah dicatat untuk konfigurasi Pages

### ✅ Code Review

- [ ] Semua TypeScript errors sudah resolved
- [ ] ESLint warnings sudah dicek
- [ ] Build berhasil tanpa error (`npm run build`)
- [ ] Testing manual di local environment berhasil

---

## Deployment Steps

### Step 1: Deploy Cloudflare Worker

```bash
# Make sure you're in project root
cd slug-generator

# Deploy worker
npm run worker:deploy
```

**Output expected:**
```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded slug-generator-api (X.XX sec)
Published slug-generator-api (X.XX sec)
  https://slug-generator-api.your-subdomain.workers.dev
```

**📋 Action:** Copy Worker URL dan simpan untuk step berikutnya!

---

### Step 2: Verify Worker is Running

Test Worker endpoint:

```bash
# Test create endpoint (should return error karena missing data)
curl -X POST https://slug-generator-api.your-subdomain.workers.dev/api/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test App","url":"https://script.google.com/test"}'

# Expected: JSON response with slug
```

---

### Step 3: Deploy Frontend ke Cloudflare Pages

#### Option A: Via GitHub + Cloudflare Dashboard (Recommended)

**1. Push ke GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: Slug Generator app"
git branch -M main
git remote add origin https://github.com/yourusername/slug-generator.git
git push -u origin main
```

**2. Connect di Cloudflare Dashboard:**

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih account Anda
3. Klik **Pages** di sidebar
4. Klik **Create a project**
5. Pilih **Connect to Git**
6. Authorize GitHub dan pilih repository `slug-generator`
7. Set configuration:

**Build settings:**
```
Production branch: main
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
```

**Environment Variables:**
```
NEXT_PUBLIC_WORKER_URL = https://slug-generator-api.your-subdomain.workers.dev
```

8. Klik **Save and Deploy**

**3. Tunggu deployment selesai** (~2-3 menit)

**4. Test aplikasi** di URL yang diberikan Cloudflare Pages

---

#### Option B: Via Wrangler CLI

```bash
# Build aplikasi
npm run build

# Deploy ke Pages
wrangler pages deploy .next --project-name=slug-generator

# Follow prompts untuk setup project
```

---

### Step 4: Post-Deployment Verification

#### Test Full Flow:

**1. Buka aplikasi Pages URL**

**2. Generate slug:**
- Input nama: "Test Application"
- Input URL: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
- Klik "Generate Slug"

**3. Verify response:**
- Slug berhasil dibuat (contoh: `test-application`)
- Custom URL ditampilkan
- Copy URL button berfungsi

**4. Test slug viewer:**
- Akses `https://your-pages-url.pages.dev/test-application`
- Iframe harus load URL Apps Script
- Halaman harus full-screen tanpa error

**5. Test 404:**
- Akses slug yang tidak ada: `https://your-pages-url.pages.dev/nonexistent`
- Harus muncul halaman 404 custom

---

## Custom Domain Setup (Optional)

### Setup Domain di Cloudflare Pages

1. Buka Pages project → **Custom domains**
2. Klik **Set up a custom domain**
3. Masukkan domain Anda (contoh: `sluggen.yourdomain.com`)
4. Ikuti instruksi untuk add DNS records
5. Tunggu DNS propagation (~5-10 menit)

### Update Worker CORS (jika perlu)

Jika menggunakan custom domain, pastikan CORS headers di Worker menerima domain tersebut.

Edit `workers/api.ts`:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://sluggen.yourdomain.com', // Update ini
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

Atau gunakan wildcard untuk flexibility:
```typescript
'Access-Control-Allow-Origin': '*'
```

Deploy ulang Worker:
```bash
npm run worker:deploy
```

---

## Monitoring & Maintenance

### Cloudflare Dashboard

**Worker Analytics:**
- Workers & Pages → slug-generator-api → Metrics
- Monitor: Requests, Errors, CPU Time

**Pages Analytics:**
- Pages → slug-generator → Analytics
- Monitor: Visits, Bandwidth, Build times

**KV Usage:**
- Workers & Pages → KV → SLUG_KV
- Monitor: Storage used, Operations

### Logs

**Real-time Worker logs:**
```bash
wrangler tail
```

**Pages logs:**
- Check di Cloudflare Dashboard → Pages → Deployment logs

---

## Rollback Strategy

### Rollback Worker

```bash
# List deployments
wrangler deployments list

# Rollback ke deployment sebelumnya
wrangler rollback [DEPLOYMENT_ID]
```

### Rollback Pages

1. Buka Cloudflare Dashboard → Pages → Deployments
2. Pilih deployment yang stabil
3. Klik **...** → **Retry deployment** atau **Rollback to this deployment**

---

## Performance Optimization

### Caching Rules (Pages)

Set di Cloudflare Dashboard → Pages → Settings → Functions:

- Cache static assets: 1 year
- Cache API responses: 5 minutes (dengan stale-while-revalidate)

### Worker Optimization

- Enable minification di `wrangler.toml`:
```toml
minify = true
```

- Use KV efficiently:
  - TTL untuk frequently accessed slugs
  - Implement caching di Worker level

---

## Security Checklist

- [ ] Rate limiting enabled (via Cloudflare Dashboard)
- [ ] CORS configured properly
- [ ] URL validation active di Worker
- [ ] No sensitive data exposed di frontend
- [ ] Environment variables properly secured

---

## Cost Monitoring

### Free Tier Limits (Cloudflare)

**Workers:**
- 100,000 requests/day
- 10ms CPU time per request

**KV:**
- 100,000 reads/day
- 1,000 writes/day
- 1 GB storage

**Pages:**
- 500 builds/month
- Unlimited bandwidth

**💡 Tip:** Set up billing alerts di Cloudflare Dashboard untuk monitor usage!

---

## Troubleshooting Production Issues

### Issue: Worker returns 500 errors

**Debug:**
```bash
wrangler tail
```

**Common causes:**
- KV binding tidak tersedia
- TypeScript compilation error
- Runtime error di Worker code

### Issue: Pages build fails

**Check:**
- Build logs di Cloudflare Dashboard
- Environment variables configured
- Node version compatibility

### Issue: Slug viewer tidak load iframe

**Check:**
- CORS settings di Apps Script deployment
- URL Apps Script masih valid
- Network tab di browser DevTools

---

## Success Metrics

Monitor these metrics untuk ensure aplikasi berjalan baik:

- ✅ **Uptime**: Target 99.9%
- ✅ **Response time**: < 200ms (Worker API)
- ✅ **Build success rate**: 100%
- ✅ **Error rate**: < 0.1%

---

## Next: Post-Launch

1. 📊 Setup analytics (Google Analytics, Cloudflare Web Analytics)
2. 🔔 Configure alerts untuk downtime/errors
3. 📝 Document common user issues
4. 🚀 Plan feature updates
5. 💬 Collect user feedback

---

**🎉 Deployment Complete!**

Your Slug Generator app is now live and ready to use!

**Helpful Links:**
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
