import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

// 1. Ambil daftar user dengan status pending (hanya untuk Superadmin)
// Mendukung query parameter ?limit=X untuk antrean cepat di dashboard
export const getPendingUsers = async (req, res) => {
  const limit = parseInt(req.query.limit) || null
  try {
    let queryString = "SELECT id, nama, username, role, status, created_at FROM users WHERE status = 'pending' ORDER BY created_at DESC"
    const params = []

    if (limit) {
      queryString += " LIMIT $1"
      params.push(limit)
    }

    const query = await pool.query(queryString, params)
    return res.status(200).json({ users: query.rows })
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil daftar user pending' })
  }
}

// 2. Setujui (Approve) User (hanya untuk Superadmin)
export const approveUser = async (req, res) => {
  const { id } = req.params

  try {
    const query = await pool.query(
      "UPDATE users SET status = 'approved' WHERE id = $1 RETURNING id, nama, username, status",
      [id]
    )

    if (query.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }

    return res.status(200).json({
      message: `Akun ${query.rows[0].nama || query.rows[0].username} berhasil disetujui!`,
      user: query.rows[0]
    })
  } catch (error) {
    return res.status(500).json({ message: 'Gagal menyetujui user' })
  }
}

// 3. Tolak (Reject) User (hanya untuk Superadmin)
export const rejectUser = async (req, res) => {
  const { id } = req.params

  try {
    const query = await pool.query(
      "UPDATE users SET status = 'rejected' WHERE id = $1 RETURNING id, nama, username, status",
      [id]
    )

    if (query.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }

    return res.status(200).json({
      message: `Akun ${query.rows[0].nama || query.rows[0].username} berhasil ditolak.`,
      user: query.rows[0]
    })
  } catch (error) {
    return res.status(500).json({ message: 'Gagal menolak user' })
  }
}

// 4. Ambil ringkasan statistik user (hanya untuk Superadmin)
export const getUserStats = async (req, res) => {
  try {
    const query = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_count
      FROM users
      WHERE role != 'superadmin'
    `)
    return res.status(200).json({
      pending: parseInt(query.rows[0].pending_count) || 0,
      rejected: parseInt(query.rows[0].rejected_count) || 0,
      approved: parseInt(query.rows[0].approved_count) || 0
    })
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil statistik user' })
  }
}

// 5. Ambil seluruh daftar user selain superadmin (hanya untuk Superadmin)
export const getAllUsers = async (req, res) => {
  try {
    const query = await pool.query(
      "SELECT id, nama, username, role, status, created_at FROM users WHERE role != 'superadmin' ORDER BY created_at DESC"
    )
    return res.status(200).json({ users: query.rows })
  } catch (error) {
    return res.status(500).json({ message: 'Gagal mengambil daftar seluruh user' })
  }
}

// 6. Reset password pengguna yang telah disetujui (hanya untuk Superadmin)
export const updateUserPassword = async (req, res) => {
  const { id } = req.params
  const { password } = req.body

  if (!password || password.trim().length === 0) {
    return res.status(400).json({ message: 'Kata sandi baru harus diisi!' })
  }

  try {
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const query = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2 AND role != 'superadmin' RETURNING id, nama, username, status",
      [hashedPassword, id]
    )

    if (query.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan atau tidak dapat diubah' })
    }

    return res.status(200).json({
      message: `Kata sandi untuk pengguna @${query.rows[0].username} berhasil diperbarui!`,
      user: query.rows[0]
    })
  } catch (error) {
    return res.status(500).json({ message: 'Gagal memperbarui kata sandi user' })
  }
}
