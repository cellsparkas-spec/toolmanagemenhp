# HPStinger

Sistem pembukuan toko HP berbasis web — inventory IMEI scan, proses jual, garansi, manajemen staf & multi-toko.

## Struktur Folder

```
HPStinger/
├── frontend/          ← React + Vite + TypeScript (Static Site)
│   ├── src/
│   │   ├── api/       ← API client (fetch + TanStack Query hooks)
│   │   ├── components/
│   │   │   ├── ui/    ← shadcn/ui components
│   │   │   ├── layout.tsx
│   │   │   ├── camera-capture.tsx
│   │   │   └── receipt-modal.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── pages/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/           ← Node.js + Express 5 + TypeScript (Web Service)
    ├── src/
    │   ├── db/
    │   │   └── schema/
    │   └── routes/
    ├── .env.example
    ├── drizzle.config.ts
    ├── package.json
    └── tsconfig.json
```

## Stack Teknologi

| Layer    | Teknologi |
|----------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Wouter |
| Backend  | Node.js, Express 5, TypeScript, tsx |
| Database | PostgreSQL + Drizzle ORM |
| Validasi | Zod |

---

## Deploy ke Render

### 1. Siapkan Database PostgreSQL

1. Buat akun di [render.com](https://render.com)
2. **New → PostgreSQL**
3. Pilih plan (Free atau Starter)
4. Setelah dibuat, salin **Internal Database URL** (digunakan untuk backend di Render) atau **External Database URL** (untuk koneksi dari luar)

---

### 2. Deploy Backend (Web Service)

1. Push folder `backend/` ke GitHub repository
2. Di Render: **New → Web Service**
3. Connect repository, set **Root Directory** ke `backend`
4. Isi konfigurasi:

| Field | Value |
|-------|-------|
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |

5. Tambahkan **Environment Variables**:

```
DATABASE_URL   = (Internal Database URL dari langkah 1)
NODE_ENV       = production
FRONTEND_URL   = https://your-frontend-name.onrender.com
```

> PORT sudah diset otomatis oleh Render, tidak perlu diisi manual.

6. Deploy. Setelah selesai, catat URL backend: `https://your-backend-name.onrender.com`

---

### 3. Jalankan Migrasi Database

Setelah backend berjalan, jalankan migrasi schema dari lokal atau via Render Shell:

```bash
# Di folder backend, dengan DATABASE_URL dari Render
DATABASE_URL="postgresql://..." npm run db:push
```

Atau gunakan **Render Shell** pada service backend:
```bash
npm run db:push
```

---

### 4. Deploy Frontend (Static Site)

1. Push folder `frontend/` ke GitHub repository
2. Di Render: **New → Static Site**
3. Connect repository, set **Root Directory** ke `frontend`
4. Isi konfigurasi:

| Field | Value |
|-------|-------|
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

5. Tambahkan **Environment Variables**:

```
VITE_API_URL = https://your-backend-name.onrender.com
```

6. Deploy. Frontend akan tersedia di `https://your-frontend-name.onrender.com`

---

### 5. Update CORS Backend

Setelah frontend live, pastikan URL frontend sudah sesuai di environment variable backend:

```
FRONTEND_URL = https://your-frontend-name.onrender.com
```

Redeploy backend jika diperlukan.

---

## Development Lokal

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: isi DATABASE_URL
npm install
npm run dev        # Server berjalan di http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000
npm install
npm run dev        # App berjalan di http://localhost:5173
npm run build      # Build ke folder dist/
npm run preview    # Preview hasil build
```

---

## Fitur Utama

- **Dashboard** — ringkasan stok, penjualan, pendapatan, fee, brand terlaris
- **Inventory** — daftar HP dengan filter status & pencarian IMEI
- **Input HP** — scan IMEI (atau ketik manual), input spesifikasi + staf input
- **Proses Jual** — scan IMEI, input data customer, foto wajah (kamera), cetak nota
- **Riwayat Jual** — semua transaksi dengan cetak ulang nota
- **Garansi** — tracking garansi aktif dengan status sisa hari
- **Staf** — manajemen staf per toko
- **Multi-toko** — bisa kelola beberapa cabang, ganti toko aktif kapan saja

---

## Catatan Penting

- Foto customer tersimpan sebagai **base64 data URL** di database PostgreSQL (kolom TEXT). Untuk produksi dengan volume tinggi, pertimbangkan menyimpan ke object storage (S3/R2) dan hanya menyimpan URL-nya.
- IMEI bersifat **unique** di seluruh sistem — satu IMEI tidak bisa diinput dua kali.
- Port backend dibaca dari `process.env.PORT` (auto-set oleh Render, default 5000 untuk lokal).
