import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AdminAvailabilityPage from "./features/availability/pages/AdminAvailabilityPage";
import AvailabilityPage from "./features/availability/pages/AvailabilityPage";
import AdminDashboardPage from "./features/dashboard/pages/AdminDashboardPage";
import CustomerDashboardPage from "./features/dashboard/pages/CustomerDashboardPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import AdminProvidersPage from "./features/providers/pages/AdminProvidersPage";
import AdminServicesPage from "./features/services/pages/AdminServicesPage";
import ServicesPage from "./features/services/pages/ServicesPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import CustomerLayout from "./components/layout/CustomerLayout";
import PublicLayout from "./components/layout/PublicLayout";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/providers" element={<AdminProvidersPage />} />
            <Route path="/admin/availability" element={<AdminAvailabilityPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
