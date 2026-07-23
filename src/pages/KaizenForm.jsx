// KaizenForm.jsx — Kaizen Request Form (fully wired)

import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { KaizenFormProvider, useKaizenForm } from '../context/KaizenFormContext'
import { fetchProject } from '../lib/api'
import { computeProgress } from '../lib/utils'
import { ChangeHistoryModal } from '../components/shared/ChangeHistoryModal'
import { PriorityBadge, StatusBadge } from '../components/shared/StatusBadge'
import ProjectInfo    from '../components/form/ProjectInfo'
import PDCASection    from '../components/form/PDCA/PDCASection'
import WrapUp         from '../components/form/WrapUp/WrapUp'
import A3Form         from '../components/form/A3/A3Form'
import QuickWinForm  from '../components/form/QuickWin/QuickWinForm'
import { PdfUploadZone }    from '../components/shared/PdfUploadZone'
import { AccordionSection } from '../components/shared/AccordionSection'

// ── Inner form (has access to context) ───────────────────────────────────────
function FormInner({ projectId }) {
  const navigate = useNavigate()
  const { user, switchUser, TEST_USERS } = useAuth()
  const { form, setForm, saveToServer, serverProjectId, unsaved, lastSaved, logAction } = useKaizenForm()
  const [showHistory, setShowHistory] = useState(false)
  const [saving, setSaving] = useState(false)

  const isApproved = form.approved
  const code       = form.projectCode || 'New'
  const progress   = computeProgress(form)

  // Navigate to the project URL once a new project gets its server ID
  useEffect(() => {
    if (serverProjectId && !projectId) {
      navigate(`/kaizen/project/${serverProjectId}`, { replace: true })
    }
  }, [serverProjectId, projectId, navigate])

  async function handleSave() {
    logAction('💾', 'Project saved', user?.username || 'unknown')
    setSaving(true)
    try {
      await saveToServer(form)
    } catch (e) {
      console.error('[Kaizen] Server save failed:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Sticky header toolbar ──────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">

        {/* Row 1 — Category badge, project title + code, nav */}
        <div className="max-w-4xl mx-auto px-6 pt-2.5 pb-1 flex items-center gap-2 min-w-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
            form.projectCategory === 'Quick Win'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {form.projectCategory === 'Quick Win' ? 'Quick Win' : 'Kaizen'}
          </span>
          <span className="font-bold text-gray-800 text-base truncate min-w-0">
            {form.projectCode
              ? `${form.projectTitle || 'Untitled'} — ${form.projectCode}`
              : `${form.projectTitle || 'New Project'}`
            }
          </span>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {/* Dev-only: role switcher for testing different user permissions */}
            {import.meta.env.DEV && (
              <select
                value={user?.username}
                onChange={e => switchUser(e.target.value)}
                className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 cursor-pointer focus:outline-none"
              >
                {TEST_USERS.map(u => (
                  <option key={u.id} value={u.username}>{u.name}</option>
                ))}
              </select>
            )}
            <button onClick={() => navigate('/kaizen/dashboard')}
              className="text-xs text-gray-400 hover:text-gray-700">
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Row 2 — Status, priority, progress, save actions */}
        <div className="max-w-4xl mx-auto px-6 pb-2.5 flex items-center gap-3">

          {/* Status */}
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
            <span className="text-gray-500 font-medium">Status:</span>
            <StatusBadge status={form.status} />
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
            <span className="text-gray-500 font-medium">Priority:</span>
            <PriorityBadge priority={form.priority} />
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
            <span className="text-gray-500 font-medium">Progress:</span>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
            <span className="font-semibold text-gray-700">{progress}%</span>
          </div>

          {/* Right-aligned save actions */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {unsaved && (
              <span className="text-xs text-amber-500">● Unsaved</span>
            )}
            {!unsaved && lastSaved && (
              <span className="text-xs text-gray-400">
                Saved {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            <button onClick={handleSave} disabled={saving}
              className="text-xs bg-blue-600 text-white font-semibold rounded px-3 py-1.5 hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>

            <button onClick={() => setShowHistory(true)}
              className="text-xs border border-gray-300 rounded px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 font-medium">
              Change Hist
            </button>
          </div>
        </div>
      </div>

      {/* ── Form sections ──────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-3">

        {/* 1. Project Information */}
        <ProjectInfo />

        {/* Section gate — unlocks after manager approval */}
        {!isApproved ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6 text-center text-gray-400 text-sm">
            🔒 Sections unlock after manager approval.
          </div>
        ) : form.projectCategory === 'Quick Win' ? (
          <>
            <QuickWinForm />
            <WrapUp />
          </>
        ) : !form.kaizenType ? (
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-md p-6 text-center text-amber-600 text-sm">
            ⚠️ Select a <strong>Kaizen Methodology</strong> in Project Information above to continue.
          </div>
        ) : (
          <>
            {/* PDCA built-in */}
            {form.kaizenType === 'PDCA' && form.kaizenTypeMode !== 'pdf' && (
              <PDCASection />
            )}

            {/* A3 built-in */}
            {form.kaizenType === 'A3' && form.kaizenTypeMode !== 'pdf' && (
              <A3Form />
            )}

            {/* PDF upload section for all PDF modes and non-built-in types */}
            {(form.kaizenTypeMode === 'pdf' ||
              !['PDCA', 'A3'].includes(form.kaizenType)) && (
              <AccordionSection
                title={`2. ${
                  form.kaizenType === 'PDCA'             ? 'PDCA Template' :
                  form.kaizenType === 'A3'               ? 'A3 Report' :
                  form.kaizenType === '8D'               ? '8D Report' :
                  form.kaizenType === 'BusinessStrategy' ? 'Business Strategy Document' :
                  `Other — ${form.kaizenTypeOtherDesc || 'Supporting Document'}`
                }`}
                stage="methodology"
                defaultOpen={true}
                complete={(form.kaizenTypePDFs || []).length > 0}>
                <div className="space-y-3">
                  {form.kaizenType === 'Other' && form.kaizenTypeOtherDesc && (
                    <p className="text-sm text-gray-600 italic">{form.kaizenTypeOtherDesc}</p>
                  )}
                  <PdfUploadZone
                    files={form.kaizenTypePDFs || []}
                    onChange={v => setForm({ kaizenTypePDFs: v })}
                    disabled={form.status === 'Completed' || form.status === 'Cancelled'} />
                </div>
              </AccordionSection>
            )}

            {/* Wrap-Up always shown */}
            <WrapUp />
          </>
        )}

        {/* Bottom nav */}
        <div className="pt-2">
          <button onClick={() => navigate('/kaizen/dashboard')}
            className="text-sm border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-50 text-gray-600">
            ← Back to Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center pb-6">
          QA.P02.W04.F03 Rev. B1 — For Reference Only
        </p>
      </div>

      {/* Change History Modal */}
      {showHistory && (
        <ChangeHistoryModal
          entries={form.historyEntries || []}
          onClose={() => setShowHistory(false)} />
      )}
    </div>
  )
}

// ── Outer shell: loads data and wraps provider ────────────────────────────────
export default function KaizenForm() {
  const { id }   = useParams()
  const isNew    = !id
  const [initialData, setInitialData] = useState(null)
  const [loading,     setLoading]     = useState(!isNew)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    if (!isNew && id) {
      fetchProject(Number(id))
        .then(p => {
          // Summary fields — always authoritative (override formData)
          const summary = {
            projectCode:      p.code           || '',
            projectTitle:     p.title          || '',
            status:           p.status         || 'Open',
            priority:         p.priority       || null,
            approved:         ['In Progress','Pending Finance','Pending CQM','Completed'].includes(p.status) ||
                              (p.status === 'Cancelled' && (p.formData?.approved ?? false)),
            submitted:        p.status !== 'Open',
            teamLeader:       p.leader         || '',
            targetCompletion: p.targetDate     || '',
            startDate:        p.startDate      || null,
            completionDate:   p.completionDate || null,
            historyEntries: p.formData?.historyEntries?.length
              ? p.formData.historyEntries
              : [{ type: 'action', icon: '🆕', text: 'Project created', user: p.leader || 'unknown', time: p.startDate ? new Date(p.startDate).toISOString() : new Date().toISOString() }],
          }
          // If server has full PDCA formData, spread it first so PDCA sections are restored
          const fromServer = p.formData
            ? { ...p.formData, ...summary }
            : {
                ...summary,
                sites: p.site === 'Global' ? ['Global'] : p.site ? [p.site] : [],
                depts: p.depts || [],
              }
          setInitialData(fromServer)
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [id, isNew])

  if (loading) return <div className="p-10 text-gray-500 text-sm">Loading project...</div>
  if (error)   return <div className="p-10 text-red-600 text-sm">Error: {error}</div>

  return (
    <KaizenFormProvider projectId={id} initialData={initialData}>
      <FormInner projectId={id} />
    </KaizenFormProvider>
  )
}
