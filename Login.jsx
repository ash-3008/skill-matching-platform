import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'

export default function Login({ setUser }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const data = await loginUser(formData)

      localStorage.setItem('skill_user', JSON.stringify(data.user))
      localStorage.setItem('skill_token', data.token)
      setUser(data.user)

      if (data.user.role === 'seeker') {
        navigate('/jobs')
      } else {
        navigate('/employer/manage-jobs')
      }
    } catch (error) {
      setError(error.message || 'Unable to login right now')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card modern-auth-card">
        <div className="auth-header">
          <span className="auth-badge">Welcome Back</span>
          <h2>Login to SkillMatch</h2>
          <p>Access your dashboard based on your registered role.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="input-group full-row">
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

          <div className="input-group full-row">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error-text full-row">{error}</p>}

          <button
            type="submit"
            className="primary-btn auth-submit-btn full-row"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Don’t have an account?</span>
          <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}