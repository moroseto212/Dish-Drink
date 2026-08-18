# Dish & Drink

Platform resep hibrida yang menggabungkan **buku catatan resep pribadi yang privat** dengan **komunitas publik** untuk berbagi inspirasi, berinteraksi, dan memamerkan hasil masakan — lengkap dengan foto.

> Semua fitur pencarian populer & urutan resep terbaik dapat diakses **100% Gratis** tanpa paywall.

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Fitur Lengkap](#fitur-lengkap)
- [Struktur Project](#struktur-project)
- [Prasyarat](#prasyarat)
- [Setup](#setup)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Endpoint API](#endpoint-api)
- [Model Database](#model-database)
- [Tema Warna](#tema-warna)
- [Catatan Teknis](#catatan-teknis)

---

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| **Frontend** | React 18 + Vite + Tailwind CSS v4 |
| **Backend** | Node.js + Express (JavaScript) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Passport.js (Google OAuth2 + sesi email/password) |
| **Foto** | Cloudinary (upload gambar via Multer) |

---

## Fitur Lengkap

### 1. Autentikasi & Akun

| Fitur | Deskripsi |
| --- | --- |
| **Daftar Akun** | Registrasi dengan nama, email, dan password |
| **Login Email/Password** | Login menggunakan email dan password |
| **Google OAuth** | Login/daftar satu klik via Google (Passport.js) |
| **Session-Based Auth** | Sesi tersimpan di database PostgreSQL via cookie |
| **Ubah Password** | Pengguna lokal dapat mengganti password (pengguna Google tidak memiliki password) |
| **Hapus Akun** | Hapus akun secara permanen beserta semua data (resep, komentar, percakapan) via cascade delete |
| **Halaman Pengaturan** | Edit nama tampilan, bio, foto profil, ubah password, dan zona bahaya untuk hapus akun |

### 2. Manajemen Resep (CRUD)

| Fitur | Deskripsi |
| --- | --- |
| **Buat Resep** | Form multi-bagian: judul, deskripsi, foto cover, kategori (Makanan/Minuman), bahan-bahan (takaran + nama), langkah-langkah, waktu persiapan & memasak, porsi, tingkat kesulitan (Mudah/Sedang/Sulit), privasi (Publik/Privat) |
| **Edit Resep** | Pemilik resep dapat mengubah semua data resep |
| **Hapus Resep** | Pemilik resep dapat menghapus resepnya |
| **Foto Cover** | Upload foto cover via Cloudinary (validasi tipe file, maks 5MB) |
| **Bahan Dinamis** | Form dinamis untuk menambah/hapus baris bahan-bahan |
| **Langkah Dinamis** | Form dinamis untuk menambah/hapus baris langkah memasak |
| **Privasi** | Resep dapat disetel `PRIVATE` (hanya pemilik) atau `PUBLIC` (muncul di feed komunitas) |

### 3. Feed Komunitas & Penemuan

| Fitur | Deskripsi |
| --- | --- |
| **Feed Resep Publik** | Menampilkan semua resep publik secara berurutan |
| **Pencarian** | Cari resep berdasarkan judul atau konten |
| **Urutan** | Urutkan berdasarkan: Terbaru, Terbaik (rating tertinggi), Terlama |
| **Paginasi** | Tombol "Muat lebih banyak" untuk loadmore |
| **Kartu Resep** | Kartu dengan gambar cover (hover zoom), badge kategori, total waktu, tombol like/save/komentar inline |

### 4. Interaksi Sosial

| Fitur | Deskripsi |
| --- | --- |
| **Like / Unlike** | Suka resep dengan jumlah like real-time |
| **Simpan / Bookmark** | Simpan resep favorit (lihat di `/saved`) |
| **Komentar** | Tulis komentar pada resep |
| **Balas Komentar** | Balas komentar pengguna lain (thread nested) |
| **Hapus Komentar** | Hapus komentar sendiri |
| **Rating 1-5 Bintang** | Beri rating pada resep; tampilan rata-rata rating dan jumlah rating |
| **Follow / Unfollow** | Ikuti pengguna lain |
| **Deteksi Mutual** | Mendeteksi apakah dua pengguna sudah saling follow (syarat untuk chat) |
| **Notifikasi** | Notifikasi otomatis saat ada yang follow; badge unread di sidebar |

### 5. Detail Resep

| Fitur | Deskripsi |
| --- | --- |
| **Tampilan Lengkap** | Gambar cover, badge metadata (kategori, kesulitan, waktu, porsi), deskripsi, bahan-bahan, langkah bernomor |
| **Rating Bintang** | Klik bintang 1-5 untuk memberi rating; tampilkan rata-rata & jumlah rating |
| **Timer Memasak** | Timer countdown untuk waktu persiapan, memasak, atau total; tombol jeda/lanjut/reset; notifikasi suara saat selesai |
| **Daftar Belanja** | Modal checklist dari daftar bahan; centang bahan yang sudah dibeli; salin ke clipboard |
| **Bagikan ke Chat** | Pilih percakapan dari modal, kirim kartu resep ke chat (format `[recipe]ID[/recipe]`) |

### 6. Pesan / Direct Message

| Fitur | Deskripsi |
| --- | --- |
| **Daftar Percakapan** | Daftar chat dengan pratinjau pesan terakhir & badge unread |
| **Chat Baru** | Pilih pengguna dari daftar mutual follower untuk memulai chat baru |
| **Polling Real-Time** | Pesan di-polling setiap 3 detik; unread count di-polling setiap 15 detik |
| **Balas Pesan** | Balas pesan tertentu dengan pratinjuk kutipan (quote) |
| **Berbagi Resep di Chat** | Resep yang dibagikan otomatis dirender sebagai kartu resep mini dengan gambar & judul |
| **Tandai Dibaca** | Pesan otomatis ditandai dibaca saat dibuka |
| **Auto-Open dari Profil** | Klik tombol "Chat" di profil pengguna lain untuk langsung membuka percakapan |

### 7. Profil Pengguna

| Fitur | Deskripsi |
| --- | --- |
| **Profil Publik** | Avatar, nama, bio, statistik (resep, mengikuti, pengikut, disimpan orang, total suka) |
| **Foto Profil** | Upload/ganti foto profil via Cloudinary |
| **Resep Saya** | Grid resep milik pengguna dengan badge visibilitas (Publik/Privat) |
| **Tombol Chat** | Tersedia jika sudah saling follow |
| **Tombol Follow** | Ikuti/batalkan follow pengguna lain |

### 8. Halaman Tersimpan (Bookmark)

| Fitur | Deskripsi |
| --- | --- |
| **Grid Resep Tersimpan** | Menampilkan semua resep yang sudah disimpan dalam grid |
| **Empty State** | Ilustrasi & tombol "Jelajahi Resep" jika belum ada resep tersimpan |

### 9. UI/UX

| Fitur | Deskripsi |
| --- | --- |
| **Bahasa Indonesia** | Seluruh antarmuka dalam Bahasa Indonesia |
| **Tema "Spicy & Warm"** | Palet krem, spice, ember yang hangat dan nyaman |
| **Responsif** | Sidebar navigasi di desktop, drawer hamburger di mobile |
| **Skeleton Loading** | Animasi placeholder saat memuat data |
| **Optimistic UI** | Like/save/follow langsung terasa responsif tanpa menunggu server |
| **Empty State** | Setiap halaman daftar memiliki ilustrasi & ajakan aksi jika kosong |
| **Modal Dialog** | Konfirmasi hapus akun, hapus komentar, daftar belanja, bagikan resep |
| **Icon SVG Kustom** | 35+ icon SVG tanpa dependensi eksternal (komponen `Icon.jsx`) |

---

## Struktur Project

```
Dish & Drink/
├── client/                          # React (Vite + Tailwind)
│   └── src/
│       ├── api.js                   # Centralized API fetch layer
│       ├── components/
│       │   ├── AppLayout.jsx        # Sidebar + mobile drawer + notification bell
│       │   ├── FollowButton.jsx     # Reusable follow/unfollow toggle
│       │   ├── GoogleButton.jsx     # "Continue with Google" button
│       │   ├── GoogleIcon.jsx       # Google logo SVG
│       │   ├── Icon.jsx             # 35+ SVG icon library
│       │   ├── Logo.jsx             # App logo SVG
│       │   ├── Navbar.jsx           # Top navbar (landing page)
│       │   └── RecipeCard.jsx       # Recipe card for grids
│       ├── context/
│       │   └── AuthContext.jsx      # Auth state + provider
│       └── pages/
│           ├── Explore.jsx          # Cari teman + follow
│           ├── Feed.jsx             # Feed resep publik + search + sort
│           ├── Landing.jsx          # Halaman marketing
│           ├── Login.jsx            # Form login
│           ├── Messages.jsx         # Chat UI lengkap
│           ├── NewRecipe.jsx        # Form buat resep
│           ├── Profile.jsx          # Profil pengguna
│           ├── RecipeDetail.jsx     # Detail resep + rating + timer + komentar
│           ├── Register.jsx         # Form registrasi
│           ├── SavedRecipes.jsx     # Resep tersimpan
│           └── Settings.jsx         # Pengaturan akun
└── server/                          # Express + Prisma
    ├── prisma/
    │   └── schema.prisma            # Database schema
    └── src/
        ├── config/
        │   └── passport.js          # Google OAuth config
        ├── controllers/
        │   ├── authController.js    # Register, login, logout, change-password, delete-account
        │   ├── conversationController.js  # Chat & messages
        │   ├── notificationController.js  # Notifikasi
        │   ├── recipeController.js  # CRUD resep + like + save + comment + rating
        │   └── userController.js    # Profile, follow, search, saved
        ├── index.js                 # Entry point Express
        ├── middleware/
        │   └── isAuthenticated.js   # Auth guard
        ├── routes/
        │   ├── auth.js
        │   ├── conversations.js
        │   ├── notifications.js
        │   ├── recipes.js
        │   ├── uploads.js
        │   └── users.js
        └── utils/
            ├── sanitize.js          # Sanitize user object
            └── upload.js            # Cloudinary upload helper
```

---

## Prasyarat

- Node.js >= 18
- PostgreSQL >= 14 berjalan di port 5432
- Akun Google Cloud untuk OAuth (opsional)
- Akun Cloudinary untuk upload foto (opsional, bisa pakai placeholder)

---

## Setup

### 1. Install dependencies

```bash
npm install --prefix server
npm install --prefix client
```

### 2. Konfigurasi environment server

Buat file `server/.env`:

```env
DATABASE_URL="postgresql://postgres:POSTGRES_PASSWORD@localhost:5432/dishdrink"
SESSION_SECRET=random-string-panjang-disini
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Migrasi database

```bash
npx prisma db push --prefix server
```

Atau dengan migrate:

```bash
npm run prisma:migrate --prefix server
```

---

## Google OAuth

1. Buka <https://console.cloud.google.com/apis/credentials>
2. Buat project baru (atau pilih yang sudah ada)
3. Klik **+ Create Credentials > OAuth client ID**
4. Atur **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. Salin **Client ID** dan **Client Secret** ke `server/.env`
6. Restart server

Tanpa kredensial tersebut, tombol Google otomatis dinonaktifkan — login dengan email/password tetap berfungsi penuh.

---

## Menjalankan Aplikasi

Jalankan dua terminal secara terpisah:

```bash
# Terminal 1 — Backend (port 5000)
npm run dev --prefix server

# Terminal 2 — Frontend (port 5173)
npm run dev --prefix client
```

Buka <http://localhost:5173>.

---

## Endpoint API

### Auth (`/api/auth`)

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/register` | Daftar akun (name, email, password) | - |
| POST | `/login` | Login email/password | - |
| GET | `/google` | Mulai login Google OAuth | - |
| GET | `/google/callback` | Callback Google OAuth | - |
| GET | `/me` | Ambil data pengguna saat ini | Ya |
| POST | `/logout` | Keluar | Ya |
| POST | `/change-password` | Ubah password (password lama + baru) | Ya |
| DELETE | `/account` | Hapus akun secara permanen | Ya |

### Resep (`/api/recipes`)

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/` | Daftar resep (query: `search`, `sort`, `page`, `limit`) | Opsional |
| GET | `/:id` | Detail resep lengkap + rating + komentar | Opsional |
| POST | `/` | Buat resep baru | Ya |
| PUT | `/:id` | Ubah resep (pemilik) | Ya |
| DELETE | `/:id` | Hapus resep (pemilik) | Ya |
| POST | `/:id/like` | Suka resep | Ya |
| DELETE | `/:id/like` | Batalkan suka | Ya |
| POST | `/:id/save` | Simpan resep | Ya |
| DELETE | `/:id/save` | Batalkan simpan | Ya |
| POST | `/:id/comments` | Tambah komentar (dukung `parentId` untuk balasan) | Ya |
| DELETE | `/:id/comments/:commentId` | Hapus komentar | Ya |
| POST | `/:id/rate` | Beri rating 1-5 | Ya |
| DELETE | `/:id/rate` | Hapus rating | Ya |

### Pengguna (`/api/users`)

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/me` | Ambil profil sendiri | Ya |
| PATCH | `/me` | Update profil (name, bio) | Ya |
| GET | `/saved` | Daftar resep tersimpan | Ya |
| GET | `/search` | Cari pengguna (query: `q`) | Ya |
| GET | `/mutual` | Daftar mutual follower | Ya |
| GET | `/:id` | Profil publik pengguna | - |
| GET | `/:id/recipes` | Resep publik milik pengguna | - |
| POST | `/:id/follow` | Ikuti pengguna | Ya |
| DELETE | `/:id/follow` | Berhenti ikuti | Ya |

### Percakapan (`/api/conversations`)

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/` | Daftar semua percakapan | Ya |
| GET | `/unread-count` | Jumlah pesan belum dibaca | Ya |
| POST | `/` | Buka/buat percakapan baru | Ya |
| GET | `/:id/messages` | Ambil pesan dalam percakapan | Ya |
| POST | `/:id/messages` | Kirim pesan (dukung `replyToId` untuk balasan) | Ya |
| POST | `/:id/read` | Tandai semua pesan sudah dibaca | Ya |

### Notifikasi (`/api/notifications`)

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/` | Daftar notifikasi + jumlah unread | Ya |
| POST | `/read` | Tandai semua notifikasi sudah dibaca | Ya |

### Upload (`/api/uploads`)

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/avatar` | Upload foto profil (field: `avatar`) | Ya |
| POST | `/cover` | Upload foto cover resep (field: `cover`) | Ya |

---

## Model Database

| Model | Deskripsi |
| --- | --- |
| **User** | Akun pengguna (email, nama, avatar, bio, googleId, passwordHash) |
| **Follow** | Relasi follow (followerId, followingId) |
| **Notification** | Notifikasi (userId, actorId, type, text, isRead) |
| **Conversation** | Percakapan langsung |
| **ConversationParticipant** | Pengguna dalam percakapan |
| **Message** | Pesan chat (content, isRead, replyToId untuk balasan) |
| **Recipe** | Resep (title, description, coverUrl, category, ingredients, steps, prepTime, cookTime, servings, difficulty, visibility) |
| **RecipeSave** | Resep yang disimpan pengguna |
| **RecipeLike** | Resep yang disukai pengguna |
| **RecipeComment** | Komentar resep (dukung reply nested via parentId) |
| **RecipeRating** | Rating bintang 1-5 untuk resep |

### Enums

| Enum | Nilai |
| --- | --- |
| **Visibility** | `PRIVATE`, `PUBLIC` |
| **Category** | `FOOD`, `DRINK` |
| **Difficulty** | `EASY`, `MEDIUM`, `HARD` |

---

## Tema Warna

| Warna | Hex | Peran |
| --- | --- | --- |
| Spice (Oranye Hangat) | `#d97706` | Warna utama, tombol aksi, link |
| Ember (Merah-Oranye) | `#ea580c` | Tombol aksi penting (Simpan, Masak, Kirim) |
| Krem | `#fef3c7` | Latar belakang, kartu, border |
| Putih | `#ffffff` | Konten utama |

---

## Catatan Teknis

### Folder "Dish & Drink"

Folder bernama `Dish & Drink` mengandung karakter `&` yang memecah shim `.cmd` npm di Windows. Karena itu semua script npm memanggil `node` langsung (mis. `node node_modules/vite/bin/vite.js`), bukan lewat `npx` atau nama binary.

### Session Table

Server menggunakan `connect-pg-simple` dengan `createTableIfMissing: true` yang otomatis membuat tabel `session` saat server pertama kali dijalankan. Jika menggunakan `prisma db push`, tabel `session` akan terhapus karena tidak ada di schema Prisma — server akan membuatnya ulang saat restart.

### Format Pesan Resep di Chat

Resep yang dibagikan ke chat menggunakan format khusus `[recipe]ID[/recipe]` yang di-parse oleh komponen `RecipeCardChat` di client untuk dirender sebagai kartu resep mini.
