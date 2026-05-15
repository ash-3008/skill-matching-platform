import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postJob } from '../services/api'

export default function PostJob() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('skill_user'))

  const [jobForm, setJobForm] = useState({
    title: '',
    company: 'SkillMatch Technologies',
    location: '',
    salary: '',
    skills: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setJobForm({
      ...jobForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        employer_id: user.id,
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        salary: jobForm.salary,
        skills: jobForm.skills,
      }

      const data = await postJob(payload)

      if (data.message === 'Job posted successfully') {
        navigate('/employer/manage-jobs')
      } else {
        setError(data.message || 'Could not post job')
      }
    } catch {
      setError('Job posting failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card modern-auth-card register-auth-card">
        <div className="auth-header">
          <span className="auth-badge">Employer Access</span>
          <h2>Publish a job listing</h2>
          <p>Create a professional job post that appears in your managed listings.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="input-group">
            <label>Job Title</label>
            <input type="text" name="title" value={jobForm.title} onChange={handleChange} placeholder="Job title" required />
          </div>

          <div className="input-group">
            <label>Company</label>
            <input type="text" name="company" value={jobForm.company} onChange={handleChange} placeholder="Company name" required />
          </div>

          <div className="input-group">
            <label>Location</label>
            <input type="text" name="location" value={jobForm.location} onChange={handleChange} placeholder="Job location" required />
          </div>

          <div className="input-group">
            <label>Salary</label>
            <input type="text" name="salary" value={jobForm.salary} onChange={handleChange} placeholder="Salary package" />
          </div>

          <div className="input-group full-row">
            <label>Required Skills</label>
            <input type="text" name="skills" value={jobForm.skills} onChange={handleChange} placeholder="Required skills" />
          </div>

          {error && <p className="error-text full-row">{error}</p>}

          <button type="submit" className="primary-btn auth-submit-btn full-row" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </form>
      </div>
    </div>
  )
}