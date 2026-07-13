// PDCASection.jsx — Single collapsible wrapper containing Plan, Do, Check, Act sub-sections

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import Plan  from '../Plan/Plan'
import Do    from '../Do/SolutionCard'
import Check from '../Check/KpiCard'
import Act   from '../Act'

export default function PDCASection() {
  const { form } = useKaizenForm()

  const allActs  = (form.solutions || []).flatMap(s => s.activities || [])
  const realActs = allActs.filter(a => a.what?.trim())
  const doneActs = realActs.filter(a => a.status === 'Completed')
  const doComplete = realActs.length > 0 && doneActs.length === realActs.length

  const complete = !!(form.planComplete && doComplete && form.checkComplete && form.actComplete)

  return (
    <AccordionSection title="2. PDCA" stage="pdca" defaultOpen={true} complete={complete}>
      <div className="space-y-3">
        <Plan />
        <Do />
        <Check />
        <Act />
      </div>
    </AccordionSection>
  )
}
