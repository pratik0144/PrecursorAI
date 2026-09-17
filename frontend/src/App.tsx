import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import React, { Suspense, lazy } from 'react'

// Lazy-load all page components
const PortalSelect = lazy(() => import('./pages/PortalSelect'))
const WorkerSubmit = lazy(() => import('./pages/WorkerSubmit'))
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64 bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-foreground-dim font-mono tracking-widest uppercase">Loading View…</span>
      </div>
    </div>
  )
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-surface-1 border border-red-200 rounded-lg shadow-sm m-4 text-center">
          <h2 className="text-lg font-bold text-red-700 mb-2">View Encountered an Error</h2>
          <p className="text-sm text-foreground-muted mb-4 font-mono">
            {this.state.error?.message || "An unexpected rendering issue occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Reload Component
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 1st Screen: Ask with which screen user wants to continue (Worker vs Officer) */}
          <Route path="/" element={<PageWrapper><PortalSelect /></PageWrapper>} />

          {/* Standalone Worker Reporting Portal */}
          <Route path="/worker" element={<PageWrapper><WorkerSubmit /></PageWrapper>} />
          <Route path="/report" element={<Navigate to="/worker" replace />} />

          {/* Higher Official / Management Command Suite */}
          <Route element={<AppLayout />}>
            <Route path="/command-center" element={<PageWrapper><CommandCenter /></PageWrapper>} />
            <Route path="/dashboard" element={<Navigate to="/command-center" replace />} />
            <Route path="/globe" element={<PageWrapper><Globe /></PageWrapper>} />
            <Route path="/triage" element={<PageWrapper><Triage /></PageWrapper>} />
            <Route path="/reports" element={<Navigate to="/triage" replace />} />
            <Route path="/reports/:id" element={<PageWrapper><ReportDetail /></PageWrapper>} />
            <Route path="/sif" element={<PageWrapper><SifAnalysis /></PageWrapper>} />
            <Route path="/patterns" element={<PageWrapper><Patterns /></PageWrapper>} />
            <Route path="/patterns/:id" element={<PageWrapper><PatternDetail /></PageWrapper>} />
            <Route path="/assets" element={<PageWrapper><Assets /></PageWrapper>} />
            <Route path="/assets/:id" element={<PageWrapper><AssetDetail /></PageWrapper>} />
            <Route path="/alerts" element={<PageWrapper><Alerts /></PageWrapper>} />
            <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
            <Route path="/submit" element={<PageWrapper><Submit /></PageWrapper>} />
            <Route path="/audit" element={<PageWrapper><AuditLog /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          </Route>

          {/* Catch-all route to Portal Selection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
