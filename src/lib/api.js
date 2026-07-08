// ─────────────────────────────────────────────────────────────────────────────
// api.js — REST client for the Kaizen Express/SQLite backend
//
// Base URL is set via VITE_API_URL in .env (defaults to localhost:3001).
//
// INTRANET INTEGRATION (developer):
//   Set VITE_API_URL = 'http://192.168.0.60:8080/api/Kaizen' in .env.production
//   and swap the Authorization header to use the intranet JWT token from
//   sessionStorage._app_token (scope 'KaizenRequestApi').
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(`API ${options.method || 'GET'} ${path} → ${res.status}: ${msg}`)
  }
  return res.json()
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function fetchProjects() {
  return request('/projects')
}

export function fetchProject(id) {
  return request(`/projects/${id}`)
}

export function createProject(data) {
  return request('/projects', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProject(id, data) {
  return request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function submitForApproval(id) {
  return request(`/projects/${id}/submit`, { method: 'POST' })
}

export function approveProject(id, priority) {
  return request(`/projects/${id}/approve`, { method: 'POST', body: JSON.stringify({ priority }) })
}

export function completeProject(id, data) {
  return request(`/projects/${id}/complete`, { method: 'POST', body: JSON.stringify(data || {}) })
}

export function requestRevision(id, data) {
  return request(`/projects/${id}/revision`, { method: 'POST', body: JSON.stringify(data || {}) })
}

export function cancelProject(id, reason) {
  return request(`/projects/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason: reason || '' }) })
}

// ── Finance Validation ────────────────────────────────────────────────────────

export function saveFinanceDraft(projectId, data) {
  return request(`/projects/${projectId}/finance`, { method: 'PUT', body: JSON.stringify(data) })
}

export function sendFinanceForApproval(projectId, data) {
  return request(`/projects/${projectId}/finance/submit`, { method: 'POST', body: JSON.stringify(data || {}) })
}

export function submitFinanceDecision(projectId, data) {
  return request(`/projects/${projectId}/finance/decision`, { method: 'POST', body: JSON.stringify(data) })
}

// ── Change History ────────────────────────────────────────────────────────────

export function fetchChangeHistory(projectId) {
  return request(`/projects/${projectId}/history`)
}

export function logHistoryEntry(projectId, entry) {
  return request(`/projects/${projectId}/history`, { method: 'POST', body: JSON.stringify(entry) })
}

// ── Admin Control ─────────────────────────────────────────────────────────────

export function fetchRoles() {
  return request('/roles')
}

export function saveRoles(roles) {
  return request('/roles', { method: 'PUT', body: JSON.stringify(roles) })
}

// ── Project Code Sequence ─────────────────────────────────────────────────────

export function fetchNextSeq(site, year) {
  return request(`/projects/nextseq?site=${encodeURIComponent(site)}&year=${encodeURIComponent(year)}`)
}

// ── Employee Lookup ───────────────────────────────────────────────────────────

export function searchEmployees(query) {
  return request(`/employees?q=${encodeURIComponent(query)}`)
}
