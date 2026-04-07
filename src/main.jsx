import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './components/Toast.jsx'

import { InvoiceProvider } from './context/InvoiceContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <InvoiceProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </InvoiceProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
