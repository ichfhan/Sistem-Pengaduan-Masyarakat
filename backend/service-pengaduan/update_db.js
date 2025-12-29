const mysql = require('mysql2/promise');

async function updateDB() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'lapor_pak_db'
        });

        console.log('Connected to database.');

        await db.execute("ALTER TABLE pengaduan ADD COLUMN id_petugas INT NULL;");

        console.log('Successfully added id_petugas column.');
        await db.end();
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error updating DB:', error);
        }
    }
}

updateDB();
