// EmployeeSearch.jsx — Autocomplete input that searches the employee API by name or EID

import { useState, useEffect, useRef } from 'react'
import { searchEmployees } from '../../lib/api'

export function EmployeeSearch({
  value,
  onChange,
  onSelect,
  placeholder = 'Search by name or EID...',
  disabled = false,
  inputClassName = '',
}) {
  const [results, setResults]   = useState([])
  const [open,    setOpen]      = useState(false)
  const [loading, setLoading]   = useState(false)
  const timerRef    = useRef(null)
  const containerRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e) {
    const q = e.target.value
    onChange(q)
    clearTimeout(timerRef.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchEmployees(q)
        setResults(res)
        setOpen(res.length > 0)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }

  function handleSelect(emp) {
    onSelect(emp)
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => results.length > 0 && setOpen(true)}
        className={inputClassName}
      />
      {loading && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
          …
        </span>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded shadow-lg mt-0.5 max-h-52 overflow-y-auto text-sm">
          {results.map(emp => (
            <li key={emp.empNum}
              onMouseDown={() => handleSelect(emp)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50">
              <span className="font-semibold text-gray-800 flex-1 truncate">{emp.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">#{emp.empNum}</span>
              <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block truncate max-w-[120px]">{emp.deptName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
