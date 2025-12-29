const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken'); // Import JWT
const cors = require('cors'); // Import CORS
const app = express();

app.use(cors()); // Enable CORS
app.use(express.json());

// KONEKSI DATABASE
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // sesuaikan kalau ada
    database: 'lapor_pak_db'
});

db.connect(err => {
    if (err) {
        console.error('DB ERROR:', err);
    } else {
        console.log('Database connected');
    }
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    console.log('LOGIN REQUEST:', username, password);

    const sql = `
        SELECT id_user, username, nama_lengkap, role
        FROM users
        WHERE username = ? AND password = ?
    `;

    db.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: 'Login Gagal! Cek Username/Password.'
            });
        }

        const user = result[0];

        // BUAT TOKEN JWT
        const token = jwt.sign(
            { id_user: user.id_user, role: user.role, username: user.username },
            'RAHASIA', // SECRET KEY HARUS SAMA DI SEMUA SERVICE
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login berhasil',
            user: user,
            token: token, // Return Token
            role: user.role
        });
    });
});

// REGISTER (Warga)
app.post('/api/auth/register', (req, res) => {
    const { username, password, nama_lengkap } = req.body;

    if (!username || !password || !nama_lengkap) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    const sqlCheck = 'SELECT username FROM users WHERE username = ?';
    db.query(sqlCheck, [username], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (result.length > 0) return res.status(400).json({ message: 'Username sudah dipakai' });

        const sqlInsert = 'INSERT INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, "warga")';
        db.query(sqlInsert, [username, password, nama_lengkap], (err, result) => {
            if (err) return res.status(500).json({ message: 'Gagal register' });
            res.json({ message: 'Berhasil mendaftar, silakan login.' });
        });
    });
});

// ME (Check Token)
app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token' });

    jwt.verify(token, 'RAHASIA', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        res.json(user);
    });
});

// LIST PETUGAS (For Admin Assignment)
app.get('/api/auth/petugas', async (req, res) => {
    try {
        const sql = "SELECT id_user, nama_lengkap FROM users WHERE role = 'petugas'";
        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            res.json(result);
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(5001, () => {
    console.log('Auth service running on port 5001');
});
