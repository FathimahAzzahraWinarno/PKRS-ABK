import { Router } from 'express'
import { login, register } from '../controllers/auth.controller.js'

const router = Router()

// Route untuk Pendaftaran & Login Terpisah
router.post('/login', login)
router.post('/register', register)

export default router