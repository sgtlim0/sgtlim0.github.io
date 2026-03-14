import React from 'react'
import ReactDOM from 'react-dom/client'
import { OptionsPage } from './OptionsPage'
import '../popup/globals.css'

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <OptionsPage />
    </React.StrictMode>,
  )
}
