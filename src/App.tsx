import { OrderTrackingPage } from "./pages/ordertrackingpage";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { BookingProvider } from "./context/booking-context";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Chatbot from "./components/Chatbot";
import ChatbotPage from "./pages/ChatbotPage";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { UserDashboard } from "./pages/dashboard/UserDashboard";
import { StakeholderDashboard } from "./pages/dashboard/StakeholderDashboard";
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import UserTrackingPage from "./pages/UserTrackingPage";

// Existing Pages
import { ServicesPage } from "./pages/ServicesPage";
import { ServiceDetailsPage } from "./pages/ServiceDetailsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { BookingConfirmedPage } from "./pages/BookingConfirmedPage";
import ProviderActiveJob from "./pages/ProviderActiveJob";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/booking-confirmed" element={<BookingConfirmedPage />} />

              {/* ✅ STEP 6 ROUTE */}
              <Route path="/order-tracking" element={<OrderTrackingPage />} />
              <Route path="/track/:bookingId" element={<UserTrackingPage />} />
            </Route>

            {/* Shared Authenticated Routes */}
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />

            {/* Protected Stakeholder Routes */}
            <Route element={<ProtectedRoute allowedRoles={['stakeholder']} />}>
              <Route path="/stakeholder/dashboard" element={<StakeholderDashboard />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />

            {/* Provider/Stakeholder Routes */}
            <Route path="/provider/job/:bookingId" element={<ProviderActiveJob />} />
          </Routes>
        </AppLayout>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
