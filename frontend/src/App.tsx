import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import React, { Suspense, lazy } from 'react'

// Lazy-load all page components
const CommandCenter = lazy(() => import('./pages/CommandCenter'))
const Globe = lazy(() => import('./pages/Globe'))
const Triage = lazy(() => import('./pages/Triage'))
const ReportDetail = lazy(() => import('./pages/ReportDetail'))
const SifAnalysis = lazy(() => import('./pages/SifAnalysis'))
const Patterns = lazy(() => import('./pages/Patterns'))
const PatternDetail = lazy(() => import('./pages/PatternDetail'))
const Assets = lazy(() => import('./pages/Assets'))
const AssetDetail = lazy(() => import('./pages/AssetDetail'))
const Alerts = lazy(() => import('./pages/Alerts'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Submit = lazy(() => import('./pages/Submit'))
const AuditLog = lazy(() => import('./pages/AuditLog'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-[#0A0E14]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-400 font-mono">LOADING…</span>
    </div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CommandCenter />
          </Suspense>
        ),
      },
      {
        path: 'globe',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Globe />
          </Suspense>
        ),
      },
      {
        path: 'triage',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Triage />
          </Suspense>
        ),
      },
      {
        path: 'reports/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ReportDetail />
          </Suspense>
        ),
      },
      {
        path: 'sif',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SifAnalysis />
          </Suspense>
        ),
      },
      {
        path: 'patterns',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Patterns />
          </Suspense>
        ),
      },
      {
        path: 'patterns/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PatternDetail />
          </Suspense>
        ),
      },
      {
        path: 'assets',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Assets />
          </Suspense>
        ),
      },
      {
        path: 'assets/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AssetDetail />
          </Suspense>
        ),
      },
      {
        path: 'alerts',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Alerts />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: 'submit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Submit />
          </Suspense>
        ),
      },
      {
        path: 'audit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AuditLog />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
