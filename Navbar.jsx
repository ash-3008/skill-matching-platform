import { Link } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand-block">
          <div className="brand-avatar">SM</div>

          <div className="brand-text">
            <Link to="/">SkillMatch</Link>
          </div>
        </div>
      </div>

      <nav className="navbar-links">
        {!user && (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-pill">Sign Up</Link>
          </>
        )}

        {user?.role === 'seeker' && (
          <>
            <Link to="/jobs" className="nav-link">Browse Jobs</Link>
            <Link to="/seeker/assessment" className="nav-link">Skill Assessment</Link>
            <Link to="/seeker/assessment" className="nav-pill">Skill Up Your Resume</Link>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </>
        )}

        {user?.role === 'employer' && (
          <>
            <Link to="/employer/post-job" className="nav-link">Post Job</Link>
            <Link to="/employer/manage-jobs" className="nav-link">Manage Jobs</Link>
            <Link to="/employer/my-jobs" className="nav-link">My Jobs</Link>
            <Link to="/employer/ai-match" className="nav-link">AI Matching</Link>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  )
}