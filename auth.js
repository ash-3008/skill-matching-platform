const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/db')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [fullName, email, hashedPassword, role]
    )

    const token = jwt.sign(
      { id: result.insertId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.insertId,
        fullName,
        email,
        role,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' })
    }

    const user = users[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

module.exports = router