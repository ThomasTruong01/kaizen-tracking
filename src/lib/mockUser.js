// ─────────────────────────────────────────────────────────────────────────────
// mockUser.js
// Standalone mode — simulates the logged-in user without JWT auth.
//
// In the real intranet this data comes from the JWT token in
// sessionStorage._app_token. The fields match exactly what the
// intranet's IdentityServer4 token contains.
//
// TO INTEGRATE WITH INTRANET (developer):
//   Replace this file's export with:
//   import { getCurrentUser } from './auth'
//   and delete this file.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_USER = {
  id:             'a2ab0e67-5dee-4813-a5be-7ed0d54ccc11',
  name:           'Thomas Truong',
  username:       'thomas.truong',
  m3User:         'thomastr',
  email:          'thomas.truong@rapidmfg.com',
  location:       'US',         // auto-selects US site in Project Info
  planGroup:      'W',
  employeeNumber: '7095',
  roles:          ['QA Management', 'QMS', 'COPQ_CQManager', 'QA Corporate'],
  // Kaizen module roles — derived from admin control user lists.
  // IT developer: populate this from the JWT token by checking which
  // role lists contain the current user's username.
  kaizenRoles:   ['admin', 'qaManager', 'submitter'],
}

// Test personas — used by the dev user-switcher dropdown in the nav.
// Each maps to a user that exists in server/data/roles.json so the
// AuthContext role lookup works against the real API.
export const TEST_USERS = [
  {
    id: 'usr-1',
    name: 'Thomas Truong',
    username: 'thomas.truong',
    m3User: 'thomastr',
    email: 'thomas.truong@rapidmfg.com',
    location: 'US',
    planGroup: 'W',
    employeeNumber: '7095',
    kaizenRoles: ['admin', 'qaManager', 'submitter'],
  },
  {
    id: 'usr-2',
    name: 'Samuel Castro — Corp QM',
    username: 'samuelc',
    m3User: 'samuelc',
    email: 'samuelc@rapidmfg.com',
    location: 'Global',
    planGroup: 'A',
    employeeNumber: '0001',
    kaizenRoles: ['corpQM'],
  },
  {
    id: 'usr-3',
    name: 'Alejandro G — Dept Mgr',
    username: 'alejandro_g',
    m3User: 'alejandro_g',
    email: 'alejandro.g@rapidmfg.com',
    location: 'US',
    planGroup: 'C',
    employeeNumber: '0444',
    kaizenRoles: ['deptManager'],
  },
  {
    id: 'usr-4',
    name: 'Dan L — Finance Rep',
    username: 'dan_l',
    m3User: 'dan_l',
    email: 'dan.l@rapidmfg.com',
    location: 'US',
    planGroup: 'B',
    employeeNumber: '0555',
    kaizenRoles: ['financeRep'],
  },
  {
    id: 'usr-5',
    name: 'Michaela — Submitter',
    username: 'michaela',
    m3User: 'michaela',
    email: 'michaela@rapidmfg.com',
    location: 'US',
    planGroup: 'D',
    employeeNumber: '0333',
    kaizenRoles: ['submitter'],
  },
]
