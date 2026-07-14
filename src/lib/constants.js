// ─────────────────────────────────────────────────────────────────────────────
// constants.js — Central source of truth for all Continual Improvement module constants
// ─────────────────────────────────────────────────────────────────────────────

export const SITES = ['US', 'MX', 'SZ', 'MY', 'Global']

export const DEPARTMENTS = [
  'CQ', 'FI', 'HR', 'IT', 'MA', 'ME',
  'PC', 'PR', 'QA', 'QC', 'SC', 'SL', 'WH',
]

export const PROJECT_TYPES = [
  'Quality', 'Productivity', 'Efficiency', 'System', 'Safety', 'Other',
]

export const STATUSES = {
  OPEN:            'Open',
  PENDING_MANAGER: 'Pending Dept. Manager Review',
  IN_PROGRESS:     'In Progress',
  PENDING_FINANCE: 'Pending Finance',
  PENDING_CQM:     'Pending CQM',
  COMPLETED:       'Completed',
  CANCELLED:       'Cancelled',
}

export const PRIORITIES = {
  HIGH:   'High',
  MEDIUM: 'Medium',
  LOW:    'Low',
}

export const ACTIVITY_STATUSES = ['Open', 'In-Progress', 'Completed']

export const ROOT_CAUSE_TOOLS = [
  { id: '5whys',    label: '5-Whys' },
  { id: 'fishbone', label: 'Cause & Effect (Fishbone)' },
  { id: 'fmea',     label: 'FMEA' },
  { id: 'pareto',   label: 'Pareto Diagram' },
  { id: 'control',  label: 'Control Chart' },
  { id: 'other',    label: 'Other' },
]

export const FINANCE_VALIDATION_STATUSES = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  PENDING:     'Pending Finance Review',
  APPROVED:    'Approved',
  REJECTED:    'Rejected',
}

// Status badge Tailwind classes
export const STATUS_COLORS = {
  [STATUSES.OPEN]:            'bg-blue-100 text-blue-700',
  [STATUSES.PENDING_MANAGER]: 'bg-purple-100 text-purple-700',
  [STATUSES.IN_PROGRESS]:     'bg-orange-100 text-orange-700',
  [STATUSES.PENDING_FINANCE]: 'bg-purple-100 text-purple-700',
  [STATUSES.PENDING_CQM]:     'bg-purple-100 text-purple-700',
  [STATUSES.COMPLETED]:       'bg-green-100 text-green-700',
  [STATUSES.CANCELLED]:       'bg-gray-100 text-gray-500',
}

// Priority badge Tailwind classes
export const PRIORITY_COLORS = {
  [PRIORITIES.HIGH]:   'bg-red-100 text-red-700',
  [PRIORITIES.MEDIUM]: 'bg-orange-100 text-orange-700',
  [PRIORITIES.LOW]:    'bg-green-100 text-green-700',
}

// ── Role-based permissions ─────────────────────────────────────────────────────
//
// Add new actions here as the app grows.
// IT developer: roles come from the JWT token via AuthContext on load.

const PERMISSIONS = {
  cancel:      ['admin', 'corpQM', 'qaManager', 'deptManager'],
  approve:     ['admin', 'corpQM', 'deptManager'],
  setFinance:  ['admin', 'corpQM', 'financeRep'],
  cqmSignOff:  ['admin', 'corpQM', 'qaManager'],
  manageRoles: ['admin'],
}

export function userCan(user, action) {
  const roles = user?.kaizenRoles || []
  return PERMISSIONS[action]?.some(r => roles.includes(r)) ?? false
}
