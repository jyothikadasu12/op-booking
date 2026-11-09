
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "../styles/pages/setup.css";

// Authentication
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

// Route protection
import ProtectedRoute from "../components/common/ProtectedRoute";

// Layouts
import CustomerLayout from "../components/layout/CustomerLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Customer pages
import CustomerDashboardPage from "../features/dashboard/pages/CustomerDashboardPage";
import ServicesPage from "../features/services/pages/ServicesPage";
import AvailabilityPage from "../features/availability/pages/AvailabilityPage";
import BookingFlowPage from "../features/appointments/pages/BookingFlowPage";
import MyBookingsPage from "../features/appointments/pages/MyBookingsPage";
import BookingDetailsPage from "../features/appointments/pages/BookingDetailsPage";
import ProfilePage from "../features/profile/pages/ProfilePage";

// Admin pages
import AdminDashboardPage from "../features/dashboard/pages/AdminDashboardPage";
import AdminServicesPage from "../features/services/pages/AdminServicesPage";
import AdminProvidersPage from "../features/providers/pages/AdminProvidersPage";
import AdminAvailabilityPage from "../features/availability/pages/AdminAvailabilityPage";
import AdminBookingsPage from "../features/appointments/pages/AdminBookingsPage";



function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
     <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer protected routes */}
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
          <Route path="/book" element={<BookingFlowPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin protected routes */}
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
          <Route
            path="/admin/availability"
            element={<AdminAvailabilityPage />}
          />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
