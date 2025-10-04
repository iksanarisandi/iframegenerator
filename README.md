# 🔗 Slug Generator - Apps Script URL Shortener

Aplikasi web minimalis untuk generate custom URL pendek untuk Google Apps Script Web Apps Anda. Dibangun dengan **Next.js**, **TypeScript**, **TailwindCSS**, dan **Cloudflare** (Workers + KV + Pages).

## ✨ Fitur

- 🎯 **Generate Slug Otomatis** - Buat slug SEO-friendly dari nama aplikasi
- 🔄 **Anti-Duplikasi** - Automatic random suffix jika slug sudah dipakai
- 📱 **Responsive Design** - Minimalis, clean, mobile-friendly
- ⚡ **Fast & Secure** - Powered by Cloudflare Edge Network
- 🎨 **Apps Script Theme** - Warna aksen Google Apps Script (#4285F4, #34A853, #FBBC05)
- 🖼️ **Iframe Viewer** - Full-screen responsive iframe untuk tampilkan web app

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ dan npm
- Akun Cloudflare (free tier cukup)
- Wrangler CLI: `npm install -g wrangler`

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Cloudflare KV

Buat KV namespace untuk menyimpan slug mappings:

```bash
# Login ke Cloudflare
wrangler login

# Buat KV namespace untuk production
wrangler kv:namespace create "SLUG_KV"

# Buat KV namespace untuk preview/development
wrangler kv:namespace create "SLUG_KV" --preview
```

Output akan memberikan ID namespace. Copy ID tersebut dan update di `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "SLUG_KV", id = "xxxxx", preview_id = "yyyyy" }
]
```

### 3. Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Update URL Worker sesuai deployment Anda:

```env
NEXT_PUBLIC_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

### 4. Development

#### A. Jalankan Cloudflare Worker (Terminal 1)

```bash
npm run worker:dev
```

Worker akan berjalan di `http://localhost:8787`

#### B. Jalankan Next.js (Terminal 2)

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 📦 Deployment

### Deploy Cloudflare Worker

```bash
npm run worker:deploy
```

Setelah deploy, copy URL Worker yang diberikan dan update di environment variables production Anda.

### Deploy Cloudflare Pages

Ada dua cara:

#### Option 1: Via Wrangler CLI

```bash
npm run pages:deploy
```

#### Option 2: Via Dashboard (Recommended untuk CI/CD)

1. Push repository ke GitHub
2. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. Klik "Create a project" → "Connect to Git"
4. Pilih repository Anda
5. Set build configuration:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
6. Tambahkan environment variable:
   - `NEXT_PUBLIC_WORKER_URL` = URL Worker Anda
7. Deploy!

## 🎯 Cara Menggunakan

### 1. Generate Slug

1. Buka aplikasi di browser
2. Masukkan **Nama Aplikasi** (contoh: "My Awesome App")
3. Masukkan **URL Apps Script** (URL deployment dari Google Apps Script)
4. Klik **Generate Slug**
5. Copy URL custom yang dihasilkan!

### 2. Akses via Slug

User dapat mengakses web app Anda melalui URL pendek:

```
https://yourdomain.com/my-awesome-app
```

Aplikasi akan menampilkan iframe full-screen dari URL Apps Script yang sudah didaftarkan.

## 🏗️ Struktur Project

```
slug-generator/
├── app/
│   ├── [slug]/                 # Dynamic route untuk iframe viewer
│   │   ├── page.tsx           # Slug viewer page (SSR)
│   │   └── not-found.tsx      # Custom 404 page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page dengan form
│   └── globals.css            # Global styles
├── components/
│   └── SlugForm.tsx           # Form component untuk generate slug
├── lib/
│   └── api.ts                 # API client untuk komunikasi dengan Worker
├── workers/
│   └── api.ts                 # Cloudflare Worker API
├── .cloudflare/
│   └── pages.json             # Cloudflare Pages config
├── wrangler.toml              # Wrangler config untuk Worker
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Inter Font** - Modern, clean typography

### Backend & Storage
- **Cloudflare Workers** - Serverless API endpoints
- **Cloudflare KV** - Key-value storage untuk slug mappings
- **Cloudflare Pages** - Static site hosting dengan Edge rendering

## 🎨 Design System

### Colors (Google Apps Script Theme)
- Primary Blue: `#4285F4`
- Primary Green: `#34A853`
- Accent Yellow: `#FBBC05`
- Background: `#FFFFFF` (white dominant)
- Text: Gray scale (`#111827`, `#6B7280`, dll)

### Components
- Rounded corners: `rounded-xl`, `rounded-lg`
- Shadows: Subtle box-shadow
- Transitions: Smooth hover effects
- Responsive: Mobile-first design

## 🔐 Security Notes

- Slug validation di Worker API
- URL validation (harus dari `script.google.com`)
- CORS headers sudah dikonfigurasi
- Rate limiting (dapat ditambahkan via Cloudflare Dashboard)

## 📊 API Endpoints

### POST `/api/create`

Buat slug baru.

**Request:**
```json
{
  "name": "My App",
  "url": "https://script.google.com/macros/s/..."
}
```

**Response:**
```json
{
  "success": true,
  "slug": "my-app",
  "url": "https://yourdomain.com/my-app"
}
```

### GET `/api/get/:slug`

Ambil data URL berdasarkan slug.

**Response:**
```json
{
  "name": "My App",
  "url": "https://script.google.com/macros/s/...",
  "createdAt": "2025-10-04T02:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Worker not found
- Pastikan Worker sudah di-deploy: `npm run worker:deploy`
- Update `NEXT_PUBLIC_WORKER_URL` di environment variables

### KV namespace error
- Pastikan KV namespace sudah dibuat
- Cek ID di `wrangler.toml` sudah benar

### CORS issues
- Pastikan Worker API mengembalikan CORS headers
- Check browser console untuk error details

## 📝 Development Tips

1. **Testing Worker Locally**: Gunakan `wrangler dev` untuk test Worker di local
2. **Testing KV Operations**: Gunakan `wrangler kv:key put` untuk manual testing
3. **Debugging**: Check Cloudflare Dashboard → Workers → Logs untuk production errors

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request

## 📄 License

MIT License - Feel free to use untuk project pribadi atau komersial.

## 👨‍💻 Author

Built with ❤️ untuk komunitas Google Apps Script Indonesia.

---

**🌟 Pro Tips:**
- Gunakan slug yang memorable dan SEO-friendly
- Deploy Worker di region terdekat user untuk latency minimal
- Monitor usage di Cloudflare Dashboard
- Set up custom domain untuk branding yang lebih baik

Enjoy! 🚀
