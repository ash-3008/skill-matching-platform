export default function EmployerDashboard({ user }) {
  return (
    <div className="page-container">
      <div className="section-head">
        <div>
          <span className="section-badge">Employer Access</span>
          <h2 className="page-title">Employer Dashboard</h2>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="info-card premium-card">
          <h3>Recruiter</h3>
          <p>{user?.fullName || 'Employer'}</p>
        </div>
        <div className="info-card premium-card">
          <h3>Total Jobs</h3>
          <p>View in My Jobs</p>
        </div>
        <div className="info-card premium-card">
          <h3>Hiring Flow</h3>
          <p>Manage openings and AI suggestions</p>
        </div>
      </div>
    </div>
  )
}