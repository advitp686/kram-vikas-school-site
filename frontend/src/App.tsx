import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SiteLayout } from './components/SiteLayout'
import { AboutPage } from './pages/AboutPage'
import { AdmissionsPage } from './pages/AdmissionsPage'
import { ClassDetailPage } from './pages/ClassDetailPage'
import { ClassesPage } from './pages/ClassesPage'
import { HomePage } from './pages/HomePage'
import { LegalPage } from './pages/LegalPage'
import { LoginPage } from './pages/LoginPage'
import { MethodPage } from './pages/MethodPage'
import { ParentCornerPage } from './pages/ParentCornerPage'
import { StudentProfilePage } from './pages/StudentProfilePage'
import { TeachersPage } from './pages/TeachersPage'
import { WorksheetsPage } from './pages/WorksheetsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/:slug" element={<ClassDetailPage />} />
        <Route path="/worksheets" element={<WorksheetsPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/parent-corner" element={<ParentCornerPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <LegalPage
              key="privacy"
              contentPage="privacy"
              title="Privacy Policy"
              intro="We only use submitted details for admissions and academic counseling."
            />
          }
        />
        <Route
          path="/terms"
          element={
            <LegalPage
              key="terms"
              contentPage="terms"
              title="Terms of Use"
              intro="This website provides academic information and sample materials for parents."
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
