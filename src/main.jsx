import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.tsx'
import { LangProvider } from './i18n.jsx'

import './styles.css'
import './ctd.css'
import './workspace.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
const isAdmin = window.location.pathname.startsWith('/admin')

root.render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <LangProvider><App /></LangProvider>}
  </React.StrictMode>,
)

