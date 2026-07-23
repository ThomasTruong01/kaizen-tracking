// SolutionCard.jsx — Section 3: Do — Nested solution cards with activity tables

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { ImagePasteZone } from '../../shared/ImagePasteZone'
import { ACTIVITY_STATUSES } from '../../../lib/constants'

const EMPTY_ACTIVITY = { what: '', who: '', when: '', status: '', benefit: '', comments: '', evidence: [] }
const EMPTY_SOLUTION = (id) => ({ id, title: '', activities: [{ ...EMPTY_ACTIVITY }] })

function ActivityRow({ activity, index, onChange, onRemove, isLast }) {
  function upd(field, val) { onChange({ ...activity, [field]: val }) }
  return (
    <tbody>
      {/* Top row: What / Who / When / Status */}
      <tr className="border-b border-gray-100">
        <td className="px-2 py-1.5 w-8">
          <button onClick={onRemove} disabled={isLast}
            className="text-gray-300 hover:text-red-500 disabled:opacity-0 text-base leading-none">×</button>
        </td>
        <td className="px-2 py-1.5">
          <input type="text" value={activity.what} onChange={e => upd('what', e.target.value)}
            placeholder="Describe the activity..."
            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </td>
        <td className="px-2 py-1.5 w-36">
          <input type="text" value={activity.who} onChange={e => upd('who', e.target.value)}
            placeholder="First & Last Name"
            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </td>
        <td className="px-2 py-1.5 w-32">
          <input type="date" value={activity.when} onChange={e => upd('when', e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </td>
        <td className="px-2 py-1.5 w-28">
          <select value={activity.status} onChange={e => upd('status', e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
            <option value="">—</option>
            {ACTIVITY_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </td>
      </tr>
      {/* Detail row: Expected Benefit + Comments + Evidence */}
      <tr className="border-b border-gray-200 bg-gray-50/50">
        <td />
        <td colSpan={4} className="px-2 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Expected Benefit</label>
              <textarea value={activity.benefit} onChange={e => upd('benefit', e.target.value)}
                rows={2} placeholder="e.g. Improve from X to Y..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-vertical focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Comments</label>
              <textarea value={activity.comments} onChange={e => upd('comments', e.target.value)}
                rows={2} placeholder="Notes, blockers, updates..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-vertical focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans" />
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Evidence</label>
            <ImagePasteZone
              images={activity.evidence || []}
              onChange={imgs => upd('evidence', imgs)}
              label="📎 Paste or drag-drop evidence screenshot" />
          </div>
        </td>
      </tr>
    </tbody>
  )
}

function SolutionCard({ solution, index, onChange, onRemove }) {
  function updateTitle(val) { onChange({ ...solution, title: val }) }

  function addActivity() {
    onChange({ ...solution, activities: [...solution.activities, { ...EMPTY_ACTIVITY }] })
  }

  function updateActivity(i, val) {
    const acts = [...solution.activities]; acts[i] = val
    onChange({ ...solution, activities: acts })
  }

  function removeActivity(i) {
    if (solution.activities.length === 1) return
    onChange({ ...solution, activities: solution.activities.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
      {/* Solution header */}
      <div className="bg-gray-100 border-b border-gray-200 flex items-center gap-2 px-3 py-2">
        <span className="text-xs font-bold text-gray-500 flex-shrink-0">Solution {index + 1}:</span>
        <input type="text" value={solution.title} onChange={e => updateTitle(e.target.value)}
          placeholder="Enter solution title (e.g. Update training class)"
          className="flex-1 text-sm font-semibold border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 text-gray-800" />
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0">Remove</button>
      </div>

      {/* Activity table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-8 px-2 py-2"></th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">What</th>
              <th className="w-36 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Who</th>
              <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">When</th>
              <th className="w-28 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          {solution.activities.map((act, i) => (
            <ActivityRow key={i} activity={act} index={i}
              onChange={val => updateActivity(i, val)}
              onRemove={() => removeActivity(i)}
              isLast={solution.activities.length === 1} />
          ))}
        </table>
      </div>

      {/* Add activity */}
      <div className="px-4 py-2 border-t border-gray-100 bg-white">
        <button onClick={addActivity} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Add Activity</button>
      </div>
    </div>
  )
}

export default function Do() {
  const { form, setForm } = useKaizenForm()
  const solutions = form.solutions || [EMPTY_SOLUTION(1)]

  const allActs  = solutions.flatMap(s => s.activities || [])
  const realActs = allActs.filter(a => a.what?.trim())
  const doneActs = realActs.filter(a => a.status === 'Completed')
  const allDone  = realActs.length > 0 && doneActs.length === realActs.length

  function updateSolution(i, val) {
    const next = [...solutions]; next[i] = val
    setForm({ solutions: next })
  }

  function addSolution() {
    const nextId = Math.max(...solutions.map(s => s.id), 0) + 1
    setForm({ solutions: [...solutions, EMPTY_SOLUTION(nextId)] })
  }

  function removeSolution(i) {
    if (solutions.length === 1) {
      setForm({ solutions: [EMPTY_SOLUTION(1)] })
      return
    }
    setForm({ solutions: solutions.filter((_, idx) => idx !== i) })
  }

  return (
    <AccordionSection title="Do" stage="do" defaultOpen={true} complete={allDone}>
      <div>
        <p className="text-xs text-gray-400 mb-4">
          For each solution identified from root-cause analysis, create a Solution Card with its implementation activities.
        </p>
        {solutions.map((sol, i) => (
          <SolutionCard key={sol.id} solution={sol} index={i}
            onChange={val => updateSolution(i, val)}
            onRemove={() => removeSolution(i)} />
        ))}
        <button onClick={addSolution}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800">
          + Add Solution
        </button>
      </div>

      {/* Activity completion tracker */}
      <div className={`flex items-center justify-between pt-3 border-t ${allDone ? 'border-green-200' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          {realActs.length > 0 ? (
            <>
              <span className="text-xs text-gray-500">
                Activities: <span className="font-semibold text-gray-700">{doneActs.length}/{realActs.length} completed</span>
              </span>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((doneActs.length / realActs.length) * 100)}%` }} />
              </div>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">Add activities above to track Do progress</span>
          )}
        </div>
        {allDone && (
          <span className="text-sm font-semibold text-green-700">✓ All activities complete — 20%</span>
        )}
      </div>

    </AccordionSection>
  )
}
