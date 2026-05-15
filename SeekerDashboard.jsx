import { useState } from 'react'

export default function SeekerDashboard({ user }) {
  const [profile, setProfile] = useState({
    fullName: user?.fullName || 'Job Seeker',
    email: user?.email || 'user@example.com',
    role: 'Frontend Developer',
    location: 'Pune, India',
    skills: 'React, JavaScript, HTML, CSS',
  })

  const [editing, setEditing] = useState(false)

  const applications = [
    { id: 1, jobTitle: 'Frontend Developer', company: 'TechNova', status: 'Under Review', date: '2026-03-10' },
    { id: 2, jobTitle: 'React Developer', company: 'PixelForge', status: 'Shortlisted', date: '2026-03-12' },
  ]

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar premium-card">
        <div className="sidebar-head">
          <div className="sidebar-avatar">
            {profile.fullName
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <h3>My Profile</h3>
            <p className="muted-text">{profile.email}</p>
          </div>
        </div>

        {!editing ? (
          <>
            <p><strong>Name:</strong> {profile.fullName}</p>
            <p><strong>Target Role:</strong> {profile.role}</p>
            <p><strong>Location:</strong> {profile.location}</p>
            <p><strong>Skills:</strong> {profile.skills}</p>
            <button className="primary-btn full-btn" onClick={() => setEditing(true)}>
              Update Profile
            </button>
          </>
        ) : (
          <div className="form-layout">
            <input name="fullName" value={profile.fullName} onChange={handleChange} />
            <input name="role" value={profile.role} onChange={handleChange} />
            <input name="location" value={profile.location} onChange={handleChange} />
            <textarea name="skills" value={profile.skills} onChange={handleChange} rows="4" />
            <button className="primary-btn full-btn" onClick={() => setEditing(false)}>
              Save
            </button>
          </div>
        )}
      </aside>

      <section className="dashboard-main">
        <div className="section-head">
          <div>
            <span className="section-badge">Job Seeker Access</span>
            <h2 className="page-title">Dashboard</h2>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="info-card premium-card">
            <h3>Applications</h3>
            <p>{applications.length}</p>
          </div>
          <div className="info-card premium-card">
            <h3>Resume Score</h3>
            <p>78%</p>
          </div>
          <div className="info-card premium-card">
            <h3>Status</h3>
            <p>Active</p>
          </div>
        </div>

        <section className="dashboard-section premium-card">
          <h3>Recent Applications</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.jobTitle}</td>
                    <td>{app.company}</td>
                    <td>{app.status}</td>
                    <td>{app.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  )
}