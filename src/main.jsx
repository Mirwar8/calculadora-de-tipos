import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('main.jsx: started');
const testDiv = document.createElement('div');
testDiv.innerHTML = '<h1 style="color: red; position: fixed; top: 0; left: 0; z-index: 9999; background: white;">SCRIPT EXECUTING</h1>';
document.body.appendChild(testDiv);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
