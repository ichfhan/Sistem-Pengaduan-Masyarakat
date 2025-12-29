const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lapor_pak_db'
});

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// JWT Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Akses ditolak (No Token)' });

    jwt.verify(token, 'RAHASIA', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid' });
        req.user = user;
        next();
    });
};

/* 
  ==========================================
  ROUTES
  ==========================================
*/

// 1. Buat Pengaduan Baru
app.post('/api/pengaduan', verifyToken, upload.single('foto'), async (req, res) => {
    try {
        const { judul, deskripsi, lokasi } = req.body;
        const foto = req.file ? req.file.filename : null;
        const id_warga = req.user.id_user; // Dari token

        if (req.user.role !== 'warga') {
            return res.status(403).json({ message: 'Hanya Warga yang boleh membuat laporan!' });
        }

        if (!judul || !deskripsi || !lokasi || !foto) {
            return res.status(400).json({ message: 'Semua field wajib diisi!' });
        }

        const query = `
            INSERT INTO pengaduan (id_warga, judul_laporan, isi_laporan, lokasi, foto_bukti_awal, status_pengaduan)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        `;

        await db.execute(query, [id_warga, judul, deskripsi, lokasi, foto]);

        res.status(201).json({ message: 'Pengaduan berhasil dikirim!' });
    } catch (error) {
        console.error('Error create pengaduan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// 2. Ambil Semua Pengaduan (Dengan Filter Role)
app.get('/api/pengaduan', verifyToken, async (req, res) => {
    try {
        const { role, id_user } = req.user;
        let query = `
            SELECT p.*, u.nama_lengkap as nama_pelapor 
            FROM pengaduan p
            JOIN users u ON p.id_warga = u.id_user
        `;
        const params = [];

        // Logic: 
        // Warga -> Cuma lihat laporan dia sendiri
        // Petugas -> Cuma lihat laporan yang ditugaskan ke dia
        // Admin -> Lihat semua

        if (role === 'warga') {
            query += ` WHERE p.id_warga = ?`;
            params.push(id_user);
        } else if (role === 'petugas') {
            query += ` WHERE p.id_petugas = ?`;
            params.push(id_user);
        }

        query += ` ORDER BY p.tanggal_lapor DESC`;

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetch all pengaduan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// 3. Ambil Detail Pengaduan + Progress Tindak Lanjut & Verifikasi
app.get('/api/pengaduan/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id_user } = req.user;

        const query = `
            SELECT 
                p.*, 
                u.nama_lengkap as nama_pelapor,
                tl.id_tindak_lanjut,
                tl.deskripsi_penanganan, 
                tl.foto_bukti_selesai, 
                tl.tanggal_selesai,
                v.status_akhir, 
                v.catatan_admin
            FROM pengaduan p
            LEFT JOIN users u ON p.id_warga = u.id_user
            LEFT JOIN tindak_lanjut tl ON p.id_pengaduan = tl.id_pengaduan
            LEFT JOIN verifikasi v ON tl.id_tindak_lanjut = v.id_tindak_lanjut
            WHERE p.id_pengaduan = ?
        `;

        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pengaduan tidak ditemukan' });
        }

        const laporan = rows[0];

        // STRICT ACCESS CONTROL
        if (role === 'warga') {
            if (laporan.id_warga !== id_user) {
                return res.status(403).json({ message: 'Akses ditolak! Bukan laporan anda.' });
            }
        } else if (role === 'petugas') {
            // Petugas can see if assigned OR if status is appropriate (assigned tasks)
            // Strict: "Petugas tidak bisa melihat laporan lain" (assuming unassigned)
            // But what if Admin hasn't assigned yet? Petugas shouldn't see it. Correct.
            // If assigned to someone else? Shouldn't see it.
            if (laporan.id_petugas !== id_user) {
                return res.status(403).json({ message: 'Akses ditolak! Bukan tugas anda.' });
            }
        }
        // Admin allowed to see all

        res.json(laporan);
    } catch (error) {
        console.error('Error fetch detail pengaduan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// 4. Assign Petugas (Admin Only)
app.put('/api/pengaduan/:id/assign', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Hanya Admin yang boleh assign petugas!' });
        }

        const { id } = req.params;
        const { id_petugas } = req.body;

        if (!id_petugas) {
            return res.status(400).json({ message: 'ID Petugas wajib diisi!' });
        }

        // Update status pengaduan jadi Diproses dan set id_petugas (Assuming column added)
        // Note: We need to add id_petugas column to table pengaduan first via SQL or Migration
        // For now, I will try to update it. If it fails, I'll need to run ALTER TABLE.

        await db.execute('UPDATE pengaduan SET status_pengaduan = ?, id_petugas = ? WHERE id_pengaduan = ?', ['Diproses', id_petugas, id]);

        res.json({ message: 'Berhasil menunjuk petugas!' });
    } catch (error) {
        console.error('Error assign petugas:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// 5. Hapus Pengaduan (Hanya Admin)
app.delete('/api/pengaduan/:id', verifyToken, async (req, res) => {
    try {
        // Business Logic: Hanya Admin yang boleh menghapus laporan
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Hanya Admin yang boleh menghapus laporan!' });
        }

        const { id } = req.params;
        await db.execute('DELETE FROM pengaduan WHERE id_pengaduan = ?', [id]);
        res.json({ message: 'Pengaduan dihapus' });
    } catch (error) {
        console.error('Error delete pengaduan:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// Port
const PORT = 5002;
app.listen(PORT, () => {
    console.log(`🚀 Service Pengaduan running on port ${PORT}`);
});
