// ProjectInfo.jsx — Section 1: Project Information

import { useState, useEffect } from 'react'
import { useKaizenForm } from '../../context/KaizenFormContext'
import { useAuth } from '../../context/AuthContext'
import { AccordionSection } from '../shared/AccordionSection'
import { SITES, DEPARTMENTS, PROJECT_TYPES, PRIORITIES, userCan } from '../../lib/constants'
import { generateProjectCode } from '../../lib/utils'
import { cancelProject, fetchNextSeq } from '../../lib/api'
import BaselineEntries from './BaselineEntries'
import { EmployeeSearch } from '../shared/EmployeeSearch'


function Field({ label, required, children, hint }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 items-start">
      <label className="text-sm font-semibold text-gray-700 text-right pt-2 leading-tight">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <div>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    </div>
  )
}

function ChipPicker({ options, selected, onToggle, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => !disabled && onToggle(opt)} disabled={disabled}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors
            ${selected.includes(opt)
              ? 'bg-red-700 text-white border-red-700'
              : 'bg-white border-gray-300 text-gray-600 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Type-switch clear payloads ────────────────────────────────────────────────

const EMPTY_FV = { leader: '', manager: '', codeTitle: '', cqm: '', q1: '', q2: '', q3: '', q3Images: [], q4a: '', q4b: '', q5: '', q5Images: [], q6: '', q6Images: [], q7: '', q8: '', q8Images: [], q9: '', financeDecision: null, rejectionReason: '', deptManagerSig: '', deptManagerDate: '', financeRepSig: '', financeRepDate: '' }
const EMPTY_SOLUTION = { id: 1, title: '', activities: [{ what: '', who: '', when: '', status: '', benefit: '', comments: '' }] }
const EMPTY_WHY = { problem: '', whys: ['', '', '', '', ''], rootCause: '' }

const KZ_CLEAR = {
  kaizenType: '', kaizenTypeMode: 'builtin', kaizenTypePDFs: [], kaizenTypeOtherDesc: '',
  keyMeasurements: [''], rootCauseTools: ['5whys'], whyChains: [EMPTY_WHY],
  fishboneImages: [], fishboneNotes: '', fmeaImages: [], fmeaNotes: '',
  paretoImages: [], paretoNotes: '', controlImages: [], controlNotes: '',
  otherToolName: '', otherImages: [], otherNotes: '',
  solutions: [EMPTY_SOLUTION], kpiCards: [], achievedResults: [''], analysisOfGaps: '',
  planComplete: false, checkComplete: false, actComplete: false,
  standardizeActions: [''], assureMaintenanceActions: [''], standardizeEvidence: [], assureEvidence: [],
  a3: {}, financeApplicable: null, financeStatus: 'Not Started', fv: EMPTY_FV,
}
const QW_CLEAR   = { qw: {} }
const PDCA_CLEAR = {
  keyMeasurements: [''], rootCauseTools: ['5whys'], whyChains: [EMPTY_WHY],
  fishboneImages: [], fishboneNotes: '', fmeaImages: [], fmeaNotes: '',
  paretoImages: [], paretoNotes: '', controlImages: [], controlNotes: '',
  otherToolName: '', otherImages: [], otherNotes: '',
  solutions: [EMPTY_SOLUTION], kpiCards: [], achievedResults: [''], analysisOfGaps: '',
  planComplete: false, checkComplete: false, actComplete: false,
  standardizeActions: [''], assureMaintenanceActions: [''], standardizeEvidence: [], assureEvidence: [],
}
const A3_CLEAR = { a3: {} }

function hasKZContent(form) {
  if (form.kaizenType) return true
  if ((form.solutions || []).some(s => s.activities?.some(a => a.what?.trim()))) return true
  if (Object.values(form.a3?.sectionComplete || {}).some(Boolean)) return true
  if ((form.keyMeasurements || []).some(m => m.trim())) return true
  return false
}
function hasQWContent(form) {
  const qw = form.qw || {}
  return !!(qw.problemStatement?.trim() || qw.before?.trim() ||
    (qw.actions || []).some(a => a.activities?.some(act => act.what?.trim())))
}
function hasPDCAContent(form) {
  if (form.planComplete || form.checkComplete || form.actComplete) return true
  if ((form.solutions || []).some(s => s.activities?.some(a => a.what?.trim()))) return true
  if ((form.keyMeasurements || []).some(m => m.trim())) return true
  return false
}
function hasA3Content(form) {
  if (Object.values(form.a3?.sectionComplete || {}).some(Boolean)) return true
  if ((form.a3?.countermeasures || []).some(cm => cm.activities?.some(a => a.what?.trim()))) return true
  return false
}

export default function ProjectInfo() {
  const { form, setForm, logAction, logSection, saveToServer, serverProjectId } = useKaizenForm()
  const { user, allRoles } = useAuth()
  const [errors, setErrors] = useState({})
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [methodologyOpen, setMethodologyOpen] = useState(!form.kaizenType)

  // Sync cqManager whenever allRoles finishes loading or sites change
  useEffect(() => {
    if (!allRoles || !form.sites.length) return
    const derived = deriveCqManager(form.sites)
    if (derived && derived !== form.cqManager) setForm({ cqManager: derived })
  }, [allRoles, form.sites])
  const [pendingCategory, setPendingCategory] = useState(null)
  const [pendingMethod,   setPendingMethod]   = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  function deriveSite(sites) {
    if (!sites.length) return ''
    if (sites.includes('Global')) return 'Global'
    return sites.join('-')
  }

  function deriveCqManager(sites) {
    if (!sites.length || !allRoles) return ''
    const isGlobal = sites.includes('Global') || sites.length > 1
    if (isGlobal) {
      return allRoles.corpQM?.users?.[0]?.name || ''
    }
    const site = sites[0]
    const qaUser = allRoles.qaManager?.users?.find(u => u.site === site)
    if (qaUser?.name) return qaUser.name
    return allRoles.corpQM?.users?.[0]?.name || ''
  }

  async function buildCode(sites, depts) {
    const site = deriveSite(sites)
    if (!site || !depts.length) return generateProjectCode(sites, depts)
    const year = new Date().getFullYear()
    try {
      const { nextSeq } = await fetchNextSeq(site, year)
      const deptStr = depts.join('-')
      return `${site}-${deptStr}-${year}-${String(nextSeq).padStart(3, '0')}`
    } catch {
      return generateProjectCode(sites, depts)
    }
  }

  async function toggleSite(site) {
    let next
    if (site === 'Global') {
      next = form.sites.includes('Global') ? [] : ['Global']
    } else {
      const without = form.sites.filter(s => s !== 'Global')
      next = without.includes(site) ? without.filter(s => s !== site) : [...without, site]
      const nonGlobal = SITES.filter(s => s !== 'Global')
      if (nonGlobal.every(s => next.includes(s))) next = ['Global']
    }
    const code = await buildCode(next, form.depts)
    setForm({ sites: next, projectCode: code, cqManager: deriveCqManager(next) })
  }

  async function toggleDept(dept) {
    const next = form.depts.includes(dept)
      ? form.depts.filter(d => d !== dept)
      : [...form.depts, dept]
    const code = await buildCode(form.sites, next)
    setForm({ depts: next, projectCode: code })
  }

  function addTeamMember() {
    setForm(p => ({ ...p, teamMembers: [...p.teamMembers, { empNum: '', loc: '', dept: '', name: '', position: '' }] }))
  }

  function updateMember(i, field, val) {
    setForm(p => {
      const members = [...p.teamMembers]
      members[i] = { ...members[i], [field]: val }
      return { ...p, teamMembers: members }
    })
  }

  function removeMember(i) {
    setForm(p => ({ ...p, teamMembers: p.teamMembers.filter((_, idx) => idx !== i) }))
  }

  function handleCategoryChange(newCat) {
    if (newCat === form.projectCategory) return
    const hasData = newCat === 'Quick Win' ? hasKZContent(form) : hasQWContent(form)
    if (hasData) { setPendingCategory(newCat); return }
    setForm(newCat === 'Quick Win'
      ? { projectCategory: 'Quick Win', ...KZ_CLEAR }
      : { projectCategory: 'Kaizen', ...QW_CLEAR }
    )
  }
  function applyCategory(pending) {
    setForm(pending === 'Quick Win'
      ? { projectCategory: 'Quick Win', ...KZ_CLEAR }
      : { projectCategory: 'Kaizen', ...QW_CLEAR }
    )
    setPendingCategory(null)
  }
  function handleMethodChange(id, modes) {
    const from = form.kaizenType
    const hasData = from === 'PDCA' ? hasPDCAContent(form) : from === 'A3' ? hasA3Content(form) : false
    if (hasData) { setPendingMethod({ id, modes, from }); return }
    const clears = from === 'PDCA' ? PDCA_CLEAR : from === 'A3' ? A3_CLEAR : {}
    setForm({ kaizenType: id, kaizenTypeMode: modes ? 'builtin' : 'pdf', ...clears })
    if (!modes) setMethodologyOpen(false)
  }
  function applyMethod(pending) {
    const clears = pending.from === 'PDCA' ? PDCA_CLEAR : pending.from === 'A3' ? A3_CLEAR : {}
    setForm({ kaizenType: pending.id, kaizenTypeMode: pending.modes ? 'builtin' : 'pdf', ...clears })
    if (!pending.modes) setMethodologyOpen(false)
    setPendingMethod(null)
  }

  function validate() {
    const e = {}
    if (!form.sites.length)        e.sites          = 'Location is required'
    if (!form.depts.length)        e.depts          = 'Department is required'
    if (!form.projectTitle.trim()) e.projectTitle   = 'Project Title is required'
    if (!form.teamLeader.trim())   e.teamLeader     = 'Team Leader is required'
    if (!form.deptManager?.trim()) e.deptManager    = 'Department Manager is required'
    if (!form.projectType)         e.projectType    = 'KPI Type is required'
    if (form.projectType === 'Other' && !form.projectTypeOther?.trim())
                                   e.projectTypeOther = 'Please describe the KPI type'
    if (form.projectCategory !== 'Quick Win' && !form.kaizenType)
                                   e.kaizenType     = 'Kaizen Methodology is required'
    if (!form.problemDesc.trim())  e.problemDesc    = 'Project Description is required'
    if (!form.objective.trim())    e.objective      = 'Objective is required'
    if (!form.targetCompletion)    e.targetCompletion = 'Target Completion Date is required'
    setErrors(e)
    return e
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      alert('Please fill in all required fields:\n\n• ' + Object.values(errs).join('\n• '))
      return
    }
    const now   = new Date().toISOString().split('T')[0]
    const entry = { type: 'action', icon: '📤', text: 'Submitted for Dept. Manager Review', user: user?.username || 'unknown', time: new Date().toISOString() }
    const updatedFields = { submitted: true, editing: false, startDate: now, status: 'Pending Dept. Manager Review', historyEntries: [...(form.historyEntries || []), entry] }
    setForm(updatedFields)
    try {
      await saveToServer({ ...form, ...updatedFields })
    } catch (e) {
      console.error('[Kaizen] Save on submit failed:', e)
    }
  }

  async function handleApprove() {
    if (!form.priority) {
      alert('Please select a Priority before approving.')
      return
    }
    const entry = { type: 'action', icon: '✅', text: `Approved — Priority set to ${form.priority}`, user: user?.username || 'unknown', time: new Date().toISOString() }
    const updatedFields = { approved: true, status: 'In Progress', historyEntries: [...(form.historyEntries || []), entry] }
    setForm(updatedFields)
    try {
      await saveToServer({ ...form, ...updatedFields })
    } catch (e) {
      console.error('[Kaizen] Save on approve failed:', e)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    setCancelError('')
    try {
      await cancelProject(serverProjectId, cancelReason)
      setForm({ status: 'Cancelled' })
      logAction('🚫', `Project cancelled${cancelReason ? ': ' + cancelReason : ''}`, user?.username)
      setShowCancelConfirm(false)
      setCancelReason('')
    } catch (e) {
      console.error('[Kaizen] Cancel failed:', e)
      setCancelError('Could not reach the server. Make sure the API server is running, then try again.')
    } finally {
      setCancelling(false)
    }
  }


  return (
    <AccordionSection title="1. Project Information" stage="info" defaultOpen={true}>

      {/* Project Type */}
      <Field label="Project Type" required>
        <div className="flex gap-3 flex-wrap">
          {[
            { id: 'Kaizen',    desc: 'A structured improvement process focused on eliminating waste (muda) and overly hard work (muri) using scientific experimentation. Typically takes a few months or more.' },
            { id: 'Quick Win', desc: 'A small-scale, achievable milestone with immediate benefits. Typically accomplished in a few weeks to a few months.' },
          ].map(({ id, desc }) => {
            const selected = form.projectCategory === id
            return (
              <label key={id}
                className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors flex-1 min-w-[200px] ${
                  selected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${form.submitted && !form.editing ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <input type="radio" name="projectCategory" value={id}
                  checked={selected} disabled={form.submitted && !form.editing}
                  onChange={() => handleCategoryChange(id)}
                  className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </label>
            )
          })}
        </div>

        {/* Type-switch confirmation */}
        {pendingCategory && (
          <div className="mt-3 border border-amber-300 bg-amber-50 rounded-md p-4 space-y-2">
            <p className="text-sm font-semibold text-amber-800">
              Switch to {pendingCategory}? This will erase all {pendingCategory === 'Quick Win' ? 'Kaizen' : 'Quick Win'} form data entered so far.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => applyCategory(pendingCategory)}
                className="text-sm bg-amber-600 text-white font-semibold rounded px-4 py-1.5 hover:bg-amber-700">
                Yes, switch and clear data
              </button>
              <button type="button" onClick={() => setPendingCategory(null)}
                className="text-sm border border-gray-300 bg-white text-gray-700 font-semibold rounded px-4 py-1.5 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Field>

      {/* Location */}
      <Field label="Location" required>
        <ChipPicker options={SITES} selected={form.sites} onToggle={toggleSite} disabled={form.submitted && !form.editing} />
        {errors.sites && <p className="text-red-500 text-xs mt-1">{errors.sites}</p>}
      </Field>

      {/* Departments */}
      <Field label="Departments" required>
        <ChipPicker options={DEPARTMENTS} selected={form.depts} onToggle={toggleDept} disabled={form.submitted && !form.editing} />
        {errors.depts && <p className="text-red-500 text-xs mt-1">{errors.depts}</p>}
      </Field>

      {/* Project Code */}
      <Field label="Project Code" hint="Auto-generated from Site and Departments">
        <div className={`text-sm font-mono font-bold rounded px-3 py-2 border ${form.projectCode ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-400 italic'}`}>
          {form.projectCode || 'Select a site and department(s) to generate'}
        </div>
      </Field>

      {/* Corp Quality Manager / Site Designee — computed live from allRoles + selected sites */}
      <Field label="Corp. Quality Manager / Site Designee" hint="Auto-filled from Admin roles based on selected location">
        {(() => {
          const val = deriveCqManager(form.sites)
          return (
            <div className={`text-sm rounded px-3 py-2 border ${val ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-400 italic'}`}>
              {val || (allRoles ? 'Select a location to auto-fill' : 'Loading…')}
            </div>
          )
        })()}
      </Field>

      {/* Team Leader */}
      <Field label="Team Leader" required>
        <EmployeeSearch
          value={form.teamLeader}
          onChange={v => setForm({ teamLeader: v })}
          onSelect={emp => setForm({ teamLeader: emp.name })}
          disabled={form.submitted && !form.editing}
          placeholder="Search by name or EID..."
          inputClassName={`w-full text-sm border rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 ${errors.teamLeader ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.teamLeader && <p className="text-red-500 text-xs mt-1">{errors.teamLeader}</p>}
      </Field>

      {/* Department Manager — required before adding team members */}
      <Field label="Department Manager" required>
        <EmployeeSearch
          value={form.deptManager || ''}
          onChange={v => setForm({ deptManager: v })}
          onSelect={emp => setForm({ deptManager: emp.name })}
          disabled={form.submitted && !form.editing}
          placeholder="Search by name or EID..."
          inputClassName={`w-full text-sm border rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 ${errors.deptManager ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.deptManager && <p className="text-red-500 text-xs mt-1">{errors.deptManager}</p>}
      </Field>

      {/* Team Members — unlocked after Dept Manager is filled */}
      <Field label="Team Member(s)">
        <div className="space-y-2">
          {!form.deptManager?.trim() && !(form.submitted && !form.editing) && (
            <p className="text-xs text-amber-600 italic">Enter the Department Manager above before adding team members.</p>
          )}
          {form.teamMembers.length > 0 && (
            // Wrapper div holds the border/radius — NOT the table, so the search
            // dropdown can escape the table without being clipped by overflow-hidden.
            <div className="border border-gray-200 rounded">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-6 px-2 py-1.5 rounded-tl"></th>
                    <th className="px-2 py-1.5 text-left text-gray-500 font-semibold">Name</th>
                    <th className="w-12 px-2 py-1.5 text-left text-gray-500 font-semibold">EID</th>
                    <th className="w-9 px-2 py-1.5 text-left text-gray-500 font-semibold">Loc</th>
                    <th className="w-10 px-2 py-1.5 text-left text-gray-500 font-semibold">Dept</th>
                    <th className="w-32 px-2 py-1.5 text-left text-gray-500 font-semibold rounded-tr">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {form.teamMembers.map((m, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-2 py-1">
                        {(!form.submitted || form.editing) && (
                          <button onClick={() => removeMember(i)} className="text-red-400 hover:text-red-600 text-sm leading-none">×</button>
                        )}
                      </td>
                      {/* Name — searchable; selecting auto-fills the rest */}
                      <td className="px-1 py-1 min-w-[160px] relative">
                        <EmployeeSearch
                          value={m.name || ''}
                          onChange={v => updateMember(i, 'name', v)}
                          onSelect={emp => setForm(prev => {
                            const members = [...prev.teamMembers]
                            members[i] = {
                              ...members[i],
                              name:     emp.name,
                              empNum:   emp.empNum,
                              loc:      emp.loc,
                              dept:     emp.dept,
                              position: emp.position || '',
                            }
                            return { ...prev, teamMembers: members }
                          })}
                          disabled={form.submitted && !form.editing}
                          placeholder="Search by name or EID..."
                          inputClassName="w-full border border-transparent hover:border-gray-200 focus:border-blue-400 rounded px-1.5 py-0.5 text-xs focus:outline-none disabled:bg-transparent"
                        />
                      </td>
                      {/* Auto-filled fields — still manually editable */}
                      {[['empNum', '####'], ['loc', 'US'], ['dept', 'QA'], ['position', 'Title']].map(([f, ph]) => (
                        <td key={f} className="px-1 py-1">
                          <input type="text" value={m[f] || ''} onChange={e => updateMember(i, f, e.target.value)}
                            disabled={form.submitted && !form.editing}
                            placeholder={ph}
                            className="w-full border border-transparent hover:border-gray-200 focus:border-blue-400 rounded px-1.5 py-0.5 text-xs focus:outline-none disabled:bg-transparent" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(!form.submitted || form.editing) && (
            <button onClick={addTeamMember}
              disabled={!form.deptManager?.trim()}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
              + Add Member
            </button>
          )}
        </div>
      </Field>

      {/* KPI Type */}
      <Field label="KPI Type" required>
        <div className="space-y-2">
          <select value={form.projectType}
            onChange={e => setForm({ projectType: e.target.value, projectTypeOther: e.target.value !== 'Other' ? '' : form.projectTypeOther })}
            disabled={form.submitted && !form.editing}
            className={`text-sm border rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 ${errors.projectType ? 'border-red-400' : 'border-gray-300'}`}>
            <option value="">Select...</option>
            {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          {errors.projectType && <p className="text-red-500 text-xs mt-1">{errors.projectType}</p>}
          {form.projectType === 'Other' && (
            <div>
              <input type="text" value={form.projectTypeOther || ''}
                onChange={e => setForm({ projectTypeOther: e.target.value })}
                disabled={form.submitted && !form.editing}
                placeholder="Please describe the KPI type..."
                className={`w-full text-sm border rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 ${errors.projectTypeOther ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.projectTypeOther && <p className="text-red-500 text-xs mt-1">{errors.projectTypeOther}</p>}
            </div>
          )}
        </div>
      </Field>

      {/* Project Title */}
      <Field label="Project Title" required>
        <input type="text" value={form.projectTitle}
          onChange={e => setForm({ projectTitle: e.target.value })}
          disabled={form.submitted && !form.editing} placeholder="Enter project title"
          className={`w-full text-sm border rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 ${errors.projectTitle ? 'border-red-400' : 'border-gray-300'}`} />
        {errors.projectTitle && <p className="text-red-500 text-xs mt-1">{errors.projectTitle}</p>}
      </Field>

      {/* Problem Description */}
      <Field label="Project Description" required hint="Describe current state and future state (VOC)">
        <textarea value={form.problemDesc} onChange={e => setForm({ problemDesc: e.target.value })}
          disabled={form.submitted && !form.editing} rows={3} placeholder="Describe the current state and desired future state..."
          className={`w-full text-sm border rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans ${errors.problemDesc ? 'border-red-400' : 'border-gray-300'}`} />
        {errors.problemDesc && <p className="text-red-500 text-xs mt-1">{errors.problemDesc}</p>}
      </Field>

      {/* Objective */}
      <Field label="Objective" required hint='Format: "To increase/decrease {metric} from ___ to ___ by DD/MM/YY"'>
        <textarea value={form.objective} onChange={e => setForm({ objective: e.target.value })}
          disabled={form.submitted && !form.editing} rows={2}
          placeholder="To reduce the Tapes/Adhesives rejection rate from 3.2% to below 1% by 12/31/2026"
          className={`w-full text-sm border rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans ${errors.objective ? 'border-red-400' : 'border-gray-300'}`} />
        {errors.objective && <p className="text-red-500 text-xs mt-1">{errors.objective}</p>}
      </Field>

      {/* Business Benefit — hidden for Quick Win */}
      {form.projectCategory !== 'Quick Win' && (
        <Field label="Business Benefit">
          <textarea value={form.businessBenefit} onChange={e => setForm({ businessBenefit: e.target.value })}
            disabled={form.submitted && !form.editing} rows={2} placeholder="Reference the department KPI to be improved..."
            className="w-full text-sm border border-gray-300 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 font-sans" />
        </Field>
      )}

      {/* Baseline — hidden for Quick Win */}
      {form.projectCategory !== 'Quick Win' && (
        <Field label="Baseline / Background">
          <BaselineEntries disabled={form.submitted && !form.editing} />
        </Field>
      )}

      {/* Target Completion */}
      <Field label="Target Completion Date" required>
        <input type="date" value={form.targetCompletion}
          onChange={e => setForm({ targetCompletion: e.target.value })}
          disabled={form.submitted && !form.editing}
          className={`text-sm border rounded px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 ${errors.targetCompletion ? 'border-red-400' : 'border-gray-300'}`} />
        {errors.targetCompletion && <p className="text-red-500 text-xs mt-1">{errors.targetCompletion}</p>}
      </Field>

      {/* Start Date (auto) */}
      {form.startDate && (
        <Field label="Start Date">
          <span className="text-sm text-gray-600">{form.startDate}</span>
        </Field>
      )}

      {/* Kaizen Methodology — hidden for Quick Win */}
      {form.projectCategory !== 'Quick Win' && (() => {
        const METHODS = [
          { id: 'PDCA',             label: 'PDCA (Plan-Do-Check-Act)', desc: 'Structured improvement cycle with built-in form sections.',    modes: true  },
          { id: 'A3',               label: 'A3 Report',                desc: 'Toyota-style one-page problem-solving report.',                modes: true  },
          { id: '8D',               label: '8D (Eight Disciplines)',    desc: 'Eight-step problem-solving method. Upload your 8D document.', modes: false },
          { id: 'BusinessStrategy', label: 'Business Strategy',         desc: 'Strategy-driven initiative. Upload your strategy document.',  modes: false },
          { id: 'Other',            label: 'Other',                     desc: 'Describe the methodology and upload supporting documentation.', modes: false },
        ]
        const locked = form.submitted && !form.editing
        const selected = METHODS.find(m => m.id === form.kaizenType)
        return (
          <Field label="Kaizen Methodology" required>
            {/* Collapsed summary — shown when a selection exists and panel is closed */}
            {selected && !methodologyOpen && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-full px-3 py-1">
                  {selected.label}
                  {selected.modes && (
                    <span className="font-normal text-red-400">
                      · {form.kaizenTypeMode === 'builtin' ? 'Built-in form' : 'PDF upload'}
                    </span>
                  )}
                  {selected.id === 'Other' && form.kaizenTypeOtherDesc && (
                    <span className="font-normal text-red-400">· {form.kaizenTypeOtherDesc}</span>
                  )}
                </span>
                {!locked && (
                  <button type="button" onClick={() => setMethodologyOpen(true)}
                    className="text-xs text-blue-600 hover:underline">
                    Change
                  </button>
                )}
              </div>
            )}

            {/* Expanded selector */}
            {(methodologyOpen || !selected) && (
              <div className="space-y-2">
                {METHODS.map(({ id, label, desc, modes }) => {
                  const isSelected = form.kaizenType === id
                  return (
                    <label key={id}
                      className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                        isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <input type="radio" name="kaizenType" value={id}
                        checked={isSelected} disabled={locked}
                        onChange={() => handleMethodChange(id, modes)}
                        className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>

                        {/* Mode sub-choice for PDCA and A3 */}
                        {isSelected && modes && (
                          <div className="mt-2 flex gap-5">
                            {[['builtin', 'Use built-in form sections'], ['pdf', 'Upload PDF instead']].map(([val, lbl]) => (
                              <label key={val} className={`flex items-center gap-1.5 text-xs cursor-pointer ${locked ? 'cursor-not-allowed' : ''}`}>
                                <input type="radio" name="kaizenTypeMode" value={val}
                                  checked={form.kaizenTypeMode === val} disabled={locked}
                                  onChange={() => {
                                    setForm({ kaizenTypeMode: val })
                                    setMethodologyOpen(false)
                                  }} />
                                {lbl}
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Description for Other */}
                        {isSelected && id === 'Other' && (
                          <div className="mt-2 flex gap-2">
                            <input type="text" value={form.kaizenTypeOtherDesc || ''}
                              onChange={e => setForm({ kaizenTypeOtherDesc: e.target.value })}
                              disabled={locked}
                              placeholder="Describe the Kaizen methodology..."
                              className="flex-1 text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50" />
                            <button type="button" onClick={() => setMethodologyOpen(false)}
                              className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
            {/* Method-switch confirmation */}
            {pendingMethod && (
              <div className="mt-3 border border-amber-300 bg-amber-50 rounded-md p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-800">
                  Switch from {pendingMethod.from} to {pendingMethod.id}? This will erase all {pendingMethod.from} data entered so far.
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => applyMethod(pendingMethod)}
                    className="text-sm bg-amber-600 text-white font-semibold rounded px-4 py-1.5 hover:bg-amber-700">
                    Yes, switch and clear data
                  </button>
                  <button type="button" onClick={() => setPendingMethod(null)}
                    className="text-sm border border-gray-300 bg-white text-gray-700 font-semibold rounded px-4 py-1.5 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {errors.kaizenType && <p className="text-red-500 text-xs mt-1">{errors.kaizenType}</p>}
          </Field>
        )
      })()}

      {/* Completion Date (auto) */}
      {form.completionDate && (
        <Field label="Completion Date">
          <span className="text-sm font-semibold text-green-700">{form.completionDate}</span>
        </Field>
      )}

      {/* Submit / Edit / Approve bar */}
      <div className="pt-2 border-t border-gray-100 flex items-center gap-3 flex-wrap">

        {/* Not yet submitted OR in edit mode — show Submit / Resubmit */}
        {(!form.submitted || form.editing) && (
          <>
            <button onClick={handleSubmit}
              className="text-sm bg-blue-600 text-white font-semibold rounded px-4 py-2 hover:bg-blue-700">
              {form.editing ? 'Resubmit for Approval' : 'Submit for Approval'}
            </button>
            {form.editing && (
              <button onClick={() => setForm({ editing: false })}
                className="text-sm border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-50 text-gray-600">
                Cancel Edit
              </button>
            )}
          </>
        )}

        {/* Submitted, not editing, not completed — show Edit button */}
        {form.submitted && !form.editing && form.status !== 'Completed' && form.status !== 'Cancelled' && (
          <button onClick={() => setForm({ editing: true })}
            className="text-sm border border-blue-400 text-blue-600 font-semibold rounded px-4 py-2 hover:bg-blue-50">
            ✎ Edit Project Info
          </button>
        )}

        {/* Pending manager approval — Dept Manager / Corp QM / Admin only */}
        {form.submitted && !form.editing && form.status === 'Pending Dept. Manager Review' && userCan(user, 'approve') && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm font-semibold text-orange-600">⏳ Pending Review</span>
            <select value={form.priority || ''}
              onChange={e => setForm({ priority: e.target.value || null })}
              className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Set Priority...</option>
              {Object.values(PRIORITIES).map(p => <option key={p}>{p}</option>)}
            </select>
            <button onClick={handleApprove} disabled={!form.priority}
              className="text-sm bg-green-600 text-white font-semibold rounded px-4 py-2 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed">
              ✓ Approve
            </button>
          </div>
        )}

        {/* Approved */}
        {form.approved && !form.editing && (
          <span className="text-sm font-semibold text-green-700">✓ Approved — Priority: {form.priority}</span>
        )}

        {/* Completed — locked */}
        {form.status === 'Completed' && (
          <span className="text-sm text-gray-400 italic">Project completed — Project Information is locked.</span>
        )}

        {/* Cancelled — locked */}
        {form.status === 'Cancelled' && (
          <span className="text-sm text-gray-400 italic">Project cancelled — no further changes allowed.</span>
        )}

        {/* Cancel Project — Corp QM, QA Manager, and Dept Manager only */}
        {serverProjectId && !form.editing && userCan(user, 'cancel') &&
         form.status !== 'Completed' && form.status !== 'Cancelled' && (
          <button onClick={() => { setShowCancelConfirm(true); setCancelError('') }}
            className="ml-auto text-sm text-red-500 hover:text-red-700 hover:underline font-medium">
            Cancel Project
          </button>
        )}

      </div>

      {/* Inline cancel confirmation panel */}
      {showCancelConfirm && (
        <div className="mt-3 border border-red-200 bg-red-50 rounded-md p-4 space-y-3">
          <p className="text-sm font-semibold text-red-700">Cancel this project?</p>
          <p className="text-xs text-red-600">This will set the project status to Cancelled. The record will be kept for historical reference.</p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason (optional)</label>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              rows={2} placeholder="Explain why this project is being cancelled..."
              className="w-full text-sm border border-red-200 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 bg-white font-sans" />
          </div>
          {cancelError && (
            <p className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2">{cancelError}</p>
          )}
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} disabled={cancelling}
              className="text-sm bg-red-600 text-white font-semibold rounded px-4 py-2 hover:bg-red-700 disabled:opacity-50">
              {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
            </button>
            <button onClick={() => { setShowCancelConfirm(false); setCancelReason(''); setCancelError('') }}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Never mind
            </button>
          </div>
        </div>
      )}

    </AccordionSection>
  )
}
