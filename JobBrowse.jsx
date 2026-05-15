import { useEffect, useState } from 'react'
import { getJobs } from '../services/api'

export default function JobBrowse() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobs()
        setJobs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return (
    <div className="page-container">
      <div className="section-head">
        <div>
          <span className="section-badge">Job Seeker Access</span>
          <h2 className="page-title">Browse Jobs</h2>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="premium-card empty-card">
          <h3>No jobs available</h3>
          <p>No job postings are available right now.</p>
        </div>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card premium-card enhanced-job-card">
              <div className="job-top">
                <div>
                  <h3>{job.title}</h3>
                  <p className="muted-text">{job.company}</p>
                </div>
                <span className="status-pill">{job.status || 'Published'}</span>
              </div>

              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
              <p><strong>Skills:</strong> {job.skills || 'Not specified'}</p>
              <p><strong>Posted By:</strong> {job.employer_email || 'Email not available'}</p>

              <button className="primary-btn full-btn" style={{ marginTop: '14px' }}>
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
