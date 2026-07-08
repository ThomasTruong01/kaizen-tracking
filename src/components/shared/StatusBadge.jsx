// StatusBadge.jsx — Color-coded status and priority badges

import { STATUS_COLORS, PRIORITY_COLORS } from '../../lib/constants'

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${cls}`}>
      <span className="w-1.5 h-1.5 min-w-[6px] min-h-[6px] rounded-full bg-current opacity-70 flex-shrink-0 self-center" />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  if (!priority) return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-400">
      Not Set
    </span>
  )
  const cls   = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-600'
  // const emoji = priority === 'High' ? '🔴' : priority === 'Medium' ? '🟡' : '🟢'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {/* {emoji} {priority} */}
      {priority}
    </span>
  )
}
