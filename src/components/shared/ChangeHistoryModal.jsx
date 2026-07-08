// ─────────────────────────────────────────────────────────────────────────────
// ChangeHistoryModal.jsx
// Three-layer change history timeline: action → section (collapsible) → field
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function ActionEntry({ entry }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-gray-50">
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 ring-2 ring-white ring-offset-1 ring-offset-blue-500/20" />
      <span className="text-base leading-none flex-shrink-0">{entry.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700">{entry.text}</span>
        <div className="text-xs text-gray-400 mt-0.5">{entry.user} · {formatTime(entry.time)}</div>
      </div>
    </div>
  )
}

function SectionEntry({ entry }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-50">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 py-2.5 text-left hover:bg-gray-50 px-0">
        <div className="w-2 h-2 rounded-full bg-green-700 mt-0.5 flex-shrink-0 ring-2 ring-white ring-offset-1 ring-offset-green-700/20" />
        <span className={`text-xs text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`}>▾</span>
        <span className="flex-1 text-sm text-gray-700">
          <span className="inline-block bg-green-100 text-green-800 rounded px-1.5 py-0.5 text-xs font-bold mr-1.5">
            {entry.section}
          </span>
          saved by {entry.user}
        </span>
        <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(entry.time)}</span>
      </button>
      {open && (
        <div className="ml-8 mb-2 space-y-1">
          {(entry.fields || []).map((f, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">{f.name}</span>
              {f.from
                ? <> changed from <span className="line-through text-red-500">{f.from}</span> to <span className="font-semibold text-green-700">{f.to}</span></>
                : <> set to <span className="font-semibold text-green-700">{f.to}</span></>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChangeHistoryModal({ entries = [], onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-14"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-md shadow-2xl w-[660px] max-w-[95vw] max-h-[78vh] flex flex-col">

        {/* Header */}
        <div className="bg-red-700 text-white px-5 py-3.5 rounded-t-md flex items-center justify-between flex-shrink-0">
          <span className="font-bold">📋 Change History</span>
          <button onClick={onClose} className="text-2xl font-light opacity-80 hover:opacity-100 leading-none">×</button>
        </div>

        {/* Timeline */}
        <div className="overflow-y-auto px-5 py-3 flex-1">
          {entries.length === 0
            ? <p className="text-gray-400 text-sm text-center py-10">No history yet.</p>
            : entries.map((entry, i) =>
                entry.type === 'action'
                  ? <ActionEntry  key={i} entry={entry} />
                  : <SectionEntry key={i} entry={entry} />
              )
          }
        </div>
      </div>
    </div>
  )
}
