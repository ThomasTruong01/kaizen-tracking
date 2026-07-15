// ─────────────────────────────────────────────────────────────────────────────
// utils.js — Shared utility functions
// ─────────────────────────────────────────────────────────────────────────────

import * as XLSX from 'xlsx'
import { STATUSES } from './constants'

// Compute section-based progress (0–100) from form data.
// Called on the frontend and passed to the server on every save.
export function computeProgress(form) {
  let p = 0

  // 1. Project Info — 5%
  if (form.submitted) p += 5

  if (form.projectCategory === 'Quick Win') {
    // Quick Win — 5 sections × 80% total
    // s1 (Problem Statement), s2 (Before), s4 (After), s5 (Standardize) = 10% each = 40%
    // s3 (Actions) = 40% activity-weighted
    const sc  = form.qw?.sectionComplete || {}
    const manualDone = ['s1','s2','s4','s5'].filter(k => sc[k]).length
    p += manualDone * 10

    const allQWActs  = (form.qw?.actions || []).flatMap(a => a.activities || [])
    const realQWActs = allQWActs.filter(a => a.what?.trim())
    const doneQWActs = realQWActs.filter(a => a.status === 'Completed')
    if (realQWActs.length > 0) p += Math.round((doneQWActs.length / realQWActs.length) * 40)
  } else {
    const isPdfMode = form.kaizenTypeMode === 'pdf' || !['PDCA', 'A3'].includes(form.kaizenType)

    if (isPdfMode) {
      // PDF upload mode — 80% when at least one file is uploaded
      if ((form.kaizenTypePDFs || []).length > 0) p += 80
    } else if (form.kaizenType === 'A3') {
      // A3 — 8 sections × 10% = 80%
      // Sections 1–5, 7–8: manual "Mark Complete" toggles (7 × 10% = 70%)
      const sc = form.a3?.sectionComplete || {}
      const manualDone = ['s1','s2','s3','s4','s5','s7','s8'].filter(k => sc[k]).length
      p += manualDone * 10

      // Section 6: activity-weighted (10% split equally across all CM activities)
      const allCMActs  = (form.a3?.countermeasures || []).flatMap(cm => cm.activities || [])
      const realCMActs = allCMActs.filter(a => a.what?.trim())
      const doneCMActs = realCMActs.filter(a => a.status === 'Completed')
      if (realCMActs.length > 0) p += Math.round((doneCMActs.length / realCMActs.length) * 10)
    } else {
      // PDCA — Plan 20% + Do 20% + Check 20% + Act 20% = 80%
      if (form.planComplete) p += 20

      const allActs  = (form.solutions || []).flatMap(s => s.activities || [])
      const realActs = allActs.filter(a => a.what?.trim())
      const doneActs = realActs.filter(a => a.status === 'Completed')
      if (realActs.length > 0) p += Math.round((doneActs.length / realActs.length) * 20)

      if (form.checkComplete) p += 20
      if (form.actComplete)   p += 20
    }
  }

  // 6a. Wrap-Up basics (first 3 questions) — 5%
  if (form.wrapupBasicComplete) p += 5

  // 6b. Finance Validation — 5% (skipped or approved counts; Quick Win bypasses entirely)
  if (form.projectCategory === 'Quick Win' || form.financeApplicable === false || form.financeStatus === 'Approved') p += 5

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
  const [y, m, d] = targetDate.split('-').map(Number)
  return new Date(y, m - 1, d) < new Date(new Date().setHours(0, 0, 0, 0))
}

export function generateProjectCode(sites, depts, sequence = 1) {
  if (!sites.length || !depts.length) return ''
  const siteStr = sites.includes('Global') ? 'Global' : sites.join('-')
  const deptStr = depts.join('-')
  const year = new Date().getFullYear()
  const seq = String(sequence).padStart(3, '0')
  return `${siteStr}-${deptStr}-${year}-${seq}`
}

export function exportToXLSX(projects) {
  const rows = projects.map(p => ({
    'Project Code':    p.code,
    'Type':            p.projectCategory || 'Kaizen',
    'Title':           p.title,
    'Site':            p.site,
    'Dept(s)':         (p.depts || []).join(', '),
    'Team Leader':     p.leader,
    'Priority':        p.priority || '',
    'Status':          p.status,
    'Start Date':      p.startDate      ? formatDate(p.startDate)      : '',
    'Target Date':     p.targetDate     ? formatDate(p.targetDate)      : '',
    'Completion Date': p.completionDate ? formatDate(p.completionDate)  : '',
    'Progress %':      (p.progress ?? 0) + '%',
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'CI Projects')
  XLSX.writeFile(wb, `CI_Projects_${new Date().toISOString().split('T')[0]}.xlsx`)
}
