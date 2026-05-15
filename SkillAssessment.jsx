import { useState } from 'react'

const assessmentResults = {
  'rohan@example.com': [
    { skill: 'React', score: '90%' },
    { skill: 'JavaScript', score: '84%' },
    { skill: 'CSS', score: '80%' },
  ],
  'priya@example.com': [
    { skill: 'React', score: '92%' },
    { skill: 'JavaScript', score: '88%' },
    { skill: 'CSS', score: '85%' },
  ],
}

export default function SkillAssessment() {
  const user = JSON.parse(localStorage.getItem('skill_user'))
  const userEmail = user?.email || ''
  const userResults = assessmentResults[userEmail]

  const [selectedTopic, setSelectedTopic] = useState('React')
  const [started, setStarted] = useState(false)

  if (userResults) {
    return (
      <div className="page-container">
        <div className="section-head">
          <div>
            <span className="section-badge">Job Seeker Access</span>
            <h2 className="page-title">Skill Assessment</h2>
          </div>
        </div>

        <div className="table-shell premium-card">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {userResults.map((item, index) => (
                <tr key={index}>
                  <td>{item.skill}</td>
                  <td>{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="section-head">
        <div>
          <span className="section-badge">Job Seeker Access</span>
          <h2 className="page-title">Skill Assessment</h2>
        </div>
      </div>

      <div className="premium-card skill-card">
        <h3 style={{ marginBottom: '16px' }}>Choose Assessment Topic</h3>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label>Select Topic</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option>React</option>
            <option>JavaScript</option>
            <option>SQL</option>
            <option>NodeJS</option>
            <option>Python</option>
            <option>Data Structures</option>
            <option>Operating Systems</option>
            <option>DBMS</option>
            <option>Computer Networks</option>
            <option>Machine Learning</option>
          </select>
        </div>

        {!started ? (
          <button className="primary-btn" onClick={() => setStarted(true)}>
            Start Test
          </button>
        ) : (
          <div className="placeholder-box">
            <h4>{selectedTopic} Assessment Ready</h4>
            <p>Assessment module for this topic will begin here.</p>
          </div>
        )}
      </div>
    </div>
  )
}