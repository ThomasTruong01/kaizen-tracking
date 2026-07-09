// AccordionSection.jsx — Collapsible PDCA section banner

import { useState } from 'react'

const COLORS = {
  info:        'bg-red-700',
  pdca:        'bg-indigo-700',
  plan:        'bg-blue-600',
  do:          'bg-orange-500',
  check:       'bg-purple-600',
  act:         'bg-green-600',
  wrapup:      'bg-gray-700',
  a3:          'bg-teal-600',
  methodology: 'bg-slate-600',
}

export function AccordionSection({ title, stage = 'info', defaultOpen = true, locked = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const color = COLORS[stage] || 'bg-gray-600'

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button onClick={() => !locked && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-white font-bold text-sm
          ${color} ${locked ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}>
        <span>{title}</span>
        <span className="text-base">{open ? '▾' : '▸'}</span>
      </button>
      {locked && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-5 text-center text-sm text-gray-400">
          🔒 Awaiting Manager Approval
        </div>
      )}
      {!locked && open && (
        <div className="p-5 bg-white space-y-5">
          {children}
        </div>
      )}
    </div>
  )
}
