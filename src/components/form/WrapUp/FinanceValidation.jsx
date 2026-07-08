// FinanceValidation.jsx — QA.P02.W04.F05 Rev. B Finance Validation block

import { useState } from 'react'
import { useKaizenForm } from '../../../context/KaizenFormContext'
import { useAuth } from '../../../context/AuthContext'
import { userCan } from '../../../lib/constants'
import { ImagePasteZone } from '../../shared/ImagePasteZone'
import { sendFinanceForApproval } from '../../../lib/api'

const STATUS_COLORS = {
  'Not Started':            'bg-gray-100 text-gray-500',
  'In Progress':            'bg-orange-100 text-orange-600',
  'Pending Dept. Manager':  'bg-blue-100 text-blue-700',
  'Pending Finance Review': 'bg-purple-100 text-purple-600',
  'Approved':               'bg-green-100 text-green-700',
  'Rejected':               'bg-red-100 text-red-700',
}

function FVField({ q, label, children }) {
  return (
    <div className="border border-gray-100 rounded-md overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-600">{q}.</span>
        <span className="text-sm text-gray-700 ml-1.5">{label}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

export default function FinanceValidation() {
  const { form, setForm, logAction, serverProjectId } = useKaizenForm()
  const { user } = useAuth()
  const [open,          setOpen]         = useState(true)
  const [approving,     setApproving]    = useState(false)
  const [approveError,  setApproveError] = useState('')
  const fv     = form.fv || {}
  const status = form.financeStatus || 'Not Started'
  const locked = ['Pending Dept. Manager', 'Pending Finance Review', 'Approved'].includes(status)

  function upd(field, val) {
    const isFirstInput = status === 'Not Started'
    setForm(p => ({
      ...p,
      fv: { ...p.fv, [field]: val },
      financeStatus: isFirstInput ? 'In Progress' : p.financeStatus,
    }))
  }

  function updImg(field, val) {
    setForm(p => ({ ...p, fv: { ...p.fv, [field]: val } }))
    if (status === 'Not Started') setForm(p => ({ ...p, financeStatus: 'In Progress' }))
  }

  function handleSaveDraft() {
    setForm({ financeStatus: 'In Progress' })
    logAction('💾', 'Finance Validation draft saved', user?.username)
  }

  function handleSendToDeptManager() {
    setForm({ financeStatus: 'Pending Dept. Manager' })
    logAction('📤', 'Finance Validation sent for Dept. Manager review', user?.username)
  }

  async function handleDeptManagerApprove() {
    setApproving(true)
    setApproveError('')
    try {
      await sendFinanceForApproval(serverProjectId)
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      setForm(p => ({
        ...p,
        financeStatus: 'Pending Finance Review',
        status: 'Pending Finance',
        fv: {
          ...p.fv,
          deptManagerSig:  user?.name || user?.username,
          deptManagerDate: today,
        },
      }))
      logAction('✅', 'Finance Validation approved by Dept. Manager — forwarded to Finance', user?.username)
    } catch (e) {
      setApproveError(e.message || 'Could not submit. Please try again.')
    } finally {
      setApproving(false)
    }
  }

  function handleFinanceDecision(decision) {
    const nextStatus = decision === 'approve' ? 'Approved' : 'Rejected'
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    setForm(p => ({
      ...p,
      financeStatus: nextStatus,
      fv: {
        ...p.fv,
        financeDecision:  decision,
        financeRepSig:    user?.name || user?.username,
        financeRepDate:   today,
      },
      status: decision === 'approve' ? 'Pending CQM' : 'In Progress',
    }))
    logAction(
      decision === 'approve' ? '✅' : '❌',
      `Finance Validation ${decision === 'approve' ? 'approved' : 'rejected'} by Finance Rep`,
      user?.username,
    )
  }

  const textarea = (field, placeholder, rows = 3) => (
    <textarea value={fv[field] || ''} onChange={e => upd(field, e.target.value)}
      disabled={locked} rows={rows} placeholder={placeholder}
      className="w-full text-sm border border-gray-300 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans" />
  )

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Collapsible header */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 text-left hover:bg-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-800">Finance Validation (QA.P02.W04.F05 Rev. B)</span>
          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
            {status}
          </span>
        </div>
        <span className={`text-gray-400 text-sm transition-transform ${open ? '' : '-rotate-90'}`}>▾</span>
      </button>

      {open && (
        <div className="p-4 space-y-4">

          {/* Header — auto-filled from Project Information where possible */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500">Team Leader / Owner</p>
              <p className="text-sm text-gray-800 mt-0.5">{form.teamLeader || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Project Code — Title</p>
              <p className="text-sm text-gray-800 mt-0.5">
                {[form.projectCode, form.projectTitle].filter(Boolean).join(' — ') || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Dept. Manager</p>
              <p className="text-sm text-gray-800 mt-0.5">{form.deptManager || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Corp. Quality Manager / Site Designee</p>
              <p className="text-sm text-gray-800 mt-0.5">{form.cqManager || '—'}</p>
            </div>
          </div>

          {/* Q1–Q9 */}
          <FVField q="1" label="Risk Assessment">{textarea('q1', 'Describe the risks associated with this project...')}</FVField>
          <FVField q="2" label="Resources Used">{textarea('q2', 'List resources utilized (people, equipment, materials)...')}</FVField>
          <FVField q="3" label="Cost of Utilized Resources">
            {textarea('q3', 'Describe the cost of resources used...')}
            <div className="mt-2"><ImagePasteZone images={fv.q3Images || []} onChange={v => updImg('q3Images', v)} disabled={locked} /></div>
          </FVField>
          <FVField q="4" label="Quantifiable Project Benefits">
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">(a) Hard Savings (tangible)</label>
                {textarea('q4a', 'Describe tangible, measurable cost savings...', 2)}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">(b) Soft Savings (intangible)</label>
                {textarea('q4b', 'Describe intangible benefits (quality, morale, risk reduction)...', 2)}
              </div>
            </div>
          </FVField>
          <FVField q="5" label="Was the original root-cause addressed and resolved?">
            {textarea('q5', 'Explain how the root cause was addressed...')}
            <div className="mt-2"><ImagePasteZone images={fv.q5Images || []} onChange={v => updImg('q5Images', v)} disabled={locked} /></div>
          </FVField>
          <FVField q="6" label="How do we ensure process sustainability of the financial benefit?">
            {textarea('q6', 'Describe controls, audits, or procedures to sustain the benefit...')}
            <div className="mt-2"><ImagePasteZone images={fv.q6Images || []} onChange={v => updImg('q6Images', v)} disabled={locked} /></div>
          </FVField>
          <FVField q="7" label="Project Bottom-Line Impact Evaluation">{textarea('q7', 'Summarize the overall financial and operational impact...')}</FVField>
          <FVField q="8" label="Estimation of Money Saved Per Year">
            {textarea('q8', 'e.g. $45,000/year based on reduced rework hours × average labor cost...')}
            <div className="mt-2"><ImagePasteZone images={fv.q8Images || []} onChange={v => updImg('q8Images', v)} disabled={locked} /></div>
          </FVField>
          <FVField q="9" label="Approval/Validation of Actual Benefit Claimed After Launching">
            {textarea('q9', 'Post-launch validation of the claimed financial benefit...')}
          </FVField>

          {/* Save Draft / Send for Dept. Manager Review */}
          {!locked && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button onClick={handleSaveDraft}
                className="text-sm border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-50 font-medium text-gray-700">
                💾 Save Draft
              </button>
              <button onClick={handleSendToDeptManager}
                className="text-sm bg-blue-600 text-white font-semibold rounded px-4 py-2 hover:bg-blue-700">
                📤 Send for Dept. Manager Review
              </button>
            </div>
          )}

          {/* ── Stage 1: Dept. Manager Review ─────────────────────── */}
          {['Pending Dept. Manager', 'Pending Finance Review', 'Approved', 'Rejected'].includes(status) && (
            <div className="border border-blue-200 bg-blue-50 rounded-md p-4 space-y-3">
              <h4 className="text-sm font-bold text-blue-800">Dept. Manager Review</h4>

              {status === 'Pending Dept. Manager' && !userCan(user, 'approve') && (
                <p className="text-xs text-gray-500 italic">Awaiting Dept. Manager review and signature.</p>
              )}

              {status === 'Pending Dept. Manager' && userCan(user, 'approve') && (
                <>
                  {approveError && <p className="text-xs text-red-600">{approveError}</p>}
                  <button onClick={handleDeptManagerApprove} disabled={approving}
                    className="text-sm bg-blue-700 text-white font-semibold rounded px-4 py-2 hover:bg-blue-800 disabled:opacity-50">
                    {approving ? 'Submitting…' : '✓ Approve — Send to Finance'}
                  </button>
                </>
              )}

              {/* Read-only after dept manager approved */}
              {['Pending Finance Review', 'Approved', 'Rejected'].includes(status) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Dept. Manager Signature</p>
                    <p className="text-sm text-gray-800 mt-0.5">{fv.deptManagerSig || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Date</p>
                    <p className="text-sm text-gray-800 mt-0.5">{fv.deptManagerDate || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Stage 2: Finance Representative Sign-Off ───────────── */}
          {['Pending Finance Review', 'Approved', 'Rejected'].includes(status) && (
            <div className="border border-purple-200 bg-purple-50 rounded-md p-4 space-y-3">
              <h4 className="text-sm font-bold text-purple-800">Finance Representative Sign-Off</h4>

              {status === 'Pending Finance Review' && !userCan(user, 'setFinance') && (
                <p className="text-xs text-gray-500 italic">Awaiting Finance Representative review.</p>
              )}

              {status === 'Pending Finance Review' && userCan(user, 'setFinance') && (
                <>
                  <div className="flex items-center gap-4">
                    {['approve', 'reject'].map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="financeDecision" value={d}
                          checked={fv.financeDecision === d}
                          onChange={() => setForm(p => ({ ...p, fv: { ...p.fv, financeDecision: d } }))} />
                        <span className={`text-sm font-semibold capitalize ${d === 'approve' ? 'text-green-700' : 'text-red-700'}`}>{d}</span>
                      </label>
                    ))}
                  </div>
                  {fv.financeDecision === 'reject' && (
                    <textarea value={fv.rejectionReason || ''} onChange={e => setForm(p => ({ ...p, fv: { ...p.fv, rejectionReason: e.target.value } }))}
                      rows={2} placeholder="Reason for rejection..."
                      className="w-full text-sm border border-red-200 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-red-400 font-sans" />
                  )}
                  <button onClick={() => handleFinanceDecision(fv.financeDecision)}
                    disabled={!fv.financeDecision}
                    className="text-sm bg-purple-700 text-white font-semibold rounded px-4 py-2 hover:bg-purple-800 disabled:opacity-40">
                    Submit Decision
                  </button>
                </>
              )}

              {status === 'Approved' && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-green-700">✓ Finance Validation Approved</p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Approved by:</span> {fv.financeRepSig || '—'}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Date:</span> {fv.financeRepDate || '—'}
                  </p>
                </div>
              )}
              {status === 'Rejected' && <p className="text-sm font-semibold text-red-700">✗ Rejected — {fv.rejectionReason}</p>}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
