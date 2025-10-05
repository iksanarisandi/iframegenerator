# 🔗 Slug Generator - Apps Script URL Shortener

Aplikasi web minimalis untuk generate custom URL pendek untuk Google Apps Script Web Apps Anda. Dibangun dengan **Cloudflare Workers**, **TypeScript**, **TailwindCSS**, dan **Cloudflare KV** untuk penyimpanan data.

## ✨ Fitur

- 🎯 **Generate Slug Otomatis** - Buat slug SEO-friendly dari nama aplikasi
- 🔄 **Anti-Duplikasi** - Automatic random suffix jika slug sudah dipakai
- 📱 **Responsive Design** - Minimalis, clean, mobile-friendly
- ⚡ **Fast & Secure** - Powered by Cloudflare Edge Network
- 🎨 **Apps Script Theme** - Warna aksen Google Apps Script (#4285F4, #34A853, #FBBC05)
- 🖼️ **Iframe Viewer** - Full-screen responsive iframe untuk tampilkan web app
- 🚀 **Single Worker Deploy** - Frontend, API, dan viewer dalam satu Cloudflare Worker

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ dan npm
- Akun Cloudflare (free tier cukup)
- Wrangler CLI: `npm install -g wrangler`
- Git (untuk version control)

### 1. Clone Repository

```bash
git clone https://github.com/iksanarisandi/iframegenerator.git
cd slug-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Cloudflare KV

Buat KV namespace untuk menyimpan slug mappings:

```bash
# Login ke Cloudflare
wrangler login

# Buat KV namespace untuk production
wrangler kv:namespace create "SLUG_KV"

# Buat KV namespace untuk preview/development
wrangler kv:namespace create "SLUG_KV" --preview
```

Output akan memberikan ID namespace. Copy ID tersebut dan buat file `wrangler.toml` dari template:

```bash
cp wrangler.toml.example wrangler.toml
```

Edit `wrangler.toml` dan update dengan ID Anda:

```toml
kv_namespaces = [
  { binding = "SLUG_KV", id = "xxxxx", preview_id = "yyyyy" }
]
```

> ⚠️ **PENTING**: File `wrangler.toml` sudah ada di `.gitignore` agar ID KV Anda tidak terpush ke GitHub.

### 4. Development

Jalankan Worker secara lokal:

```bash
npm run dev
```

Worker akan berjalan di `http://localhost:8787` dengan hot-reload otomatis.

## 📦 Deployment

### Deploy ke Cloudflare Workers

Pastikan `wrangler.toml` sudah dikonfigurasi dengan benar, lalu deploy:

```bash
npm run deploy
```

Worker akan otomatis di-deploy ke URL:
```
https://slug-generator.YOUR_SUBDOMAIN.workers.dev
```

### Custom Domain (Opsional)

Untuk menggunakan domain sendiri:

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih Worker Anda → **Triggers** → **Custom Domains**
3. Klik **Add Custom Domain** dan masukkan domain/subdomain Anda
4. Tunggu DNS propagasi (biasanya 1-5 menit)

Atau tambahkan di `wrangler.toml`:

```toml
routes = [
  { pattern = "slug.yourdomain.com/*", custom_domain = true }
]
```

Lalu redeploy.

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
├── src/
│   └── index.ts               # Main Worker code (frontend + API + viewer)
├── wrangler.toml.example      # Template konfigurasi (commit ke Git)
├── wrangler.toml              # Konfigurasi aktual (di .gitignore)
├── package.json               # Dependencies dan scripts
├── tsconfig.json              # TypeScript config
├── .gitignore                 # Git ignore rules
└── README.md                  # Dokumentasi ini
```

## 🛠️ Tech Stack

### All-in-One Cloudflare Worker
- **Cloudflare Workers** - Edge runtime untuk frontend + API + viewer
- **TypeScript** - Type-safe development
- **TailwindCSS** - Inline utility-first CSS
- **Cloudflare KV** - Key-value storage untuk slug mappings
- **Modern HTML/CSS** - Responsive, clean UI tanpa framework frontend

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
- **IMPORTANT**: `wrangler.toml` tidak di-commit ke Git (berisi KV namespace ID)

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
  "createdAt": "2025-01-20T..."
}
```

### GET `/:slug`

Tampilkan iframe viewer untuk slug tertentu. Jika slug tidak ditemukan, tampilkan halaman 404.

## 🐛 Troubleshooting

### Worker not found
- Pastikan Worker sudah di-deploy: `npm run deploy`
- Cek URL deployment di output terminal

### KV namespace error
- Pastikan KV namespace sudah dibuat dengan `wrangler kv:namespace create`
- Cek ID di `wrangler.toml` sudah benar (production dan preview)

### Iframe tidak muncul / X-Frame-Options error
- Pastikan Google Apps Script deployment diset ke "Anyone" access
- Tambahkan `.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)` di Apps Script
- Gunakan URL deployment (`.../exec`), bukan dev URL (`.../dev`)

### Slug sudah ada tapi tidak muncul
- Cek Cloudflare KV Dashboard apakah data tersimpan
- Tunggu beberapa detik untuk KV propagation (biasanya instant)

## 📝 Development Tips

1. **Testing Worker Locally**: Gunakan `npm run dev` atau `wrangler dev` untuk test Worker di local
2. **Testing KV Operations**: Gunakan `wrangler kv:key put` untuk manual testing
3. **Debugging Production**: Check Cloudflare Dashboard → Workers → [worker-name] → Logs untuk real-time error logs
4. **Backup `wrangler.toml`**: Simpan copy lokal di tempat aman (jangan commit ke Git public)
5. **Testing iframe**: Pastikan Apps Script deployment sudah benar sebelum membuat slug

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
