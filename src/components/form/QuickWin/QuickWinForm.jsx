// QuickWinForm.jsx — Section 2 for Quick Win projects (5-step form)

import { useState } from 'react'
import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { ImagePasteZone } from '../../shared/ImagePasteZone'
import { ACTIVITY_STATUSES } from '../../../lib/constants'

function SectionHint({ questions, tools }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 italic">{questions}</p>
      {tools?.length > 0 && (
        <ul className="text-xs text-gray-400 list-disc list-inside space-y-0.5">
          {tools.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </div>
  )
}

function QWField({ label, complete, onToggle, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`border rounded-md overflow-hidden ${complete ? 'border-green-300' : 'border-gray-200'}`}>
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b cursor-pointer select-none ${complete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
        onClick={() => setOpen(o => !o)}>
        <span className="text-sm text-gray-400">{open ? '▾' : '▸'}</span>
        <span className="text-sm font-bold text-gray-700 flex-1">{label}</span>
        {onToggle ? (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded px-2 py-1 transition-colors ${
              complete
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'border border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600'
            }`}>
            {complete ? '✓ Complete' : 'Mark Complete'}
          </button>
        ) : complete ? (
          <span className="text-xs font-semibold bg-green-600 text-white rounded px-2 py-1">✓ Complete</span>
        ) : null}
      </div>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  )
}

function TextareaSection({ label, questions, tools, placeholder, value, onChange, images, onImagesChange, disabled, complete, onToggle }) {
  return (
    <QWField label={label} complete={complete} onToggle={onToggle}>
      <SectionHint questions={questions} tools={tools} />
      <textarea value={value} onChange={e => onChange(e.target.value)}
        disabled={disabled} rows={4} placeholder={placeholder}
        className="w-full text-sm border border-gray-200 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans placeholder:text-gray-400" />
      <ImagePasteZone images={images} onChange={onImagesChange} disabled={disabled} />
    </QWField>
  )
}

function EvidenceLineList({ items, onChange, disabled, placeholder }) {
  const rows = items.length > 0 ? items : [{ text: '', images: [] }]
  function updText(i, val) { onChange(rows.map((r, idx) => idx === i ? { ...r, text: val } : r)) }
  function updImages(i, val) { onChange(rows.map((r, idx) => idx === i ? { ...r, images: val } : r)) }
  function add() { onChange([...rows, { text: '', images: [] }]) }
  function remove(i) {
    if (rows.length === 1) { onChange([{ text: '', images: [] }]); return }
    onChange(rows.filter((_, idx) => idx !== i))
  }
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-400 w-6 text-right flex-shrink-0">{i + 1}.</span>
            <input type="text" value={row.text} onChange={e => updText(i, e.target.value)}
              disabled={disabled} placeholder={i === 0 ? placeholder : ''}
              className="flex-1 text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
            {!disabled && (
              <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 text-xl leading-none flex-shrink-0">×</button>
            )}
          </div>
          <div className="ml-8">
            <ImagePasteZone images={row.images || []} onChange={v => updImages(i, v)} disabled={disabled} />
          </div>
        </div>
      ))}
      {!disabled && (
        <button onClick={add} className="text-sm font-semibold text-blue-600 hover:text-blue-800 ml-8">+ Add Line</button>
      )}
    </div>
  )
}

const EMPTY_ACTIVITY = { what: '', who: '', when: '', status: '', comments: '', evidence: [] }
const EMPTY_ACTION   = (id) => ({ id, title: '', activities: [{ ...EMPTY_ACTIVITY }] })

function ActionCard({ action, index, onChange, onRemove, disabled }) {
  function updActivity(i, val) {
    const acts = [...action.activities]; acts[i] = val
    onChange({ ...action, activities: acts })
  }
  function addActivity() {
    onChange({ ...action, activities: [...action.activities, { ...EMPTY_ACTIVITY }] })
  }
  function removeActivity(i) {
    if (action.activities.length === 1) return
    onChange({ ...action, activities: action.activities.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-3">
      <div className="bg-gray-100 border-b border-gray-200 flex items-center gap-2 px-3 py-2">
        <span className="text-xs font-bold text-gray-500 flex-shrink-0">Action {index + 1}:</span>
        <input type="text" value={action.title}
          onChange={e => onChange({ ...action, title: e.target.value })}
          disabled={disabled}
          placeholder="e.g. Install visual tape-end marker at Station 4"
          className="flex-1 text-sm font-semibold border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 text-gray-800 disabled:text-gray-500" />
        {!disabled && (
          <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0">Remove</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">What</th>
              <th className="w-36 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Who</th>
              <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">By When</th>
              <th className="w-28 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          {action.activities.map((act, i) => (
            <tbody key={i}>
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 w-8">
                  <button onClick={() => removeActivity(i)} disabled={action.activities.length === 1 || disabled}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-0 text-base leading-none">×</button>
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" value={act.what} onChange={e => updActivity(i, { ...act, what: e.target.value })}
                    disabled={disabled} placeholder="Describe what needs to be done..."
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50" />
                </td>
                <td className="px-2 py-1.5 w-36">
                  <input type="text" value={act.who} onChange={e => updActivity(i, { ...act, who: e.target.value })}
                    disabled={disabled} placeholder="Name"
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50" />
                </td>
                <td className="px-2 py-1.5 w-32">
                  <input type="date" value={act.when} onChange={e => updActivity(i, { ...act, when: e.target.value })}
                    disabled={disabled}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50" />
                </td>
                <td className="px-2 py-1.5 w-28">
                  <select value={act.status} onChange={e => updActivity(i, { ...act, status: e.target.value })}
                    disabled={disabled}
                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white disabled:bg-gray-50">
                    <option value="">—</option>
                    {ACTIVITY_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <td />
                <td colSpan={4} className="px-2 py-2 space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Comments</label>
                    <textarea value={act.comments} onChange={e => updActivity(i, { ...act, comments: e.target.value })}
                      disabled={disabled} rows={2} placeholder="Notes, blockers, updates..."
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-vertical focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Evidence</label>
                    <ImagePasteZone images={act.evidence || []} onChange={imgs => updActivity(i, { ...act, evidence: imgs })} disabled={disabled} />
                  </div>
                </td>
              </tr>
            </tbody>
          ))}
        </table>
      </div>
      {!disabled && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button onClick={addActivity} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Add Step</button>
        </div>
      )}
    </div>
  )
}

export default function QuickWinForm() {
  const { form, setForm } = useKaizenForm()
  const qw     = form.qw || {}
  const locked = form.status === 'Completed' || form.status === 'Cancelled'

  function upd(field, val) {
    setForm(p => ({ ...p, qw: { ...p.qw, [field]: val } }))
  }

  const standardizeLines = qw.standardizeLines || [{ text: '', images: [] }]
  const actions          = qw.actions          || [EMPTY_ACTION(1)]
  const sc               = qw.sectionComplete  || {}

  const allActs  = actions.flatMap(a => a.activities || [])
  const realActs = allActs.filter(a => a.what?.trim())
  const doneActs = realActs.filter(a => a.status === 'Completed')
  const actionsDone = realActs.length > 0 && doneActs.length === realActs.length

  function toggleSection(key) {
    upd('sectionComplete', { ...sc, [key]: !sc[key] })
  }
  function updAction(i, val) {
    const next = [...actions]; next[i] = val
    upd('actions', next)
  }
  function addAction() {
    const nextId = Math.max(...actions.map(a => a.id), 0) + 1
    upd('actions', [...actions, EMPTY_ACTION(nextId)])
  }
  function removeAction(i) {
    if (actions.length === 1) { upd('actions', [EMPTY_ACTION(1)]); return }
    upd('actions', actions.filter((_, idx) => idx !== i))
  }

  const qwComplete = !!(sc.s1 && sc.s2 && actionsDone && sc.s4 && sc.s5)

  return (
    <AccordionSection title="2. Quick Win" stage="quickwin" defaultOpen={true} complete={qwComplete}>
      <div className="space-y-3">

        {/* 1. Problem Statement */}
        <TextareaSection
          label="1. Problem Statement"
          questions="Why am I looking at this problem? What is the problem? Who is interested? What benefit does solving it have for the business? What is the size of the problem?"
          tools={[
            'Select the area/process — elect a leader and form the team (stakeholders)',
            'Train the team in the approach',
            'Identify all stakeholders',
            'Define the problem in terms of impact on the customer & stakeholders',
            'Conduct an Is/Is Not analysis',
            'Conduct a gemba walk and take photographs',
          ]}
          placeholder="e.g. Excessive tape splice errors on Line 5 — 3 per shift — causing downstream rework and a 2-hour daily delay."
          value={qw.problemStatement || ''}
          onChange={v => upd('problemStatement', v)}
          images={qw.problemStatementImages || []}
          onImagesChange={v => upd('problemStatementImages', v)}
          disabled={locked}
          complete={sc.s1}
          onToggle={() => toggleSection('s1')} />

        {/* 2. Before */}
        <TextareaSection
          label="2. Before"
          questions="What is the before condition? What data do I have? What are the component parts of this problem? How much will I address at this point?"
          tools={[
            'Describe the current condition/problem before the change has been implemented',
            'Take pictures',
            'Draft a summary map of the process or machine schematic (SIPOC, spaghetti map, process map, blueprint)',
            'Measure key features of the process problem (bar chart, line graph, run chart)',
          ]}
          placeholder="e.g. Tape roll changeover averages 18 min vs. 8 min standard. No visual cue for roll-end position. 80% of splice errors occur in the last 5m of the roll."
          value={qw.before || ''}
          onChange={v => upd('before', v)}
          images={qw.beforeImages || []}
          onImagesChange={v => upd('beforeImages', v)}
          disabled={locked}
          complete={sc.s2}
          onToggle={() => toggleSection('s2')} />

        {/* 3. Actions */}
        <QWField label="3. Actions" complete={actionsDone && realActs.length > 0}>
          <SectionHint
            questions="List all the actions needed to address the problem. For each action, add the steps required to complete it — who is responsible, by when, and the current status."
            tools={[
              'Brainstorming — identify and prioritize all possible actions',

              'Layout changes, visual workplace, error proofing',
              'Single-Minute Exchange of Die (SMED)',
              'FMEA',
            ]} />
          {actions.map((action, i) => (
            <ActionCard key={action.id} action={action} index={i}
              onChange={val => updAction(i, val)}
              onRemove={() => removeAction(i)}
              disabled={locked} />
          ))}
          {!locked && (
            <button onClick={addAction} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
              + Add Action
            </button>
          )}
          <div className={`flex items-center justify-between pt-3 border-t ${actionsDone && realActs.length > 0 ? 'border-green-200' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              {realActs.length > 0 ? (
                <>
                  <span className="text-xs text-gray-500">
                    Steps: <span className="font-semibold text-gray-700">{doneActs.length}/{realActs.length} completed</span>
                  </span>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((doneActs.length / realActs.length) * 100)}%` }} />
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Add steps above to track progress</span>
              )}
            </div>
            {actionsDone && realActs.length > 0 && (
              <span className="text-sm font-semibold text-green-700">✓ All steps complete</span>
            )}
          </div>
        </QWField>

        {/* 4. After */}
        <TextareaSection
          label="4. After"
          questions="Monitor progress and report findings to stakeholders. It may require more than one attempt. Describe the condition/result after the change has been implemented."
          tools={[
            'Describe the condition/result after the change has been implemented',
            'Take pictures',
            'Measure key features of the results (bar chart, line graph, run chart)',
            'Run chart, control chart, process capability analysis',
          ]}
          placeholder="e.g. After installing a visual tape-end marker, splice errors dropped from 3/shift to 0.4/shift over 4 weeks. Changeover now averages 9 min."
          value={qw.after || ''}
          onChange={v => upd('after', v)}
          images={qw.afterImages || []}
          onImagesChange={v => upd('afterImages', v)}
          disabled={locked}
          complete={sc.s4}
          onToggle={() => toggleSection('s4')} />

        {/* 5. Standardize & Share */}
        <QWField label="5. Standardize & Share" complete={sc.s5} onToggle={() => toggleSection('s5')}>
          <SectionHint
            questions="Document the new process and set as new standard. Share through horizontal deployment. Reflect and celebrate success."
            tools={[
              'Train personnel in the new way of doing things',
              'Standardize new processes — update procedures, implement visual management',
              'Use control charting to prove results and maintain discipline in the area',
              'Confirm the financial gains (if required)',
              'Recognize and reward the team',
            ]} />
          <EvidenceLineList
            items={standardizeLines}
            onChange={v => upd('standardizeLines', v)}
            disabled={locked}
            placeholder="e.g. Updated SOP QA-L5-007 with visual tape-end marker procedure. Training complete for all 3 shifts." />
        </QWField>

      </div>
    </AccordionSection>
  )
}
