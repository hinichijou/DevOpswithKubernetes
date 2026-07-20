// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // StrictMode seems to be somewhat recommended for development to help catch bugs. Causes every render loop to happen twice
  // <StrictMode>
    <Router>
      <App />
    </Router>
  // </StrictMode>,
)