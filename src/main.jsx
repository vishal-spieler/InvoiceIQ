import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './components/Toast.jsx'

import { InvoiceProvider } from './context/InvoiceContext.jsx'
import { VendorProvider } from './context/VendorContext.jsx'
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeatureFlagProvider>
        <InvoiceProvider>
          <VendorProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </VendorProvider>
        </InvoiceProvider>
      </FeatureFlagProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
