import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

pool.connect()
  .then(async () => {
    try {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS nama VARCHAR(100) DEFAULT 'Petualang Hebat'")
    } catch (err) {
      // Gagal menjalankan auto-migration
    }
  })
  .catch((err) => {
    // Gagal koneksi database
  })

export default pool