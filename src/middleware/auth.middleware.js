import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan!' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Menyimpan info user di req.user
    next()
  } catch (error) {
    console.error('JWT Verification Error:', error.message)
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa!' })
  }
}
