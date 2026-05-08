import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'  // Base CSS styles (Vite default, likely not heavily used)
import App from './App.jsx'   // Root App component with ThemeProvider and AuthProvider

/**
 * Entry Point: main.jsx
 * Description: The application entry point that mounts the React app to the DOM.
 * Wraps the app in React's StrictMode for development warnings and best practices.
 * 
 * StrictMode helps identify:
 * - Unsafe lifecycle methods
 * - Unexpected side effects
 * - Deprecated APIs
 * 
 * @returns {void} Renders the app into the root DOM element
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />  {/* Root component with all providers */}
  </StrictMode>,
)