const express = require('express')
const db      = require('../db')

const router = express.Router()

router.get('/',  (_req, res) => res.json(db.getRoles()))
router.put('/',  (req, res)  => res.json(db.saveRoles(req.body)))

module.exports = router
