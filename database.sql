-- NYALAKAN LAGI PENGECEKANNYA
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. BUAT TABEL USERS
-- ==========================================
CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Password Polos (Simple)
    nama_lengkap VARCHAR(100),
    role ENUM('admin', 'petugas', 'warga') DEFAULT 'warga',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. BUAT TABEL PENGADUAN
-- ==========================================
CREATE TABLE pengaduan (
    id_pengaduan INT AUTO_INCREMENT PRIMARY KEY,
    id_warga INT NOT NULL,
    judul_laporan VARCHAR(100),
    isi_laporan TEXT,
    lokasi VARCHAR(100),
    foto_bukti_awal VARCHAR(255),
    tanggal_lapor DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_pengaduan ENUM('Pending', 'Diproses', 'Menunggu Verifikasi', 'Selesai', 'Ditolak') DEFAULT 'Pending',
    id_petugas INT NULL, 
    FOREIGN KEY (id_warga) REFERENCES users(id_user) ON DELETE CASCADE
);

-- ==========================================
-- 3. BUAT TABEL TINDAK LANJUT
-- ==========================================
CREATE TABLE tindak_lanjut (
    id_tindak_lanjut INT AUTO_INCREMENT PRIMARY KEY,
    id_pengaduan INT NOT NULL,
    id_petugas INT NOT NULL,
    deskripsi_penanganan TEXT,
    foto_bukti_selesai VARCHAR(255),
    tanggal_selesai DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pengaduan) REFERENCES pengaduan(id_pengaduan) ON DELETE CASCADE,
    FOREIGN KEY (id_petugas) REFERENCES users(id_user) ON DELETE CASCADE
);

-- ==========================================
-- 4. BUAT TABEL VERIFIKASI
-- ==========================================
CREATE TABLE verifikasi (
    id_verifikasi INT AUTO_INCREMENT PRIMARY KEY,
    id_tindak_lanjut INT NOT NULL,
    id_admin INT NOT NULL,
    catatan_admin TEXT,
    status_akhir ENUM('Disetujui', 'Revisi') DEFAULT 'Disetujui',
    tanggal_verifikasi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tindak_lanjut) REFERENCES tindak_lanjut(id_tindak_lanjut) ON DELETE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES users(id_user) ON DELETE CASCADE
);

-- ==========================================
-- MASUKKAN DATA USER (PASSWORD PASTI BENAR)
-- ==========================================
INSERT INTO users (username, password, nama_lengkap, role) VALUES 
('warga', 'warga1', 'Udin Warga', 'warga'),
('petugas', 'petugas1', 'Bambang Petugas', 'petugas'),
('admin', 'admin1', 'Pak Bos Admin', 'admin');

-- ==========================================
-- CONTOH DATA LAPORAN (BIAR DASHBOARD GAK KOSONG)
-- ==========================================
INSERT INTO pengaduan (id_warga, judul_laporan, isi_laporan, lokasi, status_pengaduan) VALUES 
(1, 'Jalan Rusak Parah', 'Lubang besar di tengah jalan sangat membahayakan pengendara motor.', 'Jl. Sudirman No. 45', 'Pending'),
(1, 'Lampu Jalan Mati', 'Sudah 3 hari lampu penerangan mati total, rawan begal.', 'Jl. Gatot Subroto', 'Diproses');
