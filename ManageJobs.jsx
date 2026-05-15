import { useEffect, useState } from 'react'
import { closeJob, getMyJobs } from '../services/api'

const applicantsByJob = {
  1: [
    { name: 'Rohan Kumar', status: 'Applied' },
    { name: 'Priya Verma', status: 'Under Review' },
  ],
  2: [{ name: 'Arjun Mehta', status: 'Shortlisted' }],
  3: [
    { name: 'Sneha Patil', status: 'Applied' },
    { name: 'Karan Shah', status: 'Applied' },
  ],
}

export default function ManageJobs() {
  const user = JSON.parse(localStorage.getItem('skill_user'))
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingJobId, setClosingJobId] = useState(null)

  useEffect(() => {
    async function fetchMyJobs() {
      try {
        const data = await getMyJobs(user.id)
        setJobs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch employer jobs:', error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) fetchMyJobs()
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
          <h2 className="page-title">Manage Jobs</h2>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading job listings...</p>
      ) : jobs.length === 0 ? (
        <div className="premium-card empty-card">
          <h3>No jobs found</h3>
          <p>This employer account currently has no jobs linked in the database.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '22px' }}>
          {jobs.map((job) => (
            <div key={job.id} className="premium-card manage-job-card">
              <div className="manage-job-head">
                <div>
                  <h3>{job.title}</h3>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
                  <p><strong>Skills:</strong> {job.skills || 'Not specified'}</p>
                  <p><strong>Posted By:</strong> {job.employer_email || 'Email not available'}</p>
                </div>

                <div className="manage-job-actions">
                  <span className={`status-pill ${job.status === 'Closed' ? 'status-closed' : ''}`}>
                    {job.status || 'Published'}
                  </span>

                  <button
                    className="danger-btn"
                    onClick={() => handleCloseOpening(job.id)}
                    disabled={job.status === 'Closed' || closingJobId === job.id}
                  >
                    {job.status === 'Closed'
                      ? 'Closed'
                      : closingJobId === job.id
                        ? 'Closing...'
                        : 'Close Opening'}
                  </button>
                </div>
              </div>

              <div className="applicants-section">
                <h4>Applicants</h4>

                {applicantsByJob[job.id]?.length ? (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicantsByJob[job.id].map((applicant, index) => (
                          <tr key={index}>
                            <td>{applicant.name}</td>
                            <td>{applicant.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-state">No applicants for this role yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
