// Plan.jsx — Section 2: Plan (Key Measurements + Root Cause)

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { AddLineList } from '../../shared/AddLineList'
import RootCauseBlock from './RootCauseBlock'

export default function Plan() {
  const { form, setForm } = useKaizenForm()

  return (
    <AccordionSection title="Plan" stage="plan" defaultOpen={true}
      complete={form.planComplete} onToggleComplete={() => setForm({ planComplete: !form.planComplete })}>

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

    </AccordionSection>
  )
}
