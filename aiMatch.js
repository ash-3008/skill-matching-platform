const express = require('express')
const axios = require('axios')
const db = require('../config/db')

const router = express.Router()
const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:5001'

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s,+#/.-]/gi, ' ')
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function buildVector(tokens, vocabulary) {
  return vocabulary.map((word) => tokens.filter((token) => token === word).length)
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0
  let normA = 0
  let normB = 0

  for (let index = 0; index < vecA.length; index += 1) {
    dot += vecA[index] * vecB[index]
    normA += vecA[index] * vecA[index]
    normB += vecB[index] * vecB[index]
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

function extractSimpleSkills(text = '') {
  return [...new Set(tokenize(text).filter((token) => token.length > 2))]
}

function computeFallbackMatch(job, candidate) {
  const jobText = `${job.title} ${job.skills || ''} ${job.location || ''}`
  const candidateText = `${candidate.target_role || ''} ${candidate.skills || ''} ${candidate.experience || ''}`

  const jobTokens = tokenize(jobText)
  const candidateTokens = tokenize(candidateText)

  const vocabulary = [...new Set([...jobTokens, ...candidateTokens])]
  const jobVector = buildVector(jobTokens, vocabulary)
  const candidateVector = buildVector(candidateTokens, vocabulary)

  const similarityScore = cosineSimilarity(jobVector, candidateVector)
  const jobSkills = extractSimpleSkills(`${job.title} ${job.skills || ''}`)
  const candidateSkills = extractSimpleSkills(
    `${candidate.target_role || ''} ${candidate.skills || ''}`
  )
  const matchedSkills = jobSkills.filter((skill) => candidateSkills.includes(skill))
  const missingSkills = jobSkills.filter((skill) => !candidateSkills.includes(skill))

  return {
    matchScore: Math.round(similarityScore * 100),
    matchedSkills: matchedSkills.slice(0, 6),
    missingSkills: missingSkills.slice(0, 6),
    aiInsight:
      matchedSkills.length > 0
        ? `Fallback scoring found overlap in ${matchedSkills.slice(0, 3).join(', ')}.`
        : 'Fallback scoring found only limited text similarity for this profile.',
    scoreSource: 'fallback',
  }
}

async function getModelPredictions(job, candidates) {
  const response = await axios.post(
    `${NLP_SERVICE_URL}/predict-fit`,
    {
      job: {
        title: job.title,
        skills: job.skills,
        location: job.location,
      },
      candidates: candidates.map((candidate) => ({
        id: candidate.id,
        target_role: candidate.target_role,
        skills: candidate.skills,
        experience: candidate.experience,
      })),
    },
    {
      timeout: 5000,
    }
  )

  const predictionList = Array.isArray(response.data?.candidates) ? response.data.candidates : []
  return new Map(predictionList.map((item) => [item.id, item]))
}

router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params

    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId])

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' })
    }

    const job = jobs[0]

    const [candidates] = await db.query(
      `
      SELECT id, full_name, email, skills, experience, target_role
      FROM users
      WHERE role = 'seeker'
      `
    )

    const [applications] = await db.query(
      `
      SELECT seeker_id
      FROM applications
      WHERE job_id = ?
      `,
      [jobId]
    )

    const appliedIds = new Set(applications.map((application) => application.seeker_id))

    let predictionsByCandidateId = new Map()

    try {
      predictionsByCandidateId = await getModelPredictions(job, candidates)
    } catch (error) {
      console.warn('NLP service unavailable, using fallback match scoring:', error.message)
    }

    const rankedCandidates = candidates
      .map((candidate) => {
        const predicted = predictionsByCandidateId.get(candidate.id)
        const fallback = computeFallbackMatch(job, candidate)
        const scoring = predicted || fallback

        return {
          id: candidate.id,
          name: candidate.full_name,
          email: candidate.email,
          role: candidate.target_role || 'Not specified',
          skills: candidate.skills || 'Not specified',
          experience: candidate.experience || 'Not specified',
          matchScore: `${scoring.matchScore}%`,
          matchScoreValue: scoring.matchScore,
          matchedSkills: scoring.matchedSkills || [],
          missingSkills: scoring.missingSkills || [],
          aiInsight: scoring.aiInsight,
          scoreSource: scoring.scoreSource,
          hasApplied: appliedIds.has(candidate.id),
        }
      })
      .sort((left, right) => right.matchScoreValue - left.matchScoreValue)
      .slice(0, 10)
      .map(({ matchScoreValue, ...candidate }) => candidate)

    res.json({
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        skills: job.skills,
      },
      candidates: rankedCandidates,
    })
  } catch (error) {
    console.error('AI match error:', error)
    res.status(500).json({ message: 'Server error while generating AI matches' })
  }
})

module.exports = router
