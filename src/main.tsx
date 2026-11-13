import '@fontsource/arimo/400.css'
import '@fontsource/arimo/700.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import App, { IPodRoute } from './App.tsx'

// Case-study pages load on demand so the iPod's first paint doesn't wait for them.
const router = createBrowserRouter([
  {
    Component: App,
    children: [
      { index: true, Component: IPodRoute },
      { path: 'work', lazy: async () => ({ Component: (await import('./components/work/WorkIndexPage')).WorkIndexPage }) },
      {
        path: 'work/:slug',
        lazy: async () => ({ Component: (await import('./components/work/CaseStudyPage')).CaseStudyPage }),
      },
      { path: '*', lazy: async () => ({ Component: (await import('./components/work/NotFoundPage')).NotFoundPage }) },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
