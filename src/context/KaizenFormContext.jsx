// ─────────────────────────────────────────────────────────────────────────────
// KaizenFormContext.jsx
// Top-level form state for the Kaizen Request Form.
// Auto-saves to localStorage every 30 seconds.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { STATUSES } from '../lib/constants'
import { createProject, updateProject } from '../lib/api'
import { computeProgress } from '../lib/utils'

const KaizenFormContext = createContext(null)

function getStorageKey(id) {
  return `kaizen_form_${id || 'new'}`
}

function defaultForm() {
  return {
    // Project Information
    requestNum:       '',
    status:           STATUSES.OPEN,
    priority:         null,
    sites:            [],
    depts:            [],
    projectCode:      '',
    cqManager:        '',
    projectTitle:     '',
    teamLeader:       '',
    deptManager:      '',
    teamMembers:      [],
    baseline:         '',
    baselineImages:   [],
    baselineEntries:  [],
    projectType:      '',
    projectTypeOther: '',
    problemDesc:      '',
    objective:        '',
    businessBenefit:  '',
    targetCompletion: '',
    startDate:        null,
    completionDate:   null,
    approved:         false,
    submitted:        false,
    editing:          false,

    // Plan
    keyMeasurements:  [''],
    rootCauseTools:   ['5whys'],
    whyChains: [
      { problem: '', whys: ['', '', '', '', ''], rootCause: '' }
    ],
    fishboneImages:   [], fishboneNotes: '',
    fmeaImages:       [], fmeaNotes:     '',
    paretoImages:     [], paretoNotes:   '',
    controlImages:    [], controlNotes:  '',
    otherToolName:    '', otherImages:   [], otherNotes: '',

    // Do
    solutions: [
      {
        id:         1,
        title:      '',
        activities: [
          { what: '', who: '', when: '', status: '', benefit: '', comments: '' }
        ]
      }
    ],

    // Check
    kpiCards: [],      // auto-generated from keyMeasurements
    achievedResults:   [''],
    analysisOfGaps:    '',

    // Act
    standardizeActions:   [''],
    standardizeEvidence:  [],
    assureMaintenanceActions: [''],
    assureEvidence:       [],

    // Wrap-Up
    solutionsExtension: [''],
    lessonsLearned:     [''],
    problemsRemaining:  [''],

    // Finance Validation
    financeApplicable: null,
    financeStatus:     'Not Started',
    fv: {
      leader: '', manager: '', codeTitle: '', cqm: '',
      q1: '', q2: '', q3: '', q3Images: [],
      q4a: '', q4b: '',
      q5: '', q5Images: [],
      q6: '', q6Images: [],
      q7: '',
      q8: '', q8Images: [],
      q9: '',
      financeDecision: null, rejectionReason: '',
      deptManagerSig: '', deptManagerDate: '',
      financeRepSig: '', financeRepDate: '',
    },

    // CQM Sign-Off
    cqmNotes:     '',
    cqmDecision:  null,
    cqmRevision:  '',
    cqmSignature: '',
    cqmDate:      '',

    // Change history (local)
    historyEntries: [],
  }
}

export function KaizenFormProvider({ children, projectId, initialData }) {
  const storageKey = getStorageKey(projectId)
  const autoSaveRef = useRef(null)
  // Tracks the server-side ID — starts from prop, gets set on first create
  const [serverProjectId, setServerProjectId] = useState(projectId ? Number(projectId) : null)

  // Load from localStorage or initialData
  const [form, setFormRaw] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed._projectId === (projectId || 'new')) {
          // A "new" draft that was already submitted means the project was saved
          // and navigated away — discard it so the next new project starts clean.
          if (!projectId && parsed.submitted) {
            localStorage.removeItem(storageKey)
            return defaultForm()
          }
          console.log('[Kaizen] Restored draft from localStorage')
          return { ...defaultForm(), ...parsed }
        }
      }
    } catch {}
    if (initialData) return { ...defaultForm(), ...initialData }
    return defaultForm()
  })

  const [unsaved, setUnsaved] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Sync kpiCards with keyMeasurements
  useEffect(() => {
    setFormRaw(prev => {
      const measurements = prev.keyMeasurements.filter(m => m.trim())
      const existingCards = prev.kpiCards || []
      const newCards = measurements.map((m, i) => {
        const existing = existingCards[i] || {}
        return {
          id:       i,
          name:     m,
          images:   existing.images   || [],
          notes:    existing.notes    || '',
          history:  existing.history  || [],
        }
      })
      if (JSON.stringify(newCards.map(c => c.name)) === JSON.stringify(existingCards.map(c => c.name))) {
        return prev
      }
      return { ...prev, kpiCards: newCards }
    })
  }, [form.keyMeasurements])

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (unsaved) {
        try {
          localStorage.setItem(storageKey, JSON.stringify({ ...form, _projectId: projectId || 'new' }))
          setLastSaved(new Date())
          setUnsaved(false)
          console.log('[Kaizen] Auto-saved to localStorage')
        } catch (e) {
          console.warn('[Kaizen] Auto-save failed:', e)
        }
      }
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [form, unsaved, storageKey, projectId])

  // Warn on navigate away
  useEffect(() => {
    const handler = e => { if (unsaved) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [unsaved])

  const setForm = useCallback((updater) => {
    setFormRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      setUnsaved(true)
      return next
    })
  }, [])

  function saveNow(snapshot) {
    try {
      const data = snapshot || form
      localStorage.setItem(storageKey, JSON.stringify({ ...data, _projectId: projectId || 'new' }))
      setLastSaved(new Date())
      setUnsaved(false)
    } catch {}
  }

  function clearDraft() {
    localStorage.removeItem(storageKey)
  }

  // Saves to localStorage + server. Pass explicit formData when calling from a
  // React event handler before the state update has propagated (e.g. on submit).
  async function saveToServer(formData) {
    const data = formData || form
    saveNow(data)
    const dataWithProgress = { ...data, progress: computeProgress(data) }
    if (serverProjectId) {
      return updateProject(serverProjectId, dataWithProgress)
    } else {
      const created = await createProject(dataWithProgress)
      setServerProjectId(created.id)
      // Sync the server-assigned project code back into form state
      if (created.code) setFormRaw(prev => ({ ...prev, projectCode: created.code }))
      clearDraft()
      return created
    }
  }

  function logAction(icon, text, user = 'thomas.truong') {
    setForm(prev => ({
      ...prev,
      historyEntries: [
        ...prev.historyEntries,
        { type: 'action', icon, text, user, time: new Date().toISOString() }
      ]
    }))
  }

  function logSection(section, fields, user = 'thomas.truong') {
    if (!fields?.length) return
    setForm(prev => ({
      ...prev,
      historyEntries: [
        ...prev.historyEntries,
        { type: 'section', section, user, time: new Date().toISOString(), fields }
      ]
    }))
  }

  return (
    <KaizenFormContext.Provider value={{
      form, setForm, saveNow, clearDraft, saveToServer,
      unsaved, lastSaved,
      logAction, logSection,
      projectId, serverProjectId,
    }}>
      {children}
    </KaizenFormContext.Provider>
  )
}

export function useKaizenForm() {
  const ctx = useContext(KaizenFormContext)
  if (!ctx) throw new Error('useKaizenForm must be used within KaizenFormProvider')
  return ctx
}
