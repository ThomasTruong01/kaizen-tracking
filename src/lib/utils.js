// ─────────────────────────────────────────────────────────────────────────────
// utils.js — Shared utility functions
// ─────────────────────────────────────────────────────────────────────────────

import { STATUSES } from './constants'

// Compute section-based progress (0–100) from form data.
// Called on the frontend and passed to the server on every save.
export function computeProgress(form) {
  let p = 0

  // 1. Project Info — 5%
  if (form.submitted) p += 5

  if (form.kaizenType === 'A3') {
    // A3 — 8 sections × 10% = 80%
    const sc = form.a3?.sectionComplete || {}
    const done = ['s1','s2','s3','s4','s5','s6','s7','s8'].filter(k => sc[k]).length
    p += done * 10
  } else {
    // PDCA (default) — Plan 20% + Do 20% + Check 20% + Act 20% = 80%
    if (form.planComplete) p += 20

    const allActs  = (form.solutions || []).flatMap(s => s.activities || [])
    const realActs = allActs.filter(a => a.what?.trim())
    const doneActs = realActs.filter(a => a.status === 'Completed')
    if (realActs.length > 0) p += Math.round((doneActs.length / realActs.length) * 20)

    if (form.checkComplete) p += 20
    if (form.actComplete)   p += 20
  }

  // 6a. Wrap-Up basics (first 3 questions) — 5%
  if (form.wrapupBasicComplete) p += 5

  // 6b. Finance Validation approved — 5%
  if (form.financeStatus === 'Approved') p += 5

  // 6c. CQM signed off — 5%
  if (form.cqmDecision === 'completed') p += 5

  return Math.min(p, 100)
}

export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

export function projectYear(project) {
  if (project.status === STATUSES.COMPLETED && project.completionDate) {
    return project.completionDate.split('-')[0]
  }
  return String(new Date().getFullYear())
}

export function isOverdue(targetDate, status) {
  if (!targetDate) return false
  if (status === STATUSES.COMPLETED || status === STATUSES.CANCELLED) return false
  return new Date(targetDate) < new Date()
}

export function generateProjectCode(sites, depts, sequence = 1) {
  if (!sites.length || !depts.length) return ''
  const siteStr = sites.includes('Global') ? 'Global' : sites.join('-')
  const deptStr = depts.join('-')
  const year = new Date().getFullYear()
  const seq = String(sequence).padStart(3, '0')
  return `${siteStr}-${deptStr}-${year}-${seq}`
}

export function exportToCSV(projects) {
  const headers = [
    'Project Code', 'Title', 'Type', 'Site', 'Dept(s)',
    'Team Leader', 'Priority', 'Status',
    'Start Date', 'Target Date', 'Completion Date', 'Progress %',
  ]
  function esc(val) {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? '"' + s.replace(/"/g, '""') + '"'
      : s
  }
  const rows = projects.map(p => [
    p.code, p.title, p.type, p.site,
    (p.depts || []).join(', '),
    p.leader, p.priority || '', p.status,
    p.startDate      ? formatDate(p.startDate)      : '',
    p.targetDate     ? formatDate(p.targetDate)      : '',
    p.completionDate ? formatDate(p.completionDate)  : '',
    (p.progress ?? 0) + '%',
  ])
  return [headers, ...rows].map(r => r.map(esc).join(',')).join('\r\n')
}

export function downloadFile(content, filename) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
