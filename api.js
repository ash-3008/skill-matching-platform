const BASE_URL = 'http://localhost:5000/api'

export async function registerUser(data) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Registration failed')
  return result
}

export async function loginUser(data) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Login failed')
  return result
}

export async function getJobs() {
  const response = await fetch(`${BASE_URL}/jobs`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to fetch jobs')
  return result
}

export async function postJob(data) {
  const response = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to post job')
  return result
}

export async function getMyJobs(employerId) {
  const response = await fetch(`${BASE_URL}/jobs/my-jobs/${employerId}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to fetch employer jobs')
  return result
}

export async function closeJob(jobId, employerId) {
  const response = await fetch(`${BASE_URL}/jobs/${jobId}/close`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employerId }),
  })

  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to close job')
  return result
}

export async function getAiMatches(jobId) {
  const response = await fetch(`${BASE_URL}/ai-match/${jobId}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to fetch AI matches')
  return result
}
