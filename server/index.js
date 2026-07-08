const express = require('express')
const cors    = require('cors')

const projectsRouter  = require('./routes/projects')
const rolesRouter     = require('./routes/roles')
const employeesRouter = require('./routes/employees')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }))
app.use(express.json({ limit: '20mb' }))

app.use('/api/projects',  projectsRouter)
app.use('/api/roles',     rolesRouter)
app.use('/api/employees', employeesRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`Kaizen API  →  http://localhost:${PORT}`)
})
