import { Router } from 'express'
import { 
  getPendingUsers, 
  approveUser, 
  rejectUser,
  getUserStats,
  getAllUsers,
  updateUserPassword
} from '../controllers/user.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

const router = Router()

// Endpoint Khusus Superadmin (memerlukan token JWT valid & role = 'superadmin')
router.get('/stats', verifyToken, requireRole(['superadmin']), getUserStats)
router.get('/', verifyToken, requireRole(['superadmin']), getAllUsers)
router.get('/pending', verifyToken, requireRole(['superadmin']), getPendingUsers)
router.patch('/:id/approve', verifyToken, requireRole(['superadmin']), approveUser)
router.patch('/:id/reject', verifyToken, requireRole(['superadmin']), rejectUser)
router.patch('/:id/password', verifyToken, requireRole(['superadmin']), updateUserPassword)

export default router