// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import InstallBanner from './components/ui/InstallBanner'
import './i18n'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
        <InstallBanner />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e1e',
              color: '#fff',
              border: '1px solid #3a3a3a',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#f72b20', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
