// Plan.jsx — Section 2: Plan (Key Measurements + Root Cause)

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { AddLineList } from '../../shared/AddLineList'
import RootCauseBlock from './RootCauseBlock'

export default function Plan() {
  const { form, setForm } = useKaizenForm()

  return (
    <AccordionSection title="Plan" stage="plan" defaultOpen={true}>

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

      {/* Root Cause Analysis */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Main Root-Cause Analysis</h3>
        <RootCauseBlock />
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
