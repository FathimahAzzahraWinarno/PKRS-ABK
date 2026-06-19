import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import './src/config/db.js'  
import authRoutes from './src/routes/auth.routes.js'
import userRoutes from './src/routes/user.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Server PKRS-ABK berjalan!' })
})

// Melayani file frontend (Web)
app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route Not Found' })
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

if (process.env.VERCEL !== '1') {
  app.listen(PORT)
}

export default app