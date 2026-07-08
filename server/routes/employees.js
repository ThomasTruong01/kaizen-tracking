const express = require('express')
const db      = require('../db')

const router = express.Router()

router.get('/', (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.json([])
  res.json(db.searchEmployees(q).slice(0, 20))
})

router.post('/', (req, res) => {
  res.status(201).json(db.upsertEmployee(req.body))
})

module.exports = router
