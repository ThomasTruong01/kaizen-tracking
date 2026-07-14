// ─────────────────────────────────────────────────────────────────────────────
// useProjectFilters.js — All dashboard filter, sort, and count logic
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from 'react'
import { projectYear } from '../lib/utils'

const CURRENT_YEAR = String(new Date().getFullYear())
const PENDING_STATUSES = ['Pending Dept. Manager Review', 'Pending Finance', 'Pending CQM']

function siteDefault(userLocation) {
  return userLocation && userLocation !== 'Global' ? userLocation : 'All'
}

export function useProjectFilters(projects = [], userLocation = 'All') {
  const [selectedStatuses, setSelectedStatuses] = useState(
    () => new Set(['Open', 'In Progress', '__pending'])
  )
  const [filterSite,     setFilterSite]     = useState(() => siteDefault(userLocation))

  // Keep site in sync when the active user changes (dev switcher)
  useEffect(() => { setFilterSite(siteDefault(userLocation)) }, [userLocation])
  const [filterType,     setFilterType]     = useState('All')
  const [filterDept,     setFilterDept]     = useState('All')
  const [filterYear,     setFilterYear]     = useState(CURRENT_YEAR)
  const [filterCategory, setFilterCategory] = useState('All')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [sortCol,      setSortCol]      = useState('code')
  const [sortDir,      setSortDir]      = useState('asc')

  function applyYearFilter(data) {
    if (filterYear === 'All') return data
    return data.filter(p => projectYear(p) === filterYear)
  }

  function applyStatusFilter(data) {
    if (selectedStatuses.size === 0) return data
    return data.filter(p => {
      for (const sf of selectedStatuses) {
        if (sf === '__pending' && PENDING_STATUSES.includes(p.status)) return true
        if (p.status === sf) return true
      }
      return false
    })
  }

  function toggleStatus(sf) {
    if (sf === 'All') {
      setSelectedStatuses(new Set())
      return
    }
    setSelectedStatuses(prev => {
      const next = new Set(prev)
      if (next.has(sf)) next.delete(sf)
      else next.add(sf)
      return next
    })
  }

  const availableYears = useMemo(() => {
    const years = [...new Set(projects.map(projectYear))].filter(Boolean)
    return years.sort((a, b) => b - a)
  }, [projects])

  // Site pill counts — year + status + type + dept + search filtered (excludes site)
  const siteCounts = useMemo(() => {
    let base = applyYearFilter(projects)
    base = applyStatusFilter(base)
    if (filterType !== 'All') base = base.filter(p => p.type === filterType)
    if (filterDept !== 'All') base = base.filter(p => (p.depts || []).includes(filterDept))
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      base = base.filter(p =>
        p.code?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.leader?.toLowerCase().includes(q)
      )
    }
    const counts = { All: base.length }
    base.forEach(p => { counts[p.site] = (counts[p.site] || 0) + 1 })
    return counts
  }, [projects, selectedStatuses, filterType, filterDept, filterYear, searchQuery])

  // Summary card counts — always based on full year + site filtered data
  const cardCounts = useMemo(() => {
    let y = applyYearFilter(projects)
    if (filterSite !== 'All') y = y.filter(p => p.site === filterSite)
    return {
      all:       y.length,
      open:      y.filter(p => p.status === 'Open').length,
      progress:  y.filter(p => p.status === 'In Progress').length,
      pending:   y.filter(p => PENDING_STATUSES.includes(p.status)).length,
      completed: y.filter(p => p.status === 'Completed').length,
      cancelled: y.filter(p => p.status === 'Cancelled').length,
    }
  }, [projects, filterYear, filterSite])

  // Fully filtered + sorted rows for the table
  const filtered = useMemo(() => {
    let data = applyYearFilter(projects)
    data = applyStatusFilter(data)
    if (filterSite !== 'All') data = data.filter(p => p.site === filterSite)
    if (filterType !== 'All') data = data.filter(p => p.type === filterType)
    if (filterDept !== 'All') data = data.filter(p => (p.depts || []).includes(filterDept))
    if (filterCategory !== 'All') data = data.filter(p => (p.projectCategory || 'Kaizen') === filterCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter(p =>
        p.code?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.leader?.toLowerCase().includes(q)
      )
    }
    return [...data].sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [projects, selectedStatuses, filterSite, filterType, filterDept, filterYear, filterCategory, searchQuery, sortCol, sortDir])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  return {
    selectedStatuses, toggleStatus,
    filterSite,     setFilterSite,
    filterType,     setFilterType,
    filterDept,     setFilterDept,
    filterYear,     setFilterYear,
    filterCategory, setFilterCategory,
    searchQuery,    setSearchQuery,
    sortCol, sortDir, handleSort,
    filtered, cardCounts, siteCounts, availableYears,
  }
}
