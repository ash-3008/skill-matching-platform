import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'

export default function Register({ setUser }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'seeker',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await registerUser(formData)

      if (!data.user) {
        setError(data.message || 'Registration failed')
        return
      }

      localStorage.setItem('skill_user', JSON.stringify(data.user))
      localStorage.setItem('skill_token', data.token)
      setUser(data.user)

      if (data.user.role === 'seeker') {
        navigate('/jobs')
      } else {
        navigate('/employer/manage-jobs')
      }
    } catch (error) {
      setError('Unable to register right now')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card modern-auth-card register-auth-card">
        <div className="auth-header">
          <span className="auth-badge">Get Started</span>
          <h2>Create your SkillMatch account</h2>
          <p>Choose your role carefully. Access is shown based on your selected role.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>

          {error && <p className="error-text full-row">{error}</p>}

          <button
            type="submit"
            className="primary-btn auth-submit-btn full-row"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Already registered?</span>
          <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  )
}