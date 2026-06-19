import pool from './db.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const initDb = async () => {
  try {
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

    console.log('Tabel users berhasil dibuat.')

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPasswordRaw = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPasswordRaw) {
      console.error('ERROR: ADMIN_USERNAME dan ADMIN_PASSWORD wajib diisi di file .env!')
      process.exit(1)
    }

    const checkAdmin = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [adminUsername]
    )

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
    console.error('Seed gagal:', error.message)
    process.exit(1)
  }
}

initDb()