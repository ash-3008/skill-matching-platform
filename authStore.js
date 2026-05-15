export function saveUser(user) {
  localStorage.setItem('skill_user', JSON.stringify(user))
}

export function getUser() {
  const data = localStorage.getItem('skill_user')
  return data ? JSON.parse(data) : null
}

export function clearUser() {
  localStorage.removeItem('skill_user')
}