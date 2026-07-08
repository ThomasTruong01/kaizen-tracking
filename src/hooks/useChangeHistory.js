// ─────────────────────────────────────────────────────────────────────────────
// useChangeHistory.js — Change history log for a Kaizen project
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { logHistoryEntry } from '../lib/api'

export function useChangeHistory(projectId) {
  const [entries, setEntries] = useState([
    // Pre-populated demo entries so Change History looks realistic on load
    { type: 'action', icon: '🆕', text: 'Project created', user: 'thomas.truong', time: new Date(Date.now() - 7 * 86400000).toISOString() },
    { type: 'section', section: 'Project Information', user: 'thomas.truong', time: new Date(Date.now() - 7 * 86400000 + 300000).toISOString(),
      fields: [
        { name: 'Project Title', from: null, to: 'Reduce Tapes/Adhesives Rejection Rate' },
        { name: 'Location', from: null, to: 'US' },
        { name: 'Type', from: null, to: 'Quality' },
      ]
    },
    { type: 'action', icon: '📤', text: 'Submitted for Dept. Manager Review', user: 'thomas.truong', time: new Date(Date.now() - 6 * 86400000).toISOString() },
    { type: 'action', icon: '✅', text: 'Approved by samuelc — Priority set to High', user: 'samuelc', time: new Date(Date.now() - 5 * 86400000).toISOString() },
  ])

  const logAction = useCallback(async (icon, text, user = 'thomas.truong') => {
    const entry = { type: 'action', icon, text, user, time: new Date().toISOString() }
    setEntries(prev => [...prev, entry])
    if (projectId) await logHistoryEntry(projectId, entry).catch(() => {})
  }, [projectId])

  const logSection = useCallback(async (section, fields = [], user = 'thomas.truong') => {
    if (!fields.length) return
    const entry = { type: 'section', section, user, time: new Date().toISOString(), fields }
    setEntries(prev => [...prev, entry])
    if (projectId) await logHistoryEntry(projectId, entry).catch(() => {})
  }, [projectId])

  return { entries, setEntries, logAction, logSection }
}
