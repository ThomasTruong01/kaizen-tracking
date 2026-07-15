const express = require('express')
const db      = require('../db')

const router = express.Router()

// GET /api/projects
router.get('/', (_req, res) => {
  const list = db.getProjects().map(p => ({
    id:              p.id,
    code:            p.code,
    title:           p.title,
    type:            p.type,
    projectCategory: p.projectCategory || 'Kaizen',
    site:            p.site,
    depts:          p.depts,
    leader:         p.leader,
    status:         p.status,
    priority:       p.priority,
    startDate:      p.startDate,
    targetDate:     p.targetDate,
    completionDate: p.completionDate,
    progress:       p.progress,
  }))
  res.json(list)
})

// GET /api/projects/nextseq?site=US&year=2026
// Returns the next sequence number for a given site+year combination.
// Must be defined before /:id so Express doesn't treat "nextseq" as an ID.
router.get('/nextseq', (req, res) => {
  const { site, year } = req.query
  if (!site || !year) return res.status(400).json({ error: 'site and year required' })
  const all = db.getProjects()
  const maxSeq = all
    .filter(p => p.site === site && p.code && p.code.includes(`-${year}-`))
    .reduce((max, p) => {
      const parts = p.code.split('-')
      const n = parseInt(parts[parts.length - 1], 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
  res.json({ nextSeq: maxSeq + 1 })
})

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const p = db.getProject(req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
})

// POST /api/projects
router.post('/', (req, res) => {
  const created = db.createProject(req.body)
  res.status(201).json(created)
})

// PUT /api/projects/:id
router.put('/:id', (req, res) => {
  const updated = db.updateProject(req.params.id, req.body)
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
  if (!db.deleteProject(req.params.id)) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

// ── Status transitions ────────────────────────────────────────────────────────

router.post('/:id/submit', (req, res) => {
  const p = db.patchProjectStatus(req.params.id, 'Pending Dept. Manager Review')
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ id: p.id, status: p.status })
})

router.post('/:id/approve', (req, res) => {
  const { priority } = req.body
  const p = db.patchProjectStatus(req.params.id, 'In Progress', { priority })
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ id: p.id, priority: p.priority, status: p.status })
})

router.post('/:id/complete', (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const p = db.patchProjectStatus(req.params.id, 'Completed', { completionDate: today })
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ id: p.id, status: p.status, completionDate: p.completionDate })
})

router.post('/:id/revision', (req, res) => {
  const p = db.patchProjectStatus(req.params.id, 'In Progress')
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ id: p.id, status: p.status })
})

router.post('/:id/cancel', (req, res) => {
  const p = db.patchProjectStatus(req.params.id, 'Cancelled', { cancelReason: req.body.reason || '' })
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ id: p.id, status: p.status })
})

// ── Finance ───────────────────────────────────────────────────────────────────

// PUT /api/projects/:id/finance  (patch fv fields in formData)
router.put('/:id/finance', (req, res) => {
  const p = db.getProject(req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  const existing = p.formData || {}
  const merged = { ...existing, fv: { ...(existing.fv || {}), ...req.body } }
  db.updateProject(req.params.id, merged)
  res.json({ projectId: Number(req.params.id), ...req.body })
})

// POST /api/projects/:id/finance/submit
router.post('/:id/finance/submit', (req, res) => {
  const p = db.patchProjectStatus(req.params.id, 'Pending Finance')
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json({ projectId: p.id, status: p.status })
})

// POST /api/projects/:id/finance/decision  — body: { decision, rejectionReason }
router.post('/:id/finance/decision', (req, res) => {
  const { decision, rejectionReason } = req.body
  const status = decision === 'approve' ? 'Pending CQM' : 'In Progress'
  const p = db.patchProjectStatus(req.params.id, status)
  if (!p) return res.status(404).json({ error: 'Not found' })
  if (rejectionReason && p.formData) {
    p.formData.fv = { ...(p.formData.fv || {}), financeDecision: decision, rejectionReason }
    db.updateProject(req.params.id, p.formData)
  }
  res.json({ projectId: p.id, status })
})

// ── Change History ────────────────────────────────────────────────────────────

router.get('/:id/history', (req, res) => {
  res.json(db.getHistory(req.params.id))
})

router.post('/:id/history', (req, res) => {
  const entry = db.addHistory(req.params.id, req.body)
  res.status(201).json(entry)
})

module.exports = router
