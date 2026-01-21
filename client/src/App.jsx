import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import DatasetSearch from './pages/DatasetSearch'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import About from './pages/About'
import Contact from './pages/Contact'
import Documentation from './pages/Documentation'
import Results from './pages/Results'
import Processing from './pages/Processing'
import Download from './pages/Download'
import Pricing from './pages/Pricing'
import StrategyHub from './pages/StrategyHub'
import Blog from './pages/Blog'
import Support from './pages/Support'
import Tutorials from './pages/Tutorials'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import { AdminRoute } from './components/AdminRoute'

// Redirect to dashboard if logged in
const LandingRoute = () => {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }
  
  return currentUser ? <Navigate to="/dashboard" replace /> : <Landing />
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <DatasetSearch />
            </ProtectedRoute>
          } 
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route 
          path="/strategy-hub" 
          element={
            <ProtectedRoute>
              <StrategyHub />
            </ProtectedRoute>
          } 
        />
        <Route path="/blog" element={<Blog />} />
        <Route path="/support" element={<Support />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } 
        />
        <Route 
          path="/results" 
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/processing/:jobId" 
          element={
            <ProtectedRoute>
              <Processing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/download/:jobId" 
          element={
            <ProtectedRoute>
              <Download />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
