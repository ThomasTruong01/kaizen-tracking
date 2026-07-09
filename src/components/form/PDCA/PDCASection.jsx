// PDCASection.jsx — Single collapsible wrapper containing Plan, Do, Check, Act sub-sections

import { AccordionSection } from '../../shared/AccordionSection'
import Plan  from '../Plan/Plan'
import Do    from '../Do/SolutionCard'
import Check from '../Check/KpiCard'
import Act   from '../Act'

export default function PDCASection() {
  return (
    <AccordionSection title="2. PDCA" stage="pdca" defaultOpen={true}>
      <div className="space-y-3">
        <Plan />
        <Do />
        <Check />
        <Act />
      </div>
    </AccordionSection>
  )
}
