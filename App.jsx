import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'

import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

import JobBrowse from './pages/JobSeeker/JobBrowse'
import SeekerDashboard from './pages/JobSeeker/SeekerDashboard'
import SkillAssessment from './pages/JobSeeker/SkillAssessment'

import EmployerDashboard from './pages/Employer/EmployerDashboard'
import PostJob from './pages/Employer/PostJob'
import ManageJobs from './pages/Employer/ManageJobs'
import MyJobs from './pages/Employer/MyJobs'
import AIMatch from './pages/Employer/AIMatch'

export default function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('skill_user')
    localStorage.removeItem('skill_token')
    setUser(null)
  }

  return (
    <div className="app-wrapper">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={
              user ? (
                user.role === 'seeker' ? (
                  <Navigate to="/jobs" replace />
                ) : (
                  <Navigate to="/employer/manage-jobs" replace />
                )
              ) : (
                <Login setUser={setUser} />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                user.role === 'seeker' ? (
                  <Navigate to="/jobs" replace />
                ) : (
                  <Navigate to="/employer/manage-jobs" replace />
                )
              ) : (
                <Register setUser={setUser} />
              )
            }
          />

          <Route
            path="/jobs"
            element={user?.role === 'seeker' ? <JobBrowse /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/seeker/dashboard"
            element={user?.role === 'seeker' ? <SeekerDashboard user={user} /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/seeker/assessment"
            element={user?.role === 'seeker' ? <SkillAssessment /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/employer/dashboard"
            element={user?.role === 'employer' ? <EmployerDashboard user={user} /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/employer/post-job"
            element={user?.role === 'employer' ? <PostJob /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/employer/manage-jobs"
            element={user?.role === 'employer' ? <ManageJobs /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/employer/my-jobs"
            element={user?.role === 'employer' ? <MyJobs /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/employer/ai-match"
            element={user?.role === 'employer' ? <AIMatch /> : <Navigate to="/login" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}