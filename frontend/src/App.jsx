import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AdminAvailabilityPage from "./features/availability/pages/AdminAvailabilityPage";
import AdminDashboardPage from "./features/dashboard/pages/AdminDashboardPage";
import AdminProvidersPage from "./features/providers/pages/AdminProvidersPage";
import AdminServicesPage from "./features/services/pages/AdminServicesPage";
import AvailabilityPage from "./features/availability/pages/AvailabilityPage";
import CustomerDashboardPage from "./features/dashboard/pages/CustomerDashboardPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ServicesPage from "./features/services/pages/ServicesPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability"
            element={
              <ProtectedRoute>
                <AvailabilityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute requireAdmin>
                <AdminServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/providers"
            element={
              <ProtectedRoute requireAdmin>
                <AdminProvidersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/availability"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAvailabilityPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
