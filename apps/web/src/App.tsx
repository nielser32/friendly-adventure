import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

import NodeDetailPage from './pages/NodeDetailPage'
import NodeFormPage from './pages/NodeFormPage'
import NodeListPage from './pages/NodeListPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="top-bar">
        <div className="brand">
          <span className="dot" aria-hidden="true" />
          friendly-adventure
        </div>
        <nav aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Nodes
          </NavLink>
          <NavLink to="/nodes/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Create
          </NavLink>
        </nav>
      </header>

      <main id="main" className="main-content">
        <Routes>
          <Route path="/" element={<NodeListPage />} />
          <Route path="/nodes/new" element={<NodeFormPage mode="create" />} />
          <Route path="/nodes/:id" element={<NodeDetailPage />} />
          <Route path="/nodes/:id/edit" element={<NodeFormPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p className="muted">
          Built with accessibility, performance, and UX checklists from the Front-End and design guides linked in the
          repository README.
        </p>
      </footer>
    </div>
  )
}

export default App
