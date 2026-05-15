const express = require('express')
const db = require('../config/db')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT jobs.*, users.email AS employer_email
       FROM jobs
       LEFT JOIN users ON users.id = jobs.employer_id
       WHERE COALESCE(jobs.status, 'Active') <> 'Closed'
       ORDER BY created_at DESC`
    )
    res.json(jobs)
  } catch (error) {
    console.error('Fetch jobs error:', error)
    res.status(500).json({ message: 'Server error while fetching jobs' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { employer_id, title, company, location, salary, skills } = req.body

    if (!employer_id || !title || !company || !location) {
      return res.status(400).json({ message: 'Required job fields are missing' })
    }

    const [result] = await db.query(
      `INSERT INTO jobs (employer_id, title, company, location, salary, skills, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employer_id, title, company, location, salary, skills, 'Active']
    )

    res.status(201).json({
      message: 'Job posted successfully',
      jobId: result.insertId,
    })
  } catch (error) {
    console.error('Post job error:', error)
    res.status(500).json({ message: 'Server error while posting job' })
  }
})

router.get('/my-jobs/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params

    const [jobs] = await db.query(
      `SELECT jobs.*, users.email AS employer_email
       FROM jobs
       LEFT JOIN users ON users.id = jobs.employer_id
       WHERE jobs.employer_id = ?
       ORDER BY jobs.created_at DESC`,
      [employerId]
    )

    res.json(jobs)
  } catch (error) {
    console.error('My jobs error:', error)
    res.status(500).json({ message: 'Server error while fetching employer jobs' })
  }
})

router.patch('/:jobId/close', async (req, res) => {
  try {
    const { jobId } = req.params
    const { employerId } = req.body

    if (!employerId) {
      return res.status(400).json({ message: 'Employer id is required' })
    }

    const [result] = await db.query(
      `
      UPDATE jobs
      SET status = 'Closed'
      WHERE id = ? AND employer_id = ?
      `,
      [jobId, employerId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found for this employer' })
    }

    res.json({ message: 'Job closed successfully' })
  } catch (error) {
    console.error('Close job error:', error)
    res.status(500).json({ message: 'Server error while closing job' })
  }
})

module.exports = router
