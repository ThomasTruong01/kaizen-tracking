// ─────────────────────────────────────────────────────────────────────────────
// sampleData.js
// ⚠ SAMPLE DATA — Replace with real API responses when integrating with intranet
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_PROJECTS = [
  {
    id: 1, code: 'US-QC-2026-001',
    title: 'Reduce Tapes/Adhesives Rejection Rate',
    type: 'Quality', site: 'US', depts: ['QC', 'PR'],
    leader: 'Thomas Truong', status: 'In Progress', priority: 'High',
    startDate: '2026-01-15', targetDate: '2026-06-30', completionDate: null, progress: 60,
  },
  {
    id: 2, code: 'US-CQ-PR-2026-002',
    title: 'ECM Implementation Process Improvement',
    type: 'Efficiency', site: 'US', depts: ['CQ', 'PR'],
    leader: 'Samuel Castro', status: 'Pending Dept. Manager Review', priority: 'Medium',
    startDate: '2026-02-01', targetDate: '2026-05-31', completionDate: null, progress: 85,
  },
  {
    id: 3, code: 'MX-QC-2026-001',
    title: 'Incoming Inspection DMR Backlog Reduction',
    type: 'Quality', site: 'MX', depts: ['QC', 'WH'],
    leader: 'Maria Lopez', status: 'Open', priority: 'Low',
    startDate: '2026-03-10', targetDate: '2026-08-15', completionDate: null, progress: 10,
  },
  {
    id: 4, code: 'US-MA-ME-2026-003',
    title: 'Preventive Maintenance Schedule Standardization',
    type: 'Efficiency', site: 'US', depts: ['MA', 'ME'],
    leader: 'James Okafor', status: 'In Progress', priority: 'High',
    startDate: '2026-01-20', targetDate: '2026-04-30', completionDate: null, progress: 75,
  },
  {
    id: 5, code: 'SZ-PR-2026-001',
    title: 'Production Line 5S Implementation',
    type: 'Safety', site: 'SZ', depts: ['PR', 'QA'],
    leader: 'Wei Zhang', status: 'Completed', priority: 'Medium',
    startDate: '2025-10-01', targetDate: '2026-01-31', completionDate: '2026-01-28', progress: 100,
  },
  {
    id: 6, code: 'Global-FI-CQ-2026-001',
    title: 'COPQ Labor Cost Calculation Standardization',
    type: 'Money', site: 'Global', depts: ['FI', 'CQ'],
    leader: 'Thomas Truong', status: 'Pending Finance', priority: 'High',
    startDate: '2026-02-15', targetDate: '2026-07-31', completionDate: null, progress: 40,
  },
  {
    id: 7, code: 'MY-QC-2026-001',
    title: 'Scrap Rate Reduction — Machined Parts',
    type: 'Scrap', site: 'MY', depts: ['QC', 'ME'],
    leader: 'Amir Raza', status: 'Open', priority: 'Low',
    startDate: '2026-04-01', targetDate: '2026-09-30', completionDate: null, progress: 5,
  },
  {
    id: 8, code: 'US-HR-2026-001',
    title: 'Employee Retraining Compliance Tracker Rollout',
    type: 'Efficiency', site: 'US', depts: ['HR', 'CQ'],
    leader: 'Samuel Castro', status: 'Completed', priority: 'Medium',
    startDate: '2025-11-01', targetDate: '2026-02-28', completionDate: '2026-02-25', progress: 100,
  },
  {
    id: 9, code: 'MX-PR-MA-2026-002',
    title: 'Packaging Line Downtime Root Cause Analysis',
    type: 'Production', site: 'MX', depts: ['PR', 'MA'],
    leader: 'Carlos Mendez', status: 'Cancelled', priority: 'Low',
    startDate: '2026-01-10', targetDate: '2026-04-30', completionDate: null, progress: 20,
  },
  {
    id: 10, code: 'US-SL-2026-001',
    title: 'On-Time Delivery KPI Improvement Initiative',
    type: 'Efficiency', site: 'US', depts: ['SL', 'WH'],
    leader: 'Patricia Nkosi', status: 'Pending CQM', priority: 'Medium',
    startDate: '2026-03-01', targetDate: '2026-08-31', completionDate: null, progress: 70,
  },
  // Cross-year examples
  {
    id: 11, code: 'US-QC-2025-001',
    title: 'First Article Inspection Process Standardization',
    type: 'Quality', site: 'US', depts: ['QC', 'QA'],
    leader: 'Thomas Truong', status: 'Completed', priority: 'High',
    startDate: '2025-02-01', targetDate: '2025-06-30', completionDate: '2025-06-15', progress: 100,
  },
  {
    id: 12, code: 'MX-PR-2025-001',
    title: 'Assembly Line Cycle Time Reduction',
    type: 'Efficiency', site: 'MX', depts: ['PR', 'ME'],
    leader: 'Carlos Mendez', status: 'Completed', priority: 'Medium',
    startDate: '2025-04-10', targetDate: '2025-09-30', completionDate: '2025-09-20', progress: 100,
  },
  {
    id: 13, code: 'SZ-QC-2025-002',
    title: 'Supplier Incoming Quality Gate Implementation',
    type: 'Quality', site: 'SZ', depts: ['QC', 'PR'],
    leader: 'Wei Zhang', status: 'Completed', priority: 'High',
    startDate: '2025-09-01', targetDate: '2026-01-31', completionDate: '2026-01-15', progress: 100,
  },
  {
    id: 14, code: 'MY-QA-2025-001',
    title: 'ISO 13485 Internal Audit Program Enhancement',
    type: 'Quality', site: 'MY', depts: ['QA', 'CQ'],
    leader: 'Amir Raza', status: 'In Progress', priority: 'High',
    startDate: '2025-11-15', targetDate: '2026-05-31', completionDate: null, progress: 45,
  },
  {
    id: 15, code: 'US-CQ-2024-001',
    title: 'COPQ Tracking & Reporting Automation',
    type: 'Money', site: 'US', depts: ['CQ', 'FI'],
    leader: 'Samuel Castro', status: 'Completed', priority: 'High',
    startDate: '2024-06-01', targetDate: '2024-12-31', completionDate: '2024-12-10', progress: 100,
  },
]

export const SAMPLE_ROLES = {
  admin:       { label: 'Admin',                       users: [] },
  corpQM:      { label: 'Corp Quality Manager',        users: [{ username: 'samuelc', site: 'Global' }] },
  qaManager:   { label: 'QA Managers / Site Designee', users: [{ username: 'thomastr', site: 'US' }, { username: 'tinn', site: 'US' }, { username: 'eheca_g', site: 'US' }] },
  deptManager: { label: 'Dept Managers',               users: [{ username: 'alejandro_g', site: 'US' }, { username: 'javierf', site: 'MX' }, { username: 'wei_z', site: 'SZ' }, { username: 'amir_r', site: 'MY' }] },
  financeRep:  { label: 'Finance Rep',                 users: [{ username: 'dan_l', site: 'US' }] },
  submitter:   { label: 'Owners / Submitters',         users: [{ username: 'thomas.truong', site: 'US' }, { username: 'michaela', site: 'US' }, { username: 'gonzalog', site: 'MX' }] },
}
