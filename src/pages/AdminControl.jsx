// AdminControl.jsx — Kaizen Admin Control Panel
// Route: #/kaizen/control

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRoles, saveRoles } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { userCan } from '../lib/constants'

const SITES = ['US', 'MX', 'SZ', 'MY', 'Global']

const ROLE_META = {
  admin:       { label: 'Admin',                       desc: 'Full system access. Manage all users, roles, and settings.' },
  corpQM:      { label: 'Corp Quality Manager',        desc: 'Approves Global projects. CQM final sign-off on all sites.' },
  qaManager:   { label: 'QA Managers / Site Designee', desc: 'CQM final sign-off for their assigned site only.' },
  deptManager: { label: 'Dept Managers',               desc: 'Approve submitted projects for their department. Assign and update priority.' },
  financeRep:  { label: 'Finance Rep',                 desc: 'Finance Validation section only (QA.P02.W04.F05).' },
  submitter:   { label: 'Owners / Submitters',         desc: 'Create and edit their own Kaizen projects.' },
}

function RolePanel({ roleKey, meta, users, onAdd, onRemove }) {
  const [open,        setOpen]        = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newSite,     setNewSite]     = useState('US')

  function handleAdd() {
    if (!newUsername.trim()) return
    onAdd(roleKey, { username: newUsername.trim(), site: newSite })
    setNewUsername(''); setNewSite('US'); setShowForm(false)
  }

  return (
    <div className="bg-white border border-gray-200 border-t-[3px] border-t-red-600 rounded shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <span className="font-semibold text-sm text-gray-800">{meta.label}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowForm(v => !v)}
            className="w-6 h-6 rounded bg-emerald-600 text-white text-xl leading-none hover:bg-emerald-700 flex items-center justify-center font-light">+</button>
          <button onClick={() => setOpen(v => !v)}
            className={`text-gray-400 text-xs transition-transform ${open ? '' : '-rotate-90'}`}>▾</button>
        </div>
      </div>
      {open && (
        <>
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-400 italic">{meta.desc}</div>
          {users.length === 0 && !showForm
            ? <div className="px-3 py-4 text-xs text-gray-300 italic text-center">No users assigned</div>
            : <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="w-10 px-2 py-1.5"></th>
                    <th className="px-2 py-1.5 text-left text-gray-500 font-semibold">User</th>
                    <th className="w-20 px-2 py-1.5 text-left text-gray-500 font-semibold">Site</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-2 py-1.5">
                        <button onClick={() => onRemove(roleKey, i)}
                          className="w-5 h-5 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center justify-center">×</button>
                      </td>
                      <td className="px-2 py-1.5 text-gray-700">{u.username}</td>
                      <td className="px-2 py-1.5 text-gray-500">{u.site}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
          {showForm && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-t border-blue-100 flex-wrap">
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false) }}
                placeholder="Username (e.g. thomastr)" autoFocus
                className="flex-1 min-w-28 text-xs border border-blue-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <select value={newSite} onChange={e => setNewSite(e.target.value)}
                className="text-xs border border-blue-200 rounded px-2 py-1.5 w-20 bg-white">
                {SITES.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={handleAdd} className="text-xs bg-emerald-600 text-white rounded px-3 py-1.5 font-semibold hover:bg-emerald-700">Add</button>
              <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-700 px-2">Cancel</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminControl() {
  const navigate  = useNavigate()
  const { user, switchUser, TEST_USERS } = useAuth()
  const [roles,   setRoles]   = useState(null)
  const [dirty,   setDirty]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRoles().then(setRoles).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    const h = e => { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  function handleAdd(key, user) {
    setRoles(p => ({ ...p, [key]: { ...p[key], users: [...(p[key]?.users || []), user] } }))
    setDirty(true)
  }
  function handleRemove(key, idx) {
    setRoles(p => ({ ...p, [key]: { ...p[key], users: p[key].users.filter((_, i) => i !== idx) } }))
    setDirty(true)
  }
  async function handleSave() {
    setSaving(true)
    await saveRoles(roles)
    setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 3000); setSaving(false)
  }
  function handleCancel() {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    navigate('/kaizen/dashboard')
  }

  if (loading) return <div className="p-10 text-gray-500 text-sm">Loading...</div>

  if (!userCan(user, 'manageRoles')) return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center max-w-sm">
        <p className="text-2xl mb-3">🔒</p>
        <p className="font-semibold text-gray-800 mb-1">Access Restricted</p>
        <p className="text-sm text-gray-500">Admin Control is only available to Administrators. Contact your system administrator if you need access.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="bg-white border-b border-gray-200 px-5 py-2 text-xs text-gray-500 flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/kaizen/dashboard')} className="text-red-600 hover:underline">Home</button>
          <span className="mx-1">/</span>
          <button onClick={() => navigate('/kaizen/dashboard')} className="text-red-600 hover:underline">Kaizen Log</button>
          <span className="mx-1">/</span>
          <span>Control</span>
        </div>
        <select
          value={user?.username}
          onChange={e => switchUser(e.target.value)}
          className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 cursor-pointer focus:outline-none"
        >
          {TEST_USERS.map(u => (
            <option key={u.id} value={u.username}>{u.name}</option>
          ))}
        </select>
      </div>
      <div className="px-5 py-3 flex items-center gap-2">
        <button onClick={handleSave} disabled={saving}
          className="text-sm bg-red-600 text-white font-semibold rounded px-4 py-1.5 hover:bg-red-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleCancel}
          className="text-sm bg-white border border-gray-400 rounded px-4 py-1.5 hover:bg-gray-50 font-semibold text-gray-700">
          Cancel
        </button>
        {saved  && <span className="text-xs text-green-600 font-semibold">✓ Changes saved</span>}
        {dirty && !saved && <span className="text-xs text-amber-600">Unsaved changes</span>}
      </div>
      <div className="px-5 pb-10 grid grid-cols-3 gap-4">
        {roles && Object.entries(ROLE_META).map(([key, meta]) => (
          <RolePanel key={key} roleKey={key} meta={meta}
            users={roles[key]?.users || []}
            onAdd={handleAdd} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  )
}
