// CqmSignOff.jsx — QA / CQ Manager Sign-Off block

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { useAuth } from '../../../context/AuthContext'
import { STATUSES, userCan } from '../../../lib/constants'

export default function CqmSignOff() {
  const { form, setForm, logAction, saveToServer } = useKaizenForm()
  const { user } = useAuth()

  async function handleComplete() {
    const isoDate     = new Date().toISOString().split('T')[0]
    const displayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const entry   = { type: 'action', icon: '🏁', text: `Project marked Completed — ${displayDate}`, user: user?.username, time: new Date().toISOString() }
    const updates = {
      cqmDecision:    'completed',
      status:         STATUSES.COMPLETED,
      completionDate: isoDate,
      cqmSignature:   user?.name || user?.username,
      cqmDate:        displayDate,
      historyEntries: [...(form.historyEntries || []), entry],
    }
    setForm(updates)
    try { await saveToServer({ ...form, ...updates }) } catch (e) { console.error('[CQM] Save failed:', e) }
  }

  async function handleRevision() {
    const entry   = { type: 'action', icon: '↩', text: 'Revision requested', user: user?.username, time: new Date().toISOString() }
    const updates = { cqmDecision: 'revision', status: STATUSES.IN_PROGRESS, historyEntries: [...(form.historyEntries || []), entry] }
    setForm(updates)
    try { await saveToServer({ ...form, ...updates }) } catch (e) { console.error('[CQM] Save failed:', e) }
  }

  const isCompleted = form.cqmDecision === 'completed'

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-700 text-white px-4 py-3">
        <span className="text-sm font-bold">Corporate Quality Manager or Site Designee Sign-Off</span>
      </div>
      <div className="p-4 space-y-4">

        {/* Review Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Review Notes</label>
          <textarea value={form.cqmNotes || ''} onChange={e => setForm({ cqmNotes: e.target.value })}
            disabled={isCompleted} rows={4}
            placeholder="Enter review notes and observations..."
            className="w-full text-sm border border-gray-300 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans" />
        </div>

        {/* Revision reason */}
        {form.cqmDecision === 'revision' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Revision Reason</label>
            <textarea value={form.cqmRevision || ''} onChange={e => setForm({ cqmRevision: e.target.value })}
              rows={2} placeholder="Describe what needs to be revised..."
              className="w-full text-sm border border-orange-200 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50 font-sans" />
          </div>
        )}

        {/* Completion confirmation — stamped name + date */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 space-y-1">
            <p className="text-sm font-semibold text-green-800">✓ Project Completed</p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Signed off by:</span> {form.cqmSignature || '—'}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Date:</span> {form.cqmDate || '—'}
            </p>
          </div>
        )}

        {/* Action buttons — Corp QM, QA Manager, Admin only */}
        {!isCompleted && userCan(user, 'cqmSignOff') && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={handleComplete}
              className="text-sm bg-green-600 text-white font-semibold rounded px-4 py-2 hover:bg-green-700">
              ✓ Mark as Completed
            </button>
            <button onClick={handleRevision}
              className="text-sm border border-orange-400 text-orange-600 font-semibold rounded px-4 py-2 hover:bg-orange-50">
              ↩ Request Revision
            </button>
          </div>
        )}
        {!isCompleted && !userCan(user, 'cqmSignOff') && (
          <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-100">
            Awaiting QA / CQ Manager sign-off.
          </p>
        )}

      </div>
    </div>
  )
}
