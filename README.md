# Dish & Drink 🍳

Platform resep hibrida ala Instagram yang menggabungkan **buku catatan resep pribadi yang privat** dengan **komunitas publik** untuk berbagi inspirasi, berinteraksi, dan memamerkan hasil masakan — lengkap dengan foto.

> Semua fitur pencarian populer & urutan resep terbaik dapat diakses **100% Gratis** tanpa paywall.

## Tema Warna — "Spicy & Warm"

| Warna | Peran |
| --- | --- |
| 🟠 Oranye Hangat | Warna utama — energi, ceria |
| 🔴 Merah | Aksen tombol aksi penting (Save, Masak Sekarang) |
| 🥛 Krem / Putih Tulang | Latar — nyaman untuk membaca instruksi resep |

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express (JavaScript)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Passport.js (Google OAuth2 + sesi email/password)
- **Foto:** Cloudinary (terintegrasi nanti untuk upload gambar)

## Struktur Project

```
Dish & Drink/
├── client/            # React (Vite + Tailwind)
│   └── src/
│       ├── components/  # Navbar, Logo, GoogleButton, RecipeCard
│       ├── pages/       # Landing, Login, Register, Feed, RecipeDetail, Profile
│       └── context/     # AuthContext (sesi pengguna)
└── server/            # Express + Prisma
    ├── prisma/          # schema.prisma + migrations
    └── src/
        ├── config/      # passport.js (Google OAuth)
        ├── controllers/ # auth & recipe logic
        ├── middleware/  # isAuthenticated
        ├── routes/      # /api/auth, /api/recipes
        └── utils/
```

## Prasyarat

- Node.js ≥ 18 (sudah terpasang: Node v24)
- PostgreSQL ≥ 14 berjalan di port 5432 (sudah terpasang: PostgreSQL 18)
- Akun Google Cloud untuk OAuth (opsional, hanya untuk tombol "Lanjutkan dengan Google")

## Setup

### 1. Install dependencies

```bash
npm install --prefix server
npm install --prefix client
```

### 2. Konfigurasi environment server

Salin `server/.env.example` menjadi `server/.env` lalu sesuaikan:

```
DATABASE_URL="postgresql://postgres:POSTGRES_PASSWORD@localhost:5432/dishdrink"
SESSION_SECRET=random-string-panjang
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Migrasi database

```bash
npm run prisma:migrate --prefix server
```

Perintah ini membuat database `dishdrink` (jika belum ada) beserta tabel
`User`, `Recipe`, `RecipeSave`, `RecipeLike`, `RecipeComment`, dan `session`.

## Google OAuth (tombol "Lanjutkan dengan Google")

1. Buka <https://console.cloud.google.com/apis/credentials>
2. Buat project baru (atau pilih yang sudah ada).
3. Klik **+ Create Credentials → OAuth client ID**.
4. Atur **Authorized redirect URIs** menjadi:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. Salin **Client ID** dan **Client Secret** ke `server/.env`.
6. Restart server.

Tanpa kredensial tersebut, tombol Google otomatis dinonaktifkan — login
dengan email/password tetap berfungsi penuh.

## Menjalankan Aplikasi

Jalankan dua terminal:

```bash
# Terminal 1 — Backend (port 5000)
npm run dev --prefix server

# Terminal 2 — Frontend (port 5173)
npm run dev --prefix client
```

Buka <http://localhost:5173>.

## Endpoint API Utama

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Daftar (nama, email, password) | - |
| POST | `/api/auth/login` | Login email/password | - |
| GET | `/api/auth/google` | Mulai login Google OAuth | - |
| GET | `/api/auth/me` | Ambil data pengguna saat ini | ✅ |
| POST | `/api/auth/logout` | Keluar | ✅ |
| GET | `/api/recipes` | Feed resep publik (query: `search`, `sort=newest|best|oldest`, `page`, `limit`) | opsional |
| GET | `/api/recipes/:id` | Detail resep | opsional |
| POST | `/api/recipes` | Buat resep (`visibility: PRIVATE/PUBLIC`) | ✅ |
| PUT | `/api/recipes/:id` | Ubah resep (pemilik) | ✅ |
| DELETE | `/api/recipes/:id` | Hapus resep (pemilik) | ✅ |

## Catatan Folder

Folder bernama `Dish & Drink` mengandung karakter `&` yang memecah shim
`.cmd` npm di Windows. Karena itu semua script npm memanggil `node`
langsung (mis. `node node_modules/vite/bin/vite.js`), bukan lewat `npx`
atau nama binary. Jangan ubah script menjadi `npx vite` / `prisma ...`.
