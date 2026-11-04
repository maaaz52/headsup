import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createBrowserApi } from './browserApi'
import './styles.css'

if (!window.api) {
  window.api = createBrowserApi()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
