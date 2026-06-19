export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Sesi tidak valid, silakan masuk kembali.' })
    }

    const { role } = req.user
    
    // Periksa apakah role user termasuk dalam list allowedRoles
    if (allowedRoles.includes(role)) {
      next()
    } else {
      return res.status(403).json({ message: 'Akses khusus Superadmin! Kamu tidak memiliki izin. 🙅‍♂️' })
    }
  }
}
