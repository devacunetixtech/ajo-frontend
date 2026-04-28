import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/layout/index";

import { RegisterPage, LoginPage, VerifyEmailPage } from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import { GroupsPage, CreateGroupPage, GroupDetailPage } from "./pages/Groups";
import { TransactionsPage, ProfilePage } from "./pages/TransactionsAndProfile";
import {
  ForgotPasswordPage,
  ResetPasswordPage,
  ResendVerificationPage,
  KYCPage,
  PaymentCallbackPage,
  InvitePage,
  AdminGroupPage,
  NotFoundPage,
} from "./pages/NewPages";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ────────────────────────────────────────────── */}
            <Route path="/login"                element={<LoginPage />} />
            <Route path="/register"             element={<RegisterPage />} />
            <Route path="/verify-email"         element={<VerifyEmailPage />} />
            <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
            <Route path="/reset-password"       element={<ResetPasswordPage />} />
            <Route path="/resend-verification"  element={<ResendVerificationPage />} />
            <Route path="/join/:code"           element={<InvitePage />} />
            <Route path="/payment/callback"     element={<PaymentCallbackPage />} />

            {/* ── Protected ─────────────────────────────────────────── */}
            <Route path="/kyc" element={
              <ProtectedRoute><KYCPage /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute><GroupsPage /></ProtectedRoute>
            } />
            <Route path="/groups/new" element={
              <ProtectedRoute><CreateGroupPage /></ProtectedRoute>
            } />
            <Route path="/groups/:id/admin" element={
              <ProtectedRoute><AdminGroupPage /></ProtectedRoute>
            } />
            <Route path="/groups/:id" element={
              <ProtectedRoute><GroupDetailPage /></ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute><TransactionsPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* ── Fallback ───────────────────────────────────────────── */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
