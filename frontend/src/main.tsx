import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as maplibregl from 'maplibre-gl'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker?url'
import './index.css'
import { router } from './router'

// maplibre-gl v6 requires the worker URL to be set explicitly when bundling with Vite
maplibregl.setWorkerUrl(maplibreWorkerUrl)

// Register the service worker — auto-updates silently in the background
registerSW({ immediate: true })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes
      gcTime: 30 * 60 * 1000,     // 30 minutes
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
