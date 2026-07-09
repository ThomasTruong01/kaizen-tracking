// A3Form.jsx — A3 problem-solving report (single-column, 8 sections)

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { ImagePasteZone } from '../../shared/ImagePasteZone'
import { AddLineList } from '../../shared/AddLineList'
import RootCauseBlock from '../Plan/RootCauseBlock'

// Line list where each item has a text input + evidence image paste zone
function EvidenceLineList({ items, onChange, disabled, placeholder }) {
  const rows = items.length > 0 ? items : [{ text: '', images: [] }]

  function updText(i, val) {
    onChange(rows.map((r, idx) => idx === i ? { ...r, text: val } : r))
  }
  function updImages(i, val) {
    onChange(rows.map((r, idx) => idx === i ? { ...r, images: val } : r))
  }
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
            <input type="text" value={row.text}
              onChange={e => updText(i, e.target.value)}
              disabled={disabled}
              placeholder={i === 0 ? placeholder : ''}
              className="flex-1 text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
            {!disabled && (
              <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 text-xl leading-none flex-shrink-0" title="Remove">×</button>
            )}
          </div>
          <div className="ml-8">
            <ImagePasteZone
              images={row.images || []}
              onChange={v => updImages(i, v)}
              disabled={disabled} />
          </div>
        </div>
      ))}
      {!disabled && (
        <button onClick={add} className="text-sm font-semibold text-blue-600 hover:text-blue-800 ml-8">+ Add Line</button>
      )}
    </div>
  )
}

function A3Field({ label, children }) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
        <span className="text-sm font-bold text-gray-700">{label}</span>
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  )
}

// Two-column add-line list for section 5
function CountermeasureList({ rows, onChange, disabled }) {
  const items = rows.length > 0 ? rows : [{ countermeasure: '', impact: '' }]

  function upd(i, field, val) {
    const next = items.map((r, idx) => idx === i ? { ...r, [field]: val } : r)
    onChange(next)
  }
  function add() { onChange([...items, { countermeasure: '', impact: '' }]) }
  function remove(i) {
    if (items.length === 1) { onChange([{ countermeasure: '', impact: '' }]); return }
    onChange(items.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-1">
      {/* Column headers */}
      <div className="flex items-center gap-2">
        <span className="w-6 flex-shrink-0" />
        <span className="flex-1 text-xs font-semibold text-gray-500 px-2.5">Countermeasure</span>
        <span className="w-48 text-xs font-semibold text-gray-500 px-2.5 flex-shrink-0">Impact on Target</span>
        {!disabled && <span className="w-5 flex-shrink-0" />}
      </div>

      {items.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-400 w-6 text-right flex-shrink-0">{i + 1}.</span>
          <input type="text" value={row.countermeasure}
            onChange={e => upd(i, 'countermeasure', e.target.value)}
            disabled={disabled}
            placeholder={i === 0 ? 'e.g. Implement visual inspection checklist' : ''}
            className="flex-1 text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
          <input type="text" value={row.impact}
            onChange={e => upd(i, 'impact', e.target.value)}
            disabled={disabled}
            placeholder={i === 0 ? 'e.g. High' : ''}
            className="w-48 flex-shrink-0 text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
          {!disabled && (
            <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 text-xl leading-none flex-shrink-0 w-5" title="Remove">×</button>
          )}
        </div>
      ))}

      {!disabled && (
        <button onClick={add} className="text-sm font-semibold text-blue-600 hover:text-blue-800 mt-1">+ Add Line</button>
      )}
    </div>
  )
}

const TEXTAREA_KEYS = [
  {
    key: 'clarifyProblem',
    label: '1. Clarify the Problem',
    desc: 'Describe what is happening, where, when, and how often. Focus on the gap between the current condition and the expected standard — do not jump to causes or solutions yet.',
    placeholder: 'e.g. High adhesive defect rejection rate on Line 3 — ~4.2% over the last 30 days, mostly during shift 2. Expected standard is below 1%.',
  },
  {
    key: 'breakdownProblem',
    label: '2. Breakdown the Problem',
    desc: 'Narrow down to the most specific and actionable point. Use data, observation, or charts to find where the biggest impact is. Break a broad problem into smaller, focused sub-problems.',
    placeholder: 'e.g. Of all defect types, Tapes/Adhesives accounts for 68% of rejections. Within that, 80% occur at Station 4 during changeover. Focus: Station 4 changeover process.',
  },
  {
    key: 'monitorResults',
    label: '7. Monitor Results & Process',
    desc: 'Track whether the countermeasures are working. Use the same metric defined in Section 3. Compare against your target. If results are not improving, revisit the root cause analysis.',
    placeholder: 'e.g. After 4 weeks, defect rate on Line 3 dropped from 4.2% to 1.8%. Target not yet met — monitoring weekly. Identified secondary issue with operator training on Station 4.',
  },
  {
    key: 'standardize',
    label: '8. Standardize & Share Success',
    desc: 'If the target was achieved, update the standard (SOP, work instruction, or training). Identify where else this improvement can be applied and share the learnings with other teams or sites.',
    placeholder: 'e.g. Updated SOP QA-L3-004 to include changeover checklist. Training completed for all operators. Shared findings with MX site — similar improvement opportunity identified.',
  },
]

function TextareaSection({ label, desc, value, onChange, images, onImagesChange, disabled, placeholder }) {
  return (
    <A3Field label={label}>
      <p className="text-xs text-gray-500 italic">{desc}</p>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        disabled={disabled} rows={4} placeholder={placeholder}
        className="w-full text-sm border border-gray-200 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans placeholder:text-gray-400" />
      <ImagePasteZone images={images} onChange={onImagesChange} disabled={disabled} />
    </A3Field>
  )
}

export default function A3Form() {
  const { form, setForm } = useKaizenForm()
  const a3 = form.a3 || {}
  const locked = form.status === 'Completed' || form.status === 'Cancelled'

  function upd(field, val) {
    setForm(p => ({ ...p, a3: { ...p.a3, [field]: val } }))
  }

  const targetLines = a3.setTargetLines || [{ text: '', images: [] }]
  const implementLines = a3.implementLines || [{ text: '', images: [] }]
  const cmRows = a3.countermeasureRows || []

  return (
    <AccordionSection title="2. A3 Report" stage="a3" defaultOpen={true}>
      <div className="space-y-3">

        {/* 1. Clarify the Problem */}
        <TextareaSection {...TEXTAREA_KEYS[0]} value={a3.clarifyProblem || ''}
          onChange={v => upd('clarifyProblem', v)} images={a3.clarifyProblemImages || []}
          onImagesChange={v => upd('clarifyProblemImages', v)} disabled={locked} />

        {/* 2. Breakdown the Problem */}
        <TextareaSection {...TEXTAREA_KEYS[1]} value={a3.breakdownProblem || ''}
          onChange={v => upd('breakdownProblem', v)} images={a3.breakdownProblemImages || []}
          onImagesChange={v => upd('breakdownProblemImages', v)} disabled={locked} />

        {/* 3. Set the Target — line + evidence per row */}
        <A3Field label="3. Set the Target">
          <p className="text-xs text-gray-400 italic px-3 pt-1 pb-2">
            Based on the broken-down problem in Section 2, define a specific and measurable target.
            This may overlap with your project Objective but should be focused on the exact gap you identified —
            include the metric, current value, goal value, and deadline.
          </p>
          <EvidenceLineList
            items={targetLines}
            onChange={v => upd('setTargetLines', v)}
            disabled={locked}
            placeholder='e.g. Reduce Line 3 adhesive defect rate from 4.2% to below 1.0% by Dec 2026' />
        </A3Field>

        {/* 4. Analyze the Root Cause — reuses the same tools as PDCA Plan */}
        <A3Field label="4. Analyze the Root Cause">
          <RootCauseBlock />
        </A3Field>

        {/* 5. Develop Countermeasures / Priorities — 2-column AddLineList */}
        <A3Field label="5. Develop Countermeasures / Priorities">
          <CountermeasureList
            rows={cmRows}
            onChange={v => upd('countermeasureRows', v)}
            disabled={locked} />
        </A3Field>

        {/* 6. Implement Countermeasure — line + evidence per row */}
        <A3Field label="6. Implement Countermeasure">
          <EvidenceLineList
            items={implementLines}
            onChange={v => upd('implementLines', v)}
            disabled={locked}
            placeholder='e.g. Installed new inspection station at Line 3 — J. Smith, 2026-06-01' />
        </A3Field>

        {/* 7. Monitor Results & Process */}
        <TextareaSection {...TEXTAREA_KEYS[2]} value={a3.monitorResults || ''}
          onChange={v => upd('monitorResults', v)} images={a3.monitorResultsImages || []}
          onImagesChange={v => upd('monitorResultsImages', v)} disabled={locked} />

        {/* 8. Standardize & Share Success */}
        <TextareaSection {...TEXTAREA_KEYS[3]} value={a3.standardize || ''}
          onChange={v => upd('standardize', v)} images={a3.standardizeImages || []}
          onImagesChange={v => upd('standardizeImages', v)} disabled={locked} />

      </div>
    </AccordionSection>
  )
}
