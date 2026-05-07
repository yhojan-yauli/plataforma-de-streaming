import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";

import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import SubscriptionGuard from "@/routes/SubscriptionGuard";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import BrowsePage from "@/pages/BrowsePage";
import ContentDetailPage from "@/pages/ContentDetailPage";
import WatchPage from "@/pages/WatchPage";
import PlansPage from "@/pages/PlansPage";
import ProfilePage from "@/pages/ProfilePage";
import MyListPage from "@/pages/MyListPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminContentPage from "@/pages/admin/AdminContentPage";
import AdminPaymentsPage from "@/pages/admin/AdminPaymentsPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminLogsPage from "@/pages/admin/AdminLogsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/search" element={<BrowsePage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/content/:id" element={<ContentDetailPage />} />
              <Route path="/my-list" element={<MyListPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/settings" element={<ProfilePage />} />
            </Route>

            {/* Watch page (full screen, no layout) */}
            <Route path="/watch/:id" element={<ProtectedRoute><SubscriptionGuard><WatchPage /></SubscriptionGuard></ProtectedRoute>} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute requiredRole="ADMIN" redirectTo="/home"><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/content" element={<AdminContentPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/logs" element={<AdminLogsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
