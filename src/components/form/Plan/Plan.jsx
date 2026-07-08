// Plan.jsx — Section 2: Plan (Key Measurements + Root Cause)

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { AddLineList } from '../../shared/AddLineList'
import { ImagePasteZone } from '../../shared/ImagePasteZone'
import FiveWhy from './FiveWhy'
import { ROOT_CAUSE_TOOLS } from '../../../lib/constants'

function ToolSection({ toolId, label }) {
  const { form, setForm } = useKaizenForm()
  const selected = (form.rootCauseTools || []).includes(toolId)
  if (!selected) return null

  if (toolId === '5whys') return <FiveWhy />

  const imagesKey = `${toolId}Images`
  const notesKey  = `${toolId}Notes`
  const nameKey   = `${toolId}ToolName`

  return (
    <div className="border border-gray-200 rounded-md p-4 space-y-3">
      {toolId === 'other' && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tool Name</label>
          <input type="text" value={form[nameKey] || ''} onChange={e => setForm({ [nameKey]: e.target.value })}
            placeholder="Enter tool name..."
            className="text-sm border border-gray-300 rounded px-2.5 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label} — Attach diagram / chart</label>
        <ImagePasteZone images={form[imagesKey] || []} onChange={imgs => setForm({ [imagesKey]: imgs })} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
        <textarea value={form[notesKey] || ''} onChange={e => setForm({ [notesKey]: e.target.value })}
          rows={3} placeholder="Add notes or observations..."
          className="w-full text-sm border border-gray-300 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
      </div>
    </div>
  )
}

export default function Plan() {
  const { form, setForm } = useKaizenForm()

  function toggleTool(id) {
    const tools = form.rootCauseTools || []
    const next = tools.includes(id) ? tools.filter(t => t !== id) : [...tools, id]
    if (next.length === 0) return // must have at least one
    setForm({ rootCauseTools: next })
  }

  return (
    <AccordionSection title="2. Plan" stage="plan" defaultOpen={true}>

      {/* Key Measurements */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Key Measurements</h3>
        <p className="text-xs text-gray-400 mb-3">
          Each entry automatically generates a KPI tracking card in the Check section.
        </p>
        <AddLineList
          value={form.keyMeasurements}
          onChange={vals => setForm({ keyMeasurements: vals })}
          placeholder="e.g. Defect Tier 2: Tapes/Adhesives Rejection Rate (%)" />
      </div>

      {/* Root Cause Tool Selector */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Main Root-Cause Analysis</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {ROOT_CAUSE_TOOLS.map(tool => {
            const active = (form.rootCauseTools || []).includes(tool.id)
            return (
              <button key={tool.id} onClick={() => toggleTool(tool.id)}
                className={`text-sm px-3 py-1.5 rounded-full border font-semibold transition-colors
                  ${active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                {tool.label}
              </button>
            )
          })}
        </div>

        {/* Render each selected tool section */}
        <div className="space-y-4">
          {ROOT_CAUSE_TOOLS.map(tool => (
            <ToolSection key={tool.id} toolId={tool.id} label={tool.label} />
          ))}
        </div>
      </div>

      {/* Section completion */}
      <div className={`flex items-center justify-between pt-3 border-t ${form.planComplete ? 'border-green-200' : 'border-gray-100'}`}>
        {form.planComplete ? (
          <>
            <span className="text-sm font-semibold text-green-700">✓ Plan marked complete — 20%</span>
            <button onClick={() => setForm({ planComplete: false })}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Reopen
            </button>
          </>
        ) : (
          <button onClick={() => setForm({ planComplete: true })}
            className="text-sm bg-green-600 text-white font-semibold rounded px-4 py-2 hover:bg-green-700">
            ✓ Mark Plan Complete
          </button>
        )}
      </div>

    </AccordionSection>
  )
}
