import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-foreground-muted font-mono">LOADING…</span>
      </div>
    </div>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<PageWrapper><CommandCenter /></PageWrapper>} />
            <Route path="globe" element={<PageWrapper><Globe /></PageWrapper>} />
            <Route path="triage" element={<PageWrapper><Triage /></PageWrapper>} />
            <Route path="reports/:id" element={<PageWrapper><ReportDetail /></PageWrapper>} />
            <Route path="sif" element={<PageWrapper><SifAnalysis /></PageWrapper>} />
            <Route path="patterns" element={<PageWrapper><Patterns /></PageWrapper>} />
            <Route path="patterns/:id" element={<PageWrapper><PatternDetail /></PageWrapper>} />
            <Route path="assets" element={<PageWrapper><Assets /></PageWrapper>} />
            <Route path="assets/:id" element={<PageWrapper><AssetDetail /></PageWrapper>} />
            <Route path="alerts" element={<PageWrapper><Alerts /></PageWrapper>} />
            <Route path="analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
            <Route path="submit" element={<PageWrapper><Submit /></PageWrapper>} />
            <Route path="audit" element={<PageWrapper><AuditLog /></PageWrapper>} />
            <Route path="settings" element={<PageWrapper><Settings /></PageWrapper>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
