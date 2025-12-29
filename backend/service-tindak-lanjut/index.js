const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'lapor_pak_db' });
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    })
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, 'RAHASIA', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token Invalid' });
        req.user = user;
        next();
    });
};

/* ROUTES */

// 1. Get Tugas Saya (Untuk Petugas)
app.get('/api/tindak-lanjut/tugas-saya', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'petugas') {
            return res.status(403).json({ message: 'Hanya petugas!' });
        }

        // Cari laporan yang statusnya 'Diproses' dan ditugaskan ke petugas ini
        const [rows] = await db.execute(`
            SELECT p.*, u.nama_lengkap as nama_pelapor
            FROM pengaduan p
            JOIN users u ON p.id_warga = u.id_user
            WHERE p.id_petugas = ? AND p.status_pengaduan = 'Diproses'
        `, [req.user.id_user]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 2. Submit Laporan Tindak Lanjut (Petugas Selesai Kerja)
app.post('/api/tindak-lanjut', verifyToken, upload.single('foto'), async (req, res) => {
    try {
        const { id_pengaduan, deskripsi } = req.body;
        const foto = req.file ? req.file.filename : null;

        if (!id_pengaduan || !deskripsi || !foto) {
            return res.status(400).json({ message: 'Lengkapi data!' });
        }

        // Cek Status harus 'Diproses'
        const [cekStatus] = await db.execute('SELECT status_pengaduan, id_petugas FROM pengaduan WHERE id_pengaduan = ?', [id_pengaduan]);
        if (cekStatus.length === 0) return res.status(404).json({ message: 'Pengaduan tidak ditemukan' });

        if (cekStatus[0].status_pengaduan !== 'Diproses') {
            return res.status(400).json({ message: 'Laporan harus berstatus Diproses untuk ditindaklanjuti.' });
        }

        if (cekStatus[0].id_petugas !== req.user.id_user) {
            return res.status(403).json({ message: 'Bukan tugas anda!' });
        }

        await db.execute('INSERT INTO tindak_lanjut (id_pengaduan, id_petugas, deskripsi_penanganan, foto_bukti_selesai) VALUES (?,?,?,?)',
            [id_pengaduan, req.user.id_user, deskripsi, foto]);

        await db.execute('UPDATE pengaduan SET status_pengaduan="Menunggu Verifikasi" WHERE id_pengaduan=?', [id_pengaduan]);
        res.json({ message: 'Laporan dikirim, menunggu verifikasi admin.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 3. Verifikasi Laporan (Admin Only) - Endpoint sesuai request user
app.put('/api/pengaduan/:id/verify', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Hanya Admin!' });
        }

        const id_pengaduan = req.params.id;
        const { status_akhir, catatan_admin } = req.body; // 'Disetujui' or 'Revisi'

        // Cari id_tindak_lanjut berdasarkan id_pengaduan
        const [rows] = await db.execute('SELECT id_tindak_lanjut FROM tindak_lanjut WHERE id_pengaduan = ?', [id_pengaduan]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Laporan tindak lanjut belum ada untuk pengaduan ini' });
        }

        const id_tindak_lanjut = rows[0].id_tindak_lanjut;

        // Simpan ke tabel verifikasi
        await db.execute(`
            INSERT INTO verifikasi (id_tindak_lanjut, id_admin, catatan_admin, status_akhir)
            VALUES (?, ?, ?, ?)
        `, [id_tindak_lanjut, req.user.id_user, catatan_admin, status_akhir]);

        // Update status pengaduan
        let statusPengaduan = 'Menunggu Verifikasi';
        if (status_akhir === 'Disetujui') statusPengaduan = 'Selesai';
        if (status_akhir === 'Revisi') statusPengaduan = 'Diproses'; // Petugas kerja lagi

        await db.execute('UPDATE pengaduan SET status_pengaduan = ? WHERE id_pengaduan = ?', [statusPengaduan, id_pengaduan]);

        res.json({ message: 'Verifikasi berhasil disimpan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.listen(5003, () => console.log('🛠️ TINDAK LANJUT Service: 5003'));