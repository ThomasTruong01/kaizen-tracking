// db.js — Simple JSON file store. No native binaries required.
// IT developers can swap this module for a real DB adapter without touching routes.
//
// Data lives in server/data/*.json — human-readable, easy to inspect.

const fs   = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })

// ── Generic store ─────────────────────────────────────────────────────────────

function load(name, defaultVal) {
  const file = path.join(DATA_DIR, `${name}.json`)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return defaultVal }
}

function save(name, data) {
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2))
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1
}

// ── Projects ──────────────────────────────────────────────────────────────────

let projects = load('projects', null)

if (!projects) {
  projects = [
    { id: 1,  code: 'US-QC-2026-001',        title: 'Reduce Tapes/Adhesives Rejection Rate',              type: 'Quality',    site: 'US',     depts: ['QC','PR'],   leader: 'Thomas Truong',   status: 'In Progress',                priority: 'High',   startDate: '2026-01-15', targetDate: '2026-06-30', completionDate: null, progress: 60,  formData: null },
    { id: 2,  code: 'US-CQ-PR-2026-002',     title: 'ECM Implementation Process Improvement',             type: 'Efficiency', site: 'US',     depts: ['CQ','PR'],   leader: 'Samuel Castro',   status: 'Pending Dept. Manager Review', priority: 'Medium', startDate: '2026-02-01', targetDate: '2026-05-31', completionDate: null, progress: 85,  formData: null },
    { id: 3,  code: 'MX-QC-2026-001',        title: 'Incoming Inspection DMR Backlog Reduction',          type: 'Quality',    site: 'MX',     depts: ['QC','WH'],   leader: 'Maria Lopez',     status: 'Open',                        priority: 'Low',    startDate: '2026-03-10', targetDate: '2026-08-15', completionDate: null, progress: 10,  formData: null },
    { id: 4,  code: 'US-MA-ME-2026-003',     title: 'Preventive Maintenance Schedule Standardization',    type: 'Efficiency', site: 'US',     depts: ['MA','ME'],   leader: 'James Okafor',    status: 'In Progress',                priority: 'High',   startDate: '2026-01-20', targetDate: '2026-04-30', completionDate: null, progress: 75,  formData: null },
    { id: 5,  code: 'SZ-PR-2026-001',        title: 'Production Line 5S Implementation',                  type: 'Safety',     site: 'SZ',     depts: ['PR','QA'],   leader: 'Wei Zhang',       status: 'Completed',                  priority: 'Medium', startDate: '2025-10-01', targetDate: '2026-01-31', completionDate: '2026-01-28', progress: 100, formData: null },
    { id: 6,  code: 'Global-FI-CQ-2026-001', title: 'COPQ Labor Cost Calculation Standardization',        type: 'Money',      site: 'Global', depts: ['FI','CQ'],   leader: 'Thomas Truong',   status: 'Pending Finance',            priority: 'High',   startDate: '2026-02-15', targetDate: '2026-07-31', completionDate: null, progress: 40,  formData: null },
    { id: 7,  code: 'MY-QC-2026-001',        title: 'Scrap Rate Reduction — Machined Parts',              type: 'Scrap',      site: 'MY',     depts: ['QC','ME'],   leader: 'Amir Raza',       status: 'Open',                        priority: 'Low',    startDate: '2026-04-01', targetDate: '2026-09-30', completionDate: null, progress: 5,   formData: null },
    { id: 8,  code: 'US-HR-2026-001',        title: 'Employee Retraining Compliance Tracker Rollout',     type: 'Efficiency', site: 'US',     depts: ['HR','CQ'],   leader: 'Samuel Castro',   status: 'Completed',                  priority: 'Medium', startDate: '2025-11-01', targetDate: '2026-02-28', completionDate: '2026-02-25', progress: 100, formData: null },
    { id: 9,  code: 'MX-PR-MA-2026-002',     title: 'Packaging Line Downtime Root Cause Analysis',        type: 'Production', site: 'MX',     depts: ['PR','MA'],   leader: 'Carlos Mendez',   status: 'Cancelled',                  priority: 'Low',    startDate: '2026-01-10', targetDate: '2026-04-30', completionDate: null, progress: 20,  formData: null },
    { id: 10, code: 'US-SL-2026-001',        title: 'On-Time Delivery KPI Improvement Initiative',        type: 'Efficiency', site: 'US',     depts: ['SL','WH'],   leader: 'Patricia Nkosi',  status: 'Pending CQM',                priority: 'Medium', startDate: '2026-03-01', targetDate: '2026-08-31', completionDate: null, progress: 70,  formData: null },
    { id: 11, code: 'US-QC-2025-001',        title: 'First Article Inspection Process Standardization',   type: 'Quality',    site: 'US',     depts: ['QC','QA'],   leader: 'Thomas Truong',   status: 'Completed',                  priority: 'High',   startDate: '2025-02-01', targetDate: '2025-06-30', completionDate: '2025-06-15', progress: 100, formData: null },
    { id: 12, code: 'MX-PR-2025-001',        title: 'Assembly Line Cycle Time Reduction',                 type: 'Efficiency', site: 'MX',     depts: ['PR','ME'],   leader: 'Carlos Mendez',   status: 'Completed',                  priority: 'Medium', startDate: '2025-04-10', targetDate: '2025-09-30', completionDate: '2025-09-20', progress: 100, formData: null },
    { id: 13, code: 'SZ-QC-2025-002',        title: 'Supplier Incoming Quality Gate Implementation',      type: 'Quality',    site: 'SZ',     depts: ['QC','PR'],   leader: 'Wei Zhang',       status: 'Completed',                  priority: 'High',   startDate: '2025-09-01', targetDate: '2026-01-31', completionDate: '2026-01-15', progress: 100, formData: null },
    { id: 14, code: 'MY-QA-2025-001',        title: 'ISO 13485 Internal Audit Program Enhancement',       type: 'Quality',    site: 'MY',     depts: ['QA','CQ'],   leader: 'Amir Raza',       status: 'In Progress',                priority: 'High',   startDate: '2025-11-15', targetDate: '2026-05-31', completionDate: null, progress: 45,  formData: null },
    { id: 15, code: 'US-CQ-2024-001',        title: 'COPQ Tracking & Reporting Automation',               type: 'Money',      site: 'US',     depts: ['CQ','FI'],   leader: 'Samuel Castro',   status: 'Completed',                  priority: 'High',   startDate: '2024-06-01', targetDate: '2024-12-31', completionDate: '2024-12-10', progress: 100, formData: null },
  ]
  save('projects', projects)
}

// ── History ───────────────────────────────────────────────────────────────────

let history = load('history', [])

// ── Roles ─────────────────────────────────────────────────────────────────────

let roles = load('roles', null)
if (!roles) {
  roles = {
    admin:       { label: 'Admin',                       users: [] },
    corpQM:      { label: 'Corp Quality Manager',        users: [{ username: 'samuelc',      site: 'Global' }] },
    qaManager:   { label: 'QA Managers / Site Designee', users: [{ username: 'thomastr',    site: 'US' }, { username: 'tinn', site: 'US' }, { username: 'eheca_g', site: 'US' }] },
    deptManager: { label: 'Dept Managers',               users: [{ username: 'alejandro_g', site: 'US' }, { username: 'javierf', site: 'MX' }, { username: 'wei_z', site: 'SZ' }, { username: 'amir_r', site: 'MY' }] },
    financeRep:  { label: 'Finance Rep',                 users: [{ username: 'dan_l',        site: 'US' }] },
    submitter:   { label: 'Owners / Submitters',         users: [{ username: 'thomas.truong', site: 'US' }, { username: 'michaela', site: 'US' }, { username: 'gonzalog', site: 'MX' }] },
  }
  save('roles', roles)
}

// ── Employees ─────────────────────────────────────────────────────────────────

let employees = load('employees', null)
if (!employees) {
  employees = [
    { empNum: '7095', loc: 'US', dept: '55', name: 'Thomas Trungbao Truong', deptName: 'Quality - Corporate', position: 'CI Engineer Jr', workCenter: '55' },
  ]
  save('employees', employees)
}

// ── Exported store ────────────────────────────────────────────────────────────

const STATUS_PROGRESS = {
  'Open':                         0,
  'Pending Dept. Manager Review': 15,
  'In Progress':                  50,
  'Pending Finance':              80,
  'Pending CQM':                  90,
  'Completed':                    100,
  'Cancelled':                    0,
}

function deriveSite(sites = []) {
  if (!sites.length) return ''
  if (sites.includes('Global')) return 'Global'
  return sites.length === 1 ? sites[0] : 'Global'
}

module.exports = {
  STATUS_PROGRESS,
  deriveSite,

  // Projects
  getProjects: () => projects,
  getProject:  (id) => projects.find(p => p.id === Number(id)) || null,

  createProject(formData) {
    const id   = nextId(projects)
    const site  = deriveSite(formData.sites || [])
    const depts = (formData.depts || []).join('-')
    const year  = new Date().getFullYear()

    // Auto-increment sequence: per site + year (dept doesn't affect the number)
    // Sequence is always the last segment of the code after splitting on '-'
    const maxSeq = projects
      .filter(p => p.site === site && p.code && p.code.includes(`-${year}-`))
      .reduce((max, p) => {
        const parts = p.code.split('-')
        const n = parseInt(parts[parts.length - 1], 10)
        return isNaN(n) ? max : Math.max(max, n)
      }, 0)
    const code = `${site}-${depts}-${year}-${String(maxSeq + 1).padStart(3, '0')}`

    const p = {
      id,
      code,
      title:           formData.projectTitle     || '',
      type:            formData.projectType      || '',
      projectCategory: formData.projectCategory  || 'Kaizen',
      site,
      depts:           formData.depts            || [],
      leader:          formData.teamLeader       || '',
      status:          formData.status           || 'Open',
      priority:        formData.priority         || null,
      startDate:       formData.startDate        || null,
      targetDate:      formData.targetCompletion || null,
      completionDate:  formData.completionDate   || null,
      progress:        formData.progress ?? STATUS_PROGRESS[formData.status] ?? 0,
      formData: { ...formData, projectCode: code },
    }
    projects.push(p)
    save('projects', projects)
    return p
  },

  updateProject(id, formData) {
    const idx = projects.findIndex(p => p.id === Number(id))
    if (idx === -1) return null
    projects[idx] = {
      ...projects[idx],
      code:            formData.projectCode      || projects[idx].code,
      title:           formData.projectTitle     || projects[idx].title,
      type:            formData.projectType      || projects[idx].type,
      projectCategory: formData.projectCategory  || projects[idx].projectCategory || 'Kaizen',
      site:            deriveSite(formData.sites || [projects[idx].site]),
      depts:          formData.depts            || projects[idx].depts,
      leader:         formData.teamLeader       || projects[idx].leader,
      status:         formData.status           || projects[idx].status,
      priority:       formData.priority         !== undefined ? formData.priority : projects[idx].priority,
      startDate:      formData.startDate        || projects[idx].startDate,
      targetDate:     formData.targetCompletion || projects[idx].targetDate,
      completionDate: formData.completionDate   || projects[idx].completionDate,
      progress:       formData.progress ?? STATUS_PROGRESS[formData.status] ?? projects[idx].progress,
      formData,
    }
    save('projects', projects)
    return projects[idx]
  },

  patchProjectStatus(id, status, extra = {}) {
    const idx = projects.findIndex(p => p.id === Number(id))
    if (idx === -1) return null
    projects[idx] = {
      ...projects[idx],
      status,
      progress: STATUS_PROGRESS[status] ?? projects[idx].progress,
      ...extra,
    }
    if (projects[idx].formData) {
      projects[idx].formData = { ...projects[idx].formData, status, ...extra }
    }
    save('projects', projects)
    return projects[idx]
  },

  deleteProject(id) {
    const before = projects.length
    projects = projects.filter(p => p.id !== Number(id))
    if (projects.length === before) return false
    history = history.filter(h => h.projectId !== Number(id))
    save('projects', projects)
    save('history', history)
    return true
  },

  // History
  getHistory:  (projectId) => history.filter(h => h.projectId === Number(projectId)),

  addHistory(projectId, entry) {
    const item = { id: nextId(history), projectId: Number(projectId), ...entry, time: entry.time || new Date().toISOString() }
    history.push(item)
    save('history', history)
    return item
  },

  // Roles
  getRoles:  () => roles,
  saveRoles(newRoles) { roles = newRoles; save('roles', roles); return roles },

  // Employees
  getEmployees:  () => employees,
  searchEmployees(q) {
    const lower = q.toLowerCase()
    return employees.filter(e =>
      e.name.toLowerCase().includes(lower) ||
      e.empNum.includes(lower) ||
      (e.deptName || '').toLowerCase().includes(lower) ||
      (e.position || '').toLowerCase().includes(lower)
    )
  },
  upsertEmployee(emp) {
    const idx = employees.findIndex(e => e.empNum === emp.empNum)
    if (idx >= 0) employees[idx] = emp
    else employees.push(emp)
    save('employees', employees)
    return emp
  },
}
