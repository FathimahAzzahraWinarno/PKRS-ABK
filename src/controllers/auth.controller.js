import pool from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// 1. FUNGSI PENDAFTARAN (REGISTER)
export const register = async (req, res) => {
  const { nama, username, password } = req.body

  if (!nama || !username || !password) {
    return res.status(400).json({ message: 'Nama, username, dan password harus diisi!' })
  }

  const cleanNama = nama.trim()
  const cleanUsername = username.trim().toLowerCase()

  try {
    // Cari apakah username sudah terdaftar (case-insensitive)
    const existingUser = await pool.query('SELECT * FROM users WHERE LOWER(username) = $1', [cleanUsername])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Nama pengguna sudah digunakan, silakan pilih yang lain ya! 🦉' 
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Simpan ke database dengan default status = 'pending' dan role = 'user'
    const registerQuery = await pool.query(
      `INSERT INTO users (nama, username, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nama, username, role, status`,
      [cleanNama, username.trim(), hashedPassword, 'user', 'pending']
    )

    const newUser = registerQuery.rows[0]

    return res.status(201).json({
      status: 'pending',
      message: 'Akunmu berhasil didaftarkan! Mohon tunggu persetujuan dari Kakak Admin dulu ya... ⏳💫',
      user: {
        id: newUser.id,
        nama: newUser.nama,
        username: newUser.username,
        role: newUser.role
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan sistem di server saat mendaftar' })
  }
}

// 2. FUNGSI MASUK (LOGIN)
export const login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password harus diisi!' })
  }

  const cleanUsername = username.trim().toLowerCase()

  try {
    // Cari user di database
    const userQuery = await pool.query('SELECT * FROM users WHERE LOWER(username) = $1', [cleanUsername])

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Nama pengguna tidak terdaftar. Silakan daftar akun baru dulu ya! 🚀' 
      })
    }

    const user = userQuery.rows[0]

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Kata sandi salah, coba lagi ya! 🦉' })
    }

    // Cek Status Approval
    if (user.status === 'pending') {
      return res.status(403).json({
        status: 'pending',
        message: 'Akunmu masih antre untuk disetujui Kakak Admin. Sabar ya, petualang hebat! 🚀'
      })
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        status: 'rejected',
        message: 'Maaf, akunmu ditolak. Hubungi Kakak Admin untuk informasi lebih lanjut ya. 😿'
      })
    }

    // Jika disetujui ('approved') -> Generate Token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.status(200).json({
      status: 'approved',
      message: 'Selamat datang kembali!',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan sistem di server' })
  }
}
