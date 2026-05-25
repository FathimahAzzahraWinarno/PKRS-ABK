import pool from './db.js'
import bcrypt from 'bcryptjs'

const initDb = async () => {
  try {
    // 1. Buat tabel users jika belum ada (Drop dahulu agar schema bersih)
    await pool.query(`
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 2. Generate password hash untuk admin default
    const adminUsername = 'admin'
    const adminPasswordRaw = 'admin123'
    
    // Cek apakah admin sudah terdaftar
    const checkAdmin = await pool.query('SELECT * FROM users WHERE username = $1', [adminUsername])
    
    if (checkAdmin.rows.length === 0) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(adminPasswordRaw, salt)

      await pool.query(`
        INSERT INTO users (nama, username, password, role, status)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Superadmin', adminUsername, hashedPassword, 'superadmin', 'approved'])
    }

    process.exit(0)
  } catch (error) {
    process.exit(1)
  }
}

initDb()
