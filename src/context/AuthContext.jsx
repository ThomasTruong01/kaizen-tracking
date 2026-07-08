// ─────────────────────────────────────────────────────────────────────────────
// AuthContext.jsx
// Provides the current user to all components.
//
// On mount, fetches the roles list from the API and computes kaizenRoles by
// checking which role groups contain this user's username or m3User.
// Falls back to the hardcoded kaizenRoles in mockUser.js if the server is
// unreachable (useful during standalone development).
//
// switchUser(username) — picks a TEST_USER persona and recomputes their
// kaizenRoles against the same cached server roles. Used by the dev
// user-switcher dropdown in the nav.
//
// INTRANET INTEGRATION (developer):
//   Replace MOCK_USER with getCurrentUser() from './auth.js' (JWT decode).
//   Role lookup can stay as-is once the API is live.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from 'react'
import { MOCK_USER, TEST_USERS } from '../lib/mockUser'
import { fetchRoles } from '../lib/api'

const AuthContext = createContext(null)

function computeKaizenRoles(allRoles, testUser) {
  const computed = Object.entries(allRoles)
    .filter(([, role]) =>
      role.users?.some(u =>
        u.username === testUser.username ||
        u.username === testUser.m3User
      )
    )
    .map(([key]) => key)
  // Fall back to the hardcoded kaizenRoles if this user isn't in any server role
  return computed.length > 0 ? computed : testUser.kaizenRoles
}

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(MOCK_USER)
  const [allRoles, setAllRoles] = useState(null)

  useEffect(() => {
    fetchRoles()
      .then(roles => {
        setAllRoles(roles)
        const kaizenRoles = computeKaizenRoles(roles, MOCK_USER)
        setUser(prev => ({ ...prev, kaizenRoles }))
      })
      .catch(() => {
        // Server unreachable — keep the hardcoded kaizenRoles from mockUser.js
      })
  }, [])

  function switchUser(username) {
    const testUser = TEST_USERS.find(u => u.username === username)
    if (!testUser) return
    const kaizenRoles = allRoles
      ? computeKaizenRoles(allRoles, testUser)
      : testUser.kaizenRoles
    setUser({ ...testUser, kaizenRoles })
  }

  return (
    <AuthContext.Provider value={{ user, switchUser, TEST_USERS, allRoles }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
