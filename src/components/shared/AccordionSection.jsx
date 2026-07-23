// AccordionSection.jsx — Collapsible section banner (used by Project Info, PDCA, A3, Quick Win, Wrap-Up)

import { useState } from 'react'

const SUB_STAGES = new Set(['plan', 'do', 'check', 'act'])

export function AccordionSection({ title, stage = 'info', defaultOpen = true, locked = false, complete = false, onToggleComplete, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const isSub = SUB_STAGES.has(stage)

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button onClick={() => !locked && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm
          ${isSub
            ? `bg-gray-50 border-b border-gray-200 text-gray-800 ${locked ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`
            : `bg-red-700 text-white ${locked ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`
          }`}>
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {/* Sub-sections with toggle: interactive Mark Complete button */}
          {isSub && onToggleComplete && (
            <button
              onClick={e => { e.stopPropagation(); onToggleComplete() }}
              className={`flex items-center gap-1.5 text-xs font-semibold rounded px-2 py-1 transition-colors ${
                complete
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'border border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600'
              }`}>
              {complete ? '✓ Complete' : 'Mark Complete'}
            </button>
          )}
          {/* Sub-sections without toggle: read-only Complete tag */}
          {isSub && !onToggleComplete && complete && (
            <span className="text-xs font-semibold bg-green-600 text-white rounded px-2 py-1">✓ Complete</span>
          )}
          {/* Top-level sections: read-only Complete badge */}
          {!isSub && complete && (
            <span className="text-xs font-semibold bg-white/20 text-white rounded px-2 py-0.5">✓ Complete</span>
          )}
          <span className={`text-base ${isSub ? 'text-gray-500' : ''}`}>{open ? '▾' : '▸'}</span>
        </div>
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
