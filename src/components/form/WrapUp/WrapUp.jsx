// WrapUp.jsx — Section 6: Wrap-Up / Closure

import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { AddLineList } from '../../shared/AddLineList'
import FinanceValidation from './FinanceValidation'
import CqmSignOff from './CqmSignOff'

export default function WrapUp() {
  const { form, setForm } = useKaizenForm()

  const financeResolved = form.financeApplicable === false || form.financeStatus === 'Approved'
  const wrapupComplete  = !!(form.wrapupBasicComplete && financeResolved && form.cqmDecision === 'completed')

  return (
    <AccordionSection title="3. Wrap-Up / Closure" stage="wrapup" defaultOpen={true} complete={wrapupComplete}>

      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Suggestions for Solutions Extension</h3>
        <p className="text-xs text-gray-400 mb-3">Consider expanding this solution to other sites or operation lines.</p>
        <AddLineList value={form.solutionsExtension}
          onChange={v => setForm({ solutionsExtension: v })}
          placeholder="e.g. Apply updated taping process to MX facility..." />
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Lessons Learned (+ and −)</h3>
        <p className="text-xs text-gray-400 mb-3">Capture positive and negative lessons from this project.</p>
        <AddLineList value={form.lessonsLearned}
          onChange={v => setForm({ lessonsLearned: v })}
          placeholder="e.g. Early cross-functional alignment shortened root cause analysis by 2 weeks..." />
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Problems Remaining and Future Projects</h3>
        <p className="text-xs text-gray-400 mb-3">Document issues not fully resolved that can become opportunities for future Kaizen projects.</p>
        <AddLineList value={form.problemsRemaining}
          onChange={v => setForm({ problemsRemaining: v })}
          placeholder="e.g. Crimp defects in Cable Assy — investigate for next Kaizen cycle..." />
      </div>

      {/* Wrap-Up basics completion */}
      <div className={`flex items-center justify-between pt-3 border-t ${form.wrapupBasicComplete ? 'border-green-200' : 'border-gray-100'}`}>
        {form.wrapupBasicComplete ? (
          <>
            <span className="text-sm font-semibold text-green-700">✓ Wrap-Up marked complete — 5%</span>
            <button onClick={() => setForm({ wrapupBasicComplete: false, financeApplicable: null })}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Reopen
            </button>
          </>
        ) : (
          <button onClick={() => setForm({ wrapupBasicComplete: true })}
            className="text-sm bg-green-600 text-white font-semibold rounded px-4 py-2 hover:bg-green-700">
            ✓ Mark Wrap-Up Complete
          </button>
        )}
      </div>

      {/* Finance Validation decision point */}
      {form.wrapupBasicComplete && form.financeApplicable === null && (
        <div className="border border-blue-200 bg-blue-50 rounded-md p-4 space-y-3">
          <p className="text-sm font-semibold text-blue-800">Is Finance Validation applicable for this project?</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm({ financeApplicable: true })}
              className="text-sm bg-blue-600 text-white font-semibold rounded px-5 py-2 hover:bg-blue-700">
              Yes — Continue to Finance Validation
            </button>
            <button onClick={() => setForm({ financeApplicable: false })}
              className="text-sm border border-gray-300 bg-white text-gray-700 font-semibold rounded px-5 py-2 hover:bg-gray-50">
              No — Skip to CQ Manager Sign-Off
            </button>
          </div>
        </div>
      )}

      {/* Finance Validation — only when applicable */}
      {form.wrapupBasicComplete && form.financeApplicable === true && <FinanceValidation />}

      {/* CQM Sign-Off — shown after Finance approved, or when Finance is not applicable */}
      {form.wrapupBasicComplete && (
        (form.financeApplicable === true && form.financeStatus === 'Approved') ||
        form.financeApplicable === false
      ) && <CqmSignOff />}

    </AccordionSection>
  )
}
