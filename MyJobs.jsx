import { useEffect, useState } from 'react'
import { closeJob, getMyJobs } from '../services/api'

const applicantsByJob = {
  1: 2,
  2: 1,
  3: 2,
  4: 1,
  5: 0,
}

export default function MyJobs() {
  const user = JSON.parse(localStorage.getItem('skill_user'))
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingJobId, setClosingJobId] = useState(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getMyJobs(user.id)
        setJobs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch my jobs:', error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) fetchJobs()
  }, [user?.id])

  const handleCloseOpening = async (jobId) => {
    try {
      setClosingJobId(jobId)
      await closeJob(jobId, user.id)
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: 'Closed' } : job
        )
      )
    } catch (error) {
      console.error('Failed to close job:', error)
    } finally {
      setClosingJobId(null)
    }
  }

  return (
    <div className="page-container">
      <div className="section-head">
        <div>
          <span className="section-badge">Employer Access</span>
          <h2 className="page-title">My Jobs</h2>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="premium-card empty-card">
          <h3>No jobs found</h3>
          <p>No job postings are mapped to this employer account in the database yet.</p>
        </div>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => (
            <div className="job-card premium-card enhanced-job-card" key={job.id}>
              <div className="job-top">
                <div>
                  <h3>{job.title}</h3>
                  <p className="muted-text">{job.company}</p>
                </div>
                <span className={`status-pill ${job.status === 'Closed' ? 'status-closed' : ''}`}>
                  {job.status || 'Published'}
                </span>
              </div>

              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
              <p><strong>Skills:</strong> {job.skills || 'Not specified'}</p>
              <p><strong>Posted By:</strong> {job.employer_email || 'Email not available'}</p>
              <p><strong>Applicants:</strong> {applicantsByJob[job.id] || 0}</p>

              <button
                className="danger-btn full-btn"
                onClick={() => handleCloseOpening(job.id)}
                disabled={job.status === 'Closed' || closingJobId === job.id}
                style={{ marginTop: '14px' }}
              >
                {job.status === 'Closed'
                  ? 'Opening Closed'
                  : closingJobId === job.id
                    ? 'Closing...'
                    : 'Close Opening'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
