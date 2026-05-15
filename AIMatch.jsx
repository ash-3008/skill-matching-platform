import { useEffect, useState } from 'react'
import { getAiMatches, getMyJobs } from '../services/api'

export default function AIMatch() {
  const user = JSON.parse(localStorage.getItem('skill_user'))

  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [selectedJobTitle, setSelectedJobTitle] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)

  useEffect(() => {
    async function fetchEmployerJobs() {
      try {
        const data = await getMyJobs(user.id)
        const safeJobs = Array.isArray(data) ? data : []

        setJobs(safeJobs)

        if (safeJobs.length > 0) {
          setSelectedJobId(String(safeJobs[0].id))
          setSelectedJobTitle(safeJobs[0].title)
        }
      } catch (error) {
        console.error('Failed to fetch employer jobs:', error)
        setJobs([])
      } finally {
        setLoadingJobs(false)
      }
    }

    if (user?.id) {
      fetchEmployerJobs()
    }
  }, [user?.id])

  useEffect(() => {
    async function fetchMatches() {
      if (!selectedJobId) return

      setLoadingMatches(true)
      setSelectedCandidate(null)

      try {
        const data = await getAiMatches(selectedJobId)
        const candidates = Array.isArray(data?.candidates) ? data.candidates : []
        setMatches(candidates)
      } catch (error) {
        console.error('Failed to fetch AI matches:', error)
        setMatches([])
      } finally {
        setLoadingMatches(false)
      }
    }

    fetchMatches()
  }, [selectedJobId])

  const handleJobChange = (e) => {
    const jobId = e.target.value
    setSelectedJobId(jobId)

    const selectedJob = jobs.find((job) => String(job.id) === jobId)
    setSelectedJobTitle(selectedJob ? selectedJob.title : '')
  }

  return (
    <div className="page-container">
      <div className="section-head">
        <div>
          <span className="section-badge">Employer Access</span>
          <h2 className="page-title">AI Match for Posted Jobs</h2>
          <p className="muted-text">
            View candidate matches based on the job you posted.
          </p>
        </div>
      </div>

      <div className="premium-card" style={{ padding: '22px', marginBottom: '22px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '10px' }}>
          Select one of your posted jobs
        </label>

        {loadingJobs ? (
          <p className="empty-state">Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="empty-state">You have not posted any jobs yet.</p>
        ) : (
          <select
            value={selectedJobId}
            onChange={handleJobChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid #f3c98b',
              background: '#fffdf9',
              fontSize: '1rem',
            }}
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.company}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedJobTitle && (
        <div className="premium-card" style={{ padding: '18px 22px', marginBottom: '22px' }}>
          <h3 style={{ marginBottom: '6px' }}>Selected Job</h3>
          <p className="muted-text">
            AI matching results for: <strong>{selectedJobTitle}</strong>
          </p>
        </div>
      )}

      <div className="candidate-layout">
        <div className="candidate-list premium-card ai-list-card">
          {loadingMatches ? (
            <p className="empty-state">Generating AI matches for this job...</p>
          ) : matches.length === 0 ? (
            <p className="empty-state">
              No candidate matches found for this posted job.
            </p>
          ) : (
            matches.map((candidate) => (
              <button
                key={candidate.id}
                className={`candidate-item stylish-candidate ${
                  selectedCandidate?.id === candidate.id ? 'active-candidate' : ''
                }`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div>
                  <strong>{candidate.name}</strong>
                  <p className="candidate-subtext">{candidate.role}</p>
                </div>

                <span className="match-pill">{candidate.matchScore}</span>
              </button>
            ))
          )}
        </div>

        <div className="candidate-details premium-card ai-details-card">
          {selectedCandidate ? (
            <>
              <div className="ai-header">
                <div>
                  <h3>{selectedCandidate.name}</h3>
                  <p className="muted-text">{selectedCandidate.role}</p>
                </div>

                <span className="ai-badge">
                  {selectedCandidate.hasApplied ? 'Already Applied' : 'Recommended'}
                </span>
              </div>

              <div className="ai-detail-grid">
                <div className="ai-info-box">
                  <span>Email</span>
                  <strong>{selectedCandidate.email}</strong>
                </div>

                <div className="ai-info-box">
                  <span>Experience</span>
                  <strong>{selectedCandidate.experience}</strong>
                </div>

                <div className="ai-info-box">
                  <span>Match Score</span>
                  <strong>{selectedCandidate.matchScore}</strong>
                </div>

                <div className="ai-info-box">
                  <span>Skills</span>
                  <strong>{selectedCandidate.skills}</strong>
                </div>
              </div>

              <div className="ai-insight-box">
                <h4>AI Insight</h4>
                <p>{selectedCandidate.aiInsight}</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Matched Skills:</strong>{' '}
                  {selectedCandidate.matchedSkills?.length
                    ? selectedCandidate.matchedSkills.join(', ')
                    : 'No direct skill overlap detected'}
                </p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Missing Skills:</strong>{' '}
                  {selectedCandidate.missingSkills?.length
                    ? selectedCandidate.missingSkills.join(', ')
                    : 'No major gaps detected'}
                </p>
              </div>
            </>
          ) : (
            <div className="empty-ai-state">
              <h3>Select a candidate</h3>
              <p>
                Choose any matched candidate from the list to view job-specific AI insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
