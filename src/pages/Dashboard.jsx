// Dashboard.jsx — Kaizen project list with filters, summary cards, and export

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchProjects } from '../lib/api'
import { useProjectFilters } from '../hooks/useProjectFilters'
import { exportToCSV, downloadFile, formatDate, isOverdue } from '../lib/utils'
import { StatusBadge, PriorityBadge } from '../components/shared/StatusBadge'

const SITES = ['All', 'US', 'MX', 'SZ', 'MY', 'Global']
const TYPES = ['All', 'Quality', 'Productivity', 'Efficiency', 'System', 'Safety', 'Other']
const DEPTS = ['All', 'CQ', 'FI', 'HR', 'IT', 'MA', 'ME', 'PC', 'PR', 'QA', 'QC', 'SC', 'SL', 'WH']

const CARDS = [
  { key: 'all',       label: 'Total Projects', sf: 'All',        color: 'border-gray-800 text-gray-800' },
  { key: 'open',      label: 'Open',           sf: 'Open',       color: 'border-blue-600 text-blue-600' },
  { key: 'progress',  label: 'In Progress',    sf: 'In Progress',color: 'border-orange-500 text-orange-500' },
  { key: 'pending',   label: 'Pending Review', sf: '__pending',  color: 'border-purple-600 text-purple-600' },
  { key: 'completed', label: 'Completed',      sf: 'Completed',  color: 'border-green-600 text-green-600' },
  { key: 'cancelled', label: 'Cancelled',      sf: 'Cancelled',  color: 'border-gray-400 text-gray-400' },
]

const COLS = [
  ['code','Project Code'],['projectCategory','Type'],['title','Title'],['site','Site'],
  ['leader','Team Leader'],['priority','Priority'],
  ['status','Status'],['targetDate','Target Date'],['progress','Progress'],
]

const CATEGORY_STYLES = {
  'Kaizen':    'bg-gray-100 text-gray-600',
  'Quick Win': 'bg-amber-100 text-amber-700',
}

const CATEGORY_ABBR = {
  'Kaizen':    'KZ',
  'Quick Win': 'QW',
}

export default function Dashboard() {
  const { user, switchUser, TEST_USERS } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const f = useProjectFilters(projects, user?.location)

  useEffect(() => {
    fetchProjects().then(setProjects).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-10 text-gray-500 text-sm">Loading projects...</div>
  if (error)   return <div className="p-10 text-red-600 text-sm">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-red-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold">Rapid Manufacturing</span>
          <span className="opacity-40 mx-1 text-lg font-light">|</span>
          <span className="opacity-90">Continual Improvement Projects Log</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={user?.username}
            onChange={e => switchUser(e.target.value)}
            className="text-xs bg-white/10 border border-white/30 text-white rounded px-2 py-1 cursor-pointer focus:outline-none mr-1"
          >
            {TEST_USERS.map(u => (
              <option key={u.id} value={u.username} className="text-gray-900 bg-white">{u.name}</option>
            ))}
          </select>
          <button onClick={() => navigate('/kaizen/control')} className="text-xs border border-white/40 bg-white/10 rounded px-3 py-1.5 hover:bg-white/20">⚙ Admin</button>
          <button onClick={() => navigate('/kaizen/new')} className="text-xs bg-white text-red-700 font-bold rounded px-3 py-1.5 hover:bg-red-50">+ New Project</button>
        </div>
      </nav>

      <div className="max-w-screen-xl mx-auto px-6 py-7 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Continual Improvement Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">QA.P02.W04 — All sites &amp; departments</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-6 gap-3">
          {CARDS.map(c => {
            const isActive = c.sf === 'All'
              ? f.selectedStatuses.size === 0
              : f.selectedStatuses.has(c.sf)
            return (
              <button key={c.key}
                onClick={() => f.toggleStatus(c.sf)}
                className={`bg-white rounded shadow-sm border-t-4 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${c.color} ${isActive ? 'ring-2 ring-current ring-offset-1' : ''}`}>
                <div className="text-3xl font-bold leading-none mb-1.5">{f.cardCounts[c.key]}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.label}</div>
              </button>
            )
          })}
        </div>

        {/* Site + Category pills */}
        <div className="flex gap-2 flex-wrap items-center">
          {SITES.map(site => (
            <button key={site} onClick={() => f.setFilterSite(site)}
              className={`rounded-full px-3 py-1 text-sm font-semibold border transition-colors ${f.filterSite === site ? 'bg-red-700 text-white border-red-700' : 'bg-white border-gray-300 text-gray-600 hover:border-red-300'}`}>
              {site}
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${f.filterSite === site ? 'bg-white/25' : 'bg-gray-100 text-gray-400'}`}>
                {site === 'All' ? f.siteCounts.All || 0 : f.siteCounts[site] || 0}
              </span>
            </button>
          ))}
          <div className="w-px h-5 bg-gray-300 mx-1" />
          {['All', 'Kaizen', 'Quick Win'].map(cat => (
            <button key={cat} onClick={() => f.setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-sm font-semibold border transition-colors ${f.filterCategory === cat ? 'bg-red-700 text-white border-red-700' : 'bg-white border-gray-300 text-gray-600 hover:border-red-300'}`}>
              {cat === 'All' ? 'All Types' : cat}
            </button>
          ))}
        </div>

        {/* Filters toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-44 max-w-72">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input type="text" value={f.searchQuery} onChange={e => f.setSearchQuery(e.target.value)}
              placeholder="Code, title, or leader..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <select value={f.filterYear} onChange={e => f.setFilterYear(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-2 bg-white">
            <option value="All">All Years</option>
            {f.availableYears.map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={f.filterType} onChange={e => f.setFilterType(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-2 bg-white">
            {TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <select value={f.filterDept} onChange={e => f.setFilterDept(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-2 bg-white">
            {DEPTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>
          <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">Showing {f.filtered.length} of {projects.length}</span>
          <button onClick={() => downloadFile(exportToCSV(f.filtered), `Kaizen_Log_${new Date().toISOString().split('T')[0]}.csv`)}
            className="text-sm border border-gray-300 rounded px-3 py-2 bg-white hover:bg-gray-50 font-medium text-gray-700 whitespace-nowrap">
            ⬇ Export to Excel
          </button>
        </div>

        {/* Project table */}
        <div className="bg-white rounded shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[950px] border-collapse">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {COLS.map(([col, label]) => (
                  <th key={col} onClick={() => f.handleSort(col)}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 whitespace-nowrap select-none">
                    {label} <span className={f.sortCol === col ? 'text-blue-500' : 'opacity-25'}>{f.sortCol === col ? (f.sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.filtered.length === 0
                ? <tr><td colSpan={9} className="text-center py-14 text-gray-400 text-sm">No projects match your filters.</td></tr>
                : f.filtered.map(p => {
                    const od  = isOverdue(p.targetDate, p.status)
                    const cat = p.projectCategory || 'Kaizen'
                    return (
                      <tr key={p.id} onClick={() => navigate(`/kaizen/project/${p.id}`)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="px-3 py-3 font-mono text-xs font-bold text-green-800 whitespace-nowrap">{p.code}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`text-xs font-semibold rounded px-2 py-0.5 ${CATEGORY_STYLES[cat] || CATEGORY_STYLES['Kaizen']}`}>{CATEGORY_ABBR[cat] || 'KZ'}</span>
                        </td>
                        <td className="px-3 py-3 max-w-[220px]">
                          <div className="font-semibold text-gray-800 leading-snug truncate">{p.title}</div>
                          <div className="text-xs text-gray-400">{p.type}</div>
                        </td>
                        <td className="px-3 py-3"><span className="bg-gray-100 rounded px-2 py-0.5 text-xs font-bold text-gray-700">{p.site}</span></td>
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap text-xs">{p.leader}</td>
                        <td className="px-3 py-3"><PriorityBadge priority={p.priority} /></td>
                        <td className="px-3 py-3 max-w-[150px]"><StatusBadge status={p.status} /></td>
                        <td className={`px-3 py-3 text-xs whitespace-nowrap ${od ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>{formatDate(p.targetDate)}{od ? ' ⚠' : ''}</td>
                        <td className="px-3 py-3">
                          <div className="w-20">
                            <div className="h-1.5 bg-gray-200 rounded-full"><div className="h-full bg-green-600 rounded-full" style={{width:`${p.progress}%`}} /></div>
                            <div className="text-xs text-gray-400 text-right mt-0.5">{p.progress}%</div>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 text-center pb-2">QA.P02.W04.F03 Rev. B1 — For Reference Only</p>
      </div>
    </div>
  )
}
