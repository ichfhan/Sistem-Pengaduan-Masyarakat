const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lapor_pak_db'
});

const jwt = require('jsonwebtoken'); // Import JWT

// Middleware Auth
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No Token' });

    jwt.verify(token, 'RAHASIA', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// GET /dashboard/stats
app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
    try {
        // Stats only for Admin? Or User specific stats?
        // Request: "Dashboard Admin (Statistik & Peta)". "Dashboard Warga (Peta Interaktif)".
        // So Warga technically doesn't need stats.
        // But if they access it, maybe show THEIR stats?
        // Let's implement strict filtering just in case.

        const { role, id_user } = req.user;

        if (role === 'warga') {
            // Warga Stats
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_laporan,
                    SUM(CASE WHEN status_pengaduan = 'Pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status_pengaduan = 'Diproses' THEN 1 ELSE 0 END) as diproses,
                    SUM(CASE WHEN status_pengaduan = 'Menunggu Verifikasi' THEN 1 ELSE 0 END) as menunggu_verifikasi,
                    SUM(CASE WHEN status_pengaduan = 'Selesai' THEN 1 ELSE 0 END) as selesai
                FROM pengaduan WHERE id_warga = ?
            `, [id_user]);
            return res.json(rows[0]);
        }

        if (role === 'petugas') {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_laporan,
                    SUM(CASE WHEN status_pengaduan = 'Pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status_pengaduan = 'Diproses' THEN 1 ELSE 0 END) as diproses,
                    SUM(CASE WHEN status_pengaduan = 'Menunggu Verifikasi' THEN 1 ELSE 0 END) as menunggu_verifikasi,
                    SUM(CASE WHEN status_pengaduan = 'Selesai' THEN 1 ELSE 0 END) as selesai
                FROM pengaduan WHERE id_petugas = ?
            `, [id_user]);
            return res.json(rows[0]);
        }

        // Admin Sees All
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_laporan,
                SUM(CASE WHEN status_pengaduan = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status_pengaduan = 'Diproses' THEN 1 ELSE 0 END) as diproses,
                SUM(CASE WHEN status_pengaduan = 'Menunggu Verifikasi' THEN 1 ELSE 0 END) as menunggu_verifikasi,
                SUM(CASE WHEN status_pengaduan = 'Selesai' THEN 1 ELSE 0 END) as selesai
            FROM pengaduan
        `);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /dashboard/map-data
app.get('/api/dashboard/map-data', verifyToken, async (req, res) => {
    try {
        const { role, id_user } = req.user;
        let query = `
            SELECT 
                id_pengaduan, 
                judul_laporan, 
                lokasi, 
                foto_bukti_awal, 
                status_pengaduan,
                CASE 
                    WHEN status_pengaduan = 'Pending' THEN 'red'
                    WHEN status_pengaduan = 'Diproses' THEN 'yellow'
                    WHEN status_pengaduan = 'Selesai' THEN 'green'
                    ELSE 'grey'
                END as pin_color
            FROM pengaduan
        `;

        const params = [];

        // STRICT ACCESS CONTROL
        if (role === 'warga') {
            query += ' WHERE id_warga = ?';
            params.push(id_user);
        } else if (role === 'petugas') {
            query += ' WHERE id_petugas = ?';
            params.push(id_user);
        }

        const [rows] = await db.query(query, params);

        // Mocking coordinates
        const baseLat = -6.2088;
        const baseLng = 106.8456;

        const dataWithCoords = rows.map((row, index) => ({
            ...row,
            latitude: baseLat + (Math.random() - 0.5) * 0.05,
            longitude: baseLng + (Math.random() - 0.5) * 0.05
        }));

        res.json(dataWithCoords);
    } catch (error) {
        console.error('Error fetching map data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Service Dashboard running on port ${PORT}`);
});
