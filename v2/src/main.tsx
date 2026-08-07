import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from '@/app/App'
import { ThemeProvider } from '@/app/ThemeProvider'
import './design-system/globals.css'
import './design-system/responsive.css'
import './design-system/sidebar.css'
import './design-system/courses-polish.css'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { registerServiceWorker } from '@/pwa/register-service-worker'
import { AuthProvider } from '@/services/auth/AuthProvider'
import { SyncRuntimeProvider } from '@/services/sync/SyncRuntimeProvider'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Application root element was not found.')
}

registerServiceWorker()

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SyncRuntimeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SyncRuntimeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
