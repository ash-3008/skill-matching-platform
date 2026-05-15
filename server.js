const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const authRoutes = require('./routes/auth')
const jobRoutes = require('./routes/jobs')
const aiMatchRoutes = require('./routes/aiMatch')

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Backend running with MySQL' })
})

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/ai-match', aiMatchRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`✅ Backend started on http://localhost:${PORT}`)
})