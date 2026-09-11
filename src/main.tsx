import { createRoot } from 'preact/compat/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)
