# 👮‍♂️ Lapor Pak! - Sistem Pengaduan Masyarakat

Sistem pengaduan fasilitas umum berbasis web yang memungkinkan warga untuk melaporkan kerusakan infrastruktur dan memantau proses penanganannya secara real-time.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Express.js](https://img.shields.io/badge/Express.js-5-green?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?logo=mysql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)

## 📸 Screenshot

| Dashboard Admin | Detail Laporan |
|-----------------|----------------|
| Peta interaktif dengan marker status | Before-After image slider |

## ✨ Fitur Utama

### 👤 Role Warga
- 📝 Membuat laporan pengaduan dengan foto bukti
- 📍 Melihat peta lokasi semua pengaduan
- 📋 Melacak status laporan sendiri

### 🛡️ Role Admin
- 📊 Dashboard statistik lengkap
- 👷 Menugaskan petugas ke laporan
- ✅ Verifikasi hasil pekerjaan petugas
- 🗑️ Menghapus laporan yang tidak valid

### 👷 Role Petugas
- 📋 Melihat daftar tugas yang ditugaskan
- 📸 Upload foto bukti penyelesaian (before-after)
- 📝 Mengirim hasil kerja untuk diverifikasi

## 🏗️ Arsitektur Microservices

```
SistemPengaduan/
├── backend/
│   ├── service-auth/        # Port 5001 - Autentikasi & User Management
│   ├── service-pengaduan/   # Port 5002 - CRUD Pengaduan
│   ├── service-tindak-lanjut/ # Port 5003 - Penanganan & Verifikasi
│   └── service-dashboard/   # Port 5005 - Statistik & Map Data
├── frontend/                # Port 3000 - Next.js 16 App
├── database.sql             # Schema MySQL
└── nginx.conf               # Reverse Proxy Config
```

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+
- MySQL 8+
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/ichfhan/Sistem-Pengaduan-Masyarakat.git
cd Sistem-Pengaduan-Masyarakat
```

### 2. Setup Database
```bash
# Import schema ke MySQL
mysql -u root -p < database.sql
```

### 3. Install Dependencies
```bash
# Backend services
cd backend/service-auth && npm install
cd ../service-pengaduan && npm install
cd ../service-tindak-lanjut && npm install
cd ../service-dashboard && npm install

# Frontend
cd ../../frontend && npm install
```

### 4. Konfigurasi Environment
Buat file `.env` di setiap service backend:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pengaduan_db
JWT_SECRET=your_secret_key
```

### 5. Jalankan Semua Services
```bash
# Terminal 1 - Auth Service
cd backend/service-auth && npm run dev

# Terminal 2 - Pengaduan Service
cd backend/service-pengaduan && npm run dev

# Terminal 3 - Tindak Lanjut Service
cd backend/service-tindak-lanjut && npm run dev

# Terminal 4 - Dashboard Service
cd backend/service-dashboard && npm run dev

# Terminal 5 - Frontend
cd frontend && npm run dev
```

### 6. Akses Aplikasi
Buka browser ke `http://localhost:3000`

## 🔐 Akun Default

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Petugas | petugas1 | petugas123 |
| Warga | warga1 | warga123 |

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React Framework dengan App Router
- **TailwindCSS 4** - Utility-first CSS
- **React Leaflet** - Peta interaktif
- **Axios** - HTTP Client

### Backend
- **Express.js 5** - Node.js Web Framework
- **MySQL2** - Database Driver
- **JWT** - Authentication
- **Multer** - File Upload

## 📁 API Endpoints

### Auth Service (Port 5001)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /auth/login | Login user |
| POST | /auth/register | Register warga baru |
| GET | /auth/me | Get current user info |
| GET | /auth/petugas | List semua petugas (admin only) |

### Pengaduan Service (Port 5002)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /pengaduan | List pengaduan (role-based) |
| POST | /pengaduan | Buat pengaduan baru |
| PUT | /pengaduan/:id/assign | Tugaskan petugas |
| DELETE | /pengaduan/:id | Hapus pengaduan |

### Tindak Lanjut Service (Port 5003)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /tindak-lanjut/tugas-saya | List tugas petugas |
| POST | /tindak-lanjut/:id/submit | Submit hasil kerja |
| POST | /tindak-lanjut/:id/verify | Verifikasi oleh admin |

### Dashboard Service (Port 5005)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /dashboard/stats | Statistik pengaduan |
| GET | /dashboard/map-data | Data untuk peta |

## 👨‍💻 Developer

**Nama:** [Ichfhan]  
**Mata Kuliah:** Web Service - Praktik  
**Semester:** 7

## 📄 Lisensi

Project ini dibuat untuk keperluan tugas akhir mata kuliah Web Service Praktik.

---

⭐ Jangan lupa star repository ini jika bermanfaat!
