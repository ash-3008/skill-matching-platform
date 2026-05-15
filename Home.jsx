import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="landing-page">
      <section className="hero-card">
        <div className="hero-content">
          <span className="hero-badge">AI-Driven Hiring Platform</span>

          <h1>Match the right skills with the right opportunities.</h1>

          <p>
            SkillMatch helps job seekers discover better-fit roles and enables employers
            to manage hiring with structured job listings and intelligent candidate insights.
          </p>

          <div className="hero-buttons">
            <Link to="/seeker/assessment" className="primary-btn">
              Get Your Skills Tested
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="mini-stat-card">
            <h3>For Job Seekers</h3>
            <p>Browse role-specific opportunities and review your skill profile.</p>
          </div>

          <div className="mini-stat-card">
            <h3>For Employers</h3>
            <p>Publish jobs, manage openings, and review AI-supported candidate views.</p>
          </div>

          <div className="mini-stat-card">
            <h3>Professional Workflow</h3>
            <p>Clean dashboard experience with separate access for each role.</p>
          </div>
        </div>
      </section>
    </div>
  )
}