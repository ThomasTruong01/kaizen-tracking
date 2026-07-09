// A3Form.jsx — A3 problem-solving report (single-column, 8 sections)

import { useState } from 'react'
import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { ImagePasteZone } from '../../shared/ImagePasteZone'
import RootCauseBlock from '../Plan/RootCauseBlock'
import { ACTIVITY_STATUSES } from '../../../lib/constants'

// Guiding questions + suggested tools shown above each section's input
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

function A3Field({ label, complete, onToggle, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`border rounded-md overflow-hidden ${complete ? 'border-green-300' : 'border-gray-200'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 border-b cursor-pointer select-none ${complete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
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


// Line list where each item has a text input + evidence image paste zone (used by section 3)
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
              <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 text-xl leading-none flex-shrink-0" title="Remove">×</button>
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

const EMPTY_ACTIVITY  = { what: '', who: '', when: '', status: '', comments: '', evidence: [] }
const EMPTY_CM = (id) => ({ id, title: '', impact: '', activities: [{ ...EMPTY_ACTIVITY }] })

// Section 5 — define each countermeasure (title + impact on target)
function CountermeasureCard({ cm, index, onChange, onRemove, disabled }) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-200 flex items-center gap-2 px-3 py-2">
        <span className="text-xs font-bold text-gray-500 flex-shrink-0">CM {index + 1}:</span>
        <input type="text" value={cm.title}
          onChange={e => onChange({ ...cm, title: e.target.value })}
          disabled={disabled}
          placeholder="Describe the countermeasure..."
          className="flex-1 text-sm font-semibold border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 text-gray-800 disabled:text-gray-500" />
        {!disabled && (
          <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0">Remove</button>
        )}
      </div>
      <div className="px-3 py-2">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Impact on Target</label>
        <input type="text" value={cm.impact}
          onChange={e => onChange({ ...cm, impact: e.target.value })}
          disabled={disabled}
          placeholder="e.g. High — directly addresses root cause at Station 4"
          className="w-full text-sm border border-gray-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50" />
      </div>
    </div>
  )
}

// Section 6 — implementation activities per countermeasure (mirrors Do/SolutionCard)
function ImplementCard({ cm, index, onChange, disabled }) {
  function updActivity(i, val) {
    const acts = [...cm.activities]; acts[i] = val
    onChange({ ...cm, activities: acts })
  }
  function addActivity() {
    onChange({ ...cm, activities: [...cm.activities, { ...EMPTY_ACTIVITY }] })
  }
  function removeActivity(i) {
    if (cm.activities.length === 1) return
    onChange({ ...cm, activities: cm.activities.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-3">
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2">
        <span className="text-xs font-bold text-gray-500">CM {index + 1}: </span>
        <span className="text-sm font-semibold text-gray-800">{cm.title || <span className="italic text-gray-400">Untitled countermeasure</span>}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">What</th>
              <th className="w-36 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Who</th>
              <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Date</th>
              <th className="w-28 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          {cm.activities.map((act, i) => (
            <tbody key={i}>
              <tr className="border-b border-gray-100">
                <td className="px-2 py-1.5 w-8">
                  <button onClick={() => removeActivity(i)} disabled={cm.activities.length === 1 || disabled}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-0 text-base leading-none">×</button>
                </td>
                <td className="px-2 py-1.5">
                  <input type="text" value={act.what} onChange={e => updActivity(i, { ...act, what: e.target.value })}
                    disabled={disabled} placeholder="Describe the implementation step..."
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
                <td colSpan={4} className="px-2 py-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Comments</label>
                    <textarea value={act.comments} onChange={e => updActivity(i, { ...act, comments: e.target.value })}
                      disabled={disabled} rows={2} placeholder="Notes, blockers, updates..."
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-vertical focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans disabled:bg-gray-50" />
                  </div>
                  <div className="mt-2">
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
          <button onClick={addActivity} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">+ Add Activity</button>
        </div>
      )}
    </div>
  )
}

function TextareaSection({ label, questions, tools, placeholder, value, onChange, images, onImagesChange, disabled, complete, onToggle }) {
  return (
    <A3Field label={label} complete={complete} onToggle={onToggle}>
      <SectionHint questions={questions} tools={tools} />
      <textarea value={value} onChange={e => onChange(e.target.value)}
        disabled={disabled} rows={4} placeholder={placeholder}
        className="w-full text-sm border border-gray-200 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans placeholder:text-gray-400" />
      <ImagePasteZone images={images} onChange={onImagesChange} disabled={disabled} />
    </A3Field>
  )
}

const SECTIONS = {
  clarifyProblem: {
    label: '1. Clarify the Problem',
    questions: 'Why am I looking at this problem? What is the problem? Who is interested in the problem? What benefit does solving it have? How does it help address the goals of the business?',
    tools: [
      'Select the area/process — elect a leader and form the team (stakeholders)',
      'Train the team in the 8-step approach',
      'Identify all stakeholders',
      'Define the problem in terms of impact on the customer & stakeholders',
      'Conduct an Is/Is Not analysis',
      'Conduct a gemba walk and take photographs',
    ],
    placeholder: 'e.g. High adhesive defect rejection rate on Line 3 — ~4.2% over the last 30 days, mostly during shift 2. Expected standard is below 1%.',
  },
  breakdownProblem: {
    label: '2. Breakdown the Problem',
    questions: 'What is the size of the problem? What data do I have? What are the component parts? How much will I address at this point?',
    tools: [
      'Draft a summary map of the process or machine schematic (SIPOC, spaghetti map, process map, blueprint)',
      'Measure key features of the process problem (bar chart, line graph, run chart)',
    ],
    placeholder: 'e.g. Of all defect types, Tapes/Adhesives accounts for 68% of rejections. Within that, 80% occur at Station 4 during changeover. Focus: Station 4 changeover process.',
  },
  monitorResults: {
    label: '7. Monitor Results & Process',
    questions: 'Monitor progress and report findings to stakeholders. It may require more than one attempt to get the desired result. Mistakes are an important part of the learning process.',
    tools: [
      'Run chart',
      'Control chart',
      'Process capability analysis',
      'Conduct post-implementation review — snag list & action items',
    ],
    placeholder: 'e.g. After 4 weeks, defect rate on Line 3 dropped from 4.2% to 1.8%. Target not yet met — monitoring weekly. Identified secondary issue with operator training at Station 4.',
  },
  standardize: {
    label: '8. Standardize & Share Success',
    questions: 'Document the new process and set as the new standard. Share through horizontal deployment. Reflect and celebrate success.',
    tools: [
      'Train personnel in the new way of doing things',
      'Standardize new processes, update procedures, implement visual management',
      'Use control charting to prove results and maintain discipline in the area',
      'Confirm the financial gains (if required)',
      'Present to senior management — recognize and reward the team',
      'Reflect on lessons learned. Start the next improvement!',
    ],
    placeholder: 'e.g. Updated SOP QA-L3-004 to include changeover checklist. Training completed for all operators. Shared findings with MX site — similar improvement opportunity identified.',
  },
}

export default function A3Form() {
  const { form, setForm } = useKaizenForm()
  const a3 = form.a3 || {}
  const locked = form.status === 'Completed' || form.status === 'Cancelled'

  function upd(field, val) {
    setForm(p => ({ ...p, a3: { ...p.a3, [field]: val } }))
  }

  const targetLines        = a3.setTargetLines     || [{ text: '', images: [] }]
  const monitorResultLines = a3.monitorResultLines  || [{ text: '', images: [] }]
  const standardizeLines   = a3.standardizeLines    || [{ text: '', images: [] }]
  const countermeasures    = a3.countermeasures     || [EMPTY_CM(1)]
  const sc                 = a3.sectionComplete     || {}

  const allCMActivities  = countermeasures.flatMap(cm => cm.activities || [])
  const realCMActivities = allCMActivities.filter(a => a.what?.trim())
  const doneCMActivities = realCMActivities.filter(a => a.status === 'Completed')
  const allCMDone        = realCMActivities.length > 0 && doneCMActivities.length === realCMActivities.length

  function toggleSection(key) {
    upd('sectionComplete', { ...sc, [key]: !sc[key] })
  }

  function updCM(i, val) {
    const next = [...countermeasures]; next[i] = val
    upd('countermeasures', next)
  }
  function addCM() {
    const nextId = Math.max(...countermeasures.map(c => c.id), 0) + 1
    upd('countermeasures', [...countermeasures, EMPTY_CM(nextId)])
  }
  function removeCM(i) {
    if (countermeasures.length === 1) { upd('countermeasures', [EMPTY_CM(1)]); return }
    upd('countermeasures', countermeasures.filter((_, idx) => idx !== i))
  }

  return (
    <AccordionSection title="2. A3 Report" stage="a3" defaultOpen={true}>
      <div className="space-y-3">

        {/* 1. Clarify the Problem */}
        <TextareaSection {...SECTIONS.clarifyProblem}
          complete={sc.s1} onToggle={() => toggleSection('s1')}
          value={a3.clarifyProblem || ''} onChange={v => upd('clarifyProblem', v)}
          images={a3.clarifyProblemImages || []} onImagesChange={v => upd('clarifyProblemImages', v)}
          disabled={locked} />

        {/* 2. Breakdown the Problem */}
        <TextareaSection {...SECTIONS.breakdownProblem}
          complete={sc.s2} onToggle={() => toggleSection('s2')}
          value={a3.breakdownProblem || ''} onChange={v => upd('breakdownProblem', v)}
          images={a3.breakdownProblemImages || []} onImagesChange={v => upd('breakdownProblemImages', v)}
          disabled={locked} />

        {/* 3. Set the Target */}
        <A3Field label="3. Set the Target" complete={sc.s3} onToggle={() => toggleSection('s3')}>
          <SectionHint
            questions="What outcome do I want? Visualize the desired results. Using the data, set a measurable and realistic goal."
            tools={[
              'Goal format: Action verb + object + from "current state" to "future state" by "date"',
              'Draft an outline project plan with timelines & responsibilities (e.g. Gantt chart)',
              'Develop draft financial gains and get finance approval if appropriate',
            ]} />
          <EvidenceLineList
            items={targetLines}
            onChange={v => upd('setTargetLines', v)}
            disabled={locked}
            placeholder='e.g. Decrease defect rate on Line 3 from 4.2% to below 1.0% by December 2026' />
        </A3Field>

        {/* 4. Analyze the Root Cause */}
        <A3Field label="4. Analyze the Root Cause" complete={sc.s4} onToggle={() => toggleSection('s4')}>
          <SectionHint
            questions="Clarify the root cause. Consider as many potential cause factors as possible. Identify areas for improvement."
            tools={[
              'Interviews', 'Pareto charts', 'Data stratification', '5 Whys',
              'Cause and effect analysis (fishbone)', 'Process capability analysis',
              'Scatter diagrams', 'Box plots', 'Regression & correlation', 'FMEA',
            ]} />
          <RootCauseBlock />
        </A3Field>

        {/* 5. Develop Countermeasures / Priorities */}
        <A3Field label="5. Develop Countermeasures / Priorities" complete={sc.s5} onToggle={() => toggleSection('s5')}>
          <SectionHint
            questions="List as many potential countermeasures as possible. Identify an effective countermeasure that directly addresses the root cause. Prioritize issues. Identify and make ready all tools and equipment for change in advance."
            tools={['Brainstorming', 'Priority list', 'Gantt chart', 'Pilot timetable']} />
          <div className="space-y-2">
            {countermeasures.map((cm, i) => (
              <CountermeasureCard key={cm.id} cm={cm} index={i}
                onChange={val => updCM(i, val)}
                onRemove={() => removeCM(i)}
                disabled={locked} />
            ))}
            {!locked && (
              <button onClick={addCM} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                + Add Countermeasure
              </button>
            )}
          </div>
        </A3Field>

        {/* 6. Implement Countermeasure — progress auto-computed from activity completion */}
        <A3Field label="6. Implement Countermeasure" complete={allCMDone && realCMActivities.length > 0}>
          <SectionHint
            questions="Select the most practical and effective countermeasure(s). Create a clear and detailed action plan. Implement quickly."
            tools={[
              'Gantt chart — tasks and timelines',
              'Detailed timetable of events',
              'Layout changes',
              'SMED (Single-Minute Exchange of Die)',
              'Visual workplace',
              'Error proofing',
              'FMEA',
            ]} />
          {countermeasures.map((cm, i) => (
            <ImplementCard key={cm.id} cm={cm} index={i}
              onChange={val => updCM(i, val)}
              disabled={locked} />
          ))}

          {/* Activity completion tracker */}
          <div className={`flex items-center justify-between pt-3 border-t ${allCMDone ? 'border-green-200' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              {realCMActivities.length > 0 ? (
                <>
                  <span className="text-xs text-gray-500">
                    Activities: <span className="font-semibold text-gray-700">{doneCMActivities.length}/{realCMActivities.length} completed</span>
                  </span>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((doneCMActivities.length / realCMActivities.length) * 100)}%` }} />
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Add activities above to track implementation progress</span>
              )}
            </div>
            {allCMDone && (
              <span className="text-sm font-semibold text-green-700">✓ All activities complete</span>
            )}
          </div>
        </A3Field>

        {/* 7. Monitor Results & Process */}
        <A3Field label={SECTIONS.monitorResults.label} complete={sc.s7} onToggle={() => toggleSection('s7')}>
          <SectionHint questions={SECTIONS.monitorResults.questions} tools={SECTIONS.monitorResults.tools} />
          <EvidenceLineList
            items={monitorResultLines}
            onChange={v => upd('monitorResultLines', v)}
            disabled={locked}
            placeholder={SECTIONS.monitorResults.placeholder} />
        </A3Field>

        {/* 8. Standardize & Share Success */}
        <A3Field label={SECTIONS.standardize.label} complete={sc.s8} onToggle={() => toggleSection('s8')}>
          <SectionHint questions={SECTIONS.standardize.questions} tools={SECTIONS.standardize.tools} />
          <EvidenceLineList
            items={standardizeLines}
            onChange={v => upd('standardizeLines', v)}
            disabled={locked}
            placeholder={SECTIONS.standardize.placeholder} />
        </A3Field>

      </div>
    </AccordionSection>
  )
}
