// App.jsx — Root component with HashRouter routing

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Dashboard    from './pages/Dashboard'
import KaizenForm   from './pages/KaizenForm'
import AdminControl from './pages/AdminControl'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"                    element={<Navigate to="/kaizen/dashboard" replace />} />
          <Route path="/kaizen"              element={<Navigate to="/kaizen/dashboard" replace />} />
          <Route path="/kaizen/dashboard"    element={<Dashboard />} />
          <Route path="/kaizen/new"          element={<KaizenForm />} />
          <Route path="/kaizen/project/:id"  element={<KaizenForm />} />
          <Route path="/kaizen/control"      element={<AdminControl />} />
          <Route path="*"                    element={<Navigate to="/kaizen/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
