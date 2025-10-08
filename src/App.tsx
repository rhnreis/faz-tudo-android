                                                                                                                                                                                                                                                                                                                                                                                                          import AdminUsers from "./pages/admin/users";
import AdminPlans from "./pages/admin/plans";
import AdminMercadoPago from "./pages/admin/mercadopago";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Games } from "./pages/Games";
import { Signals } from "./pages/Signals";
import { VipSignals } from "./pages/VipSignals";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Plans } from "./pages/Plans";
import Checkout from "./pages/Checkout";
import { Landing } from "./pages/Landing";
import { BottomNavigation } from "./components/bottom-navigation";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="relative">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/games" element={<ProtectedRoute feature="games"><Games /></ProtectedRoute>} />
              <Route path="/signals" element={<ProtectedRoute feature="signals"><Signals /></ProtectedRoute>} />
              <Route path="/vip-signals" element={<ProtectedRoute feature="vip-signals"><VipSignals /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/checkout/:planId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/plans" element={<ProtectedRoute><AdminPlans /></ProtectedRoute>} />
              <Route path="/admin/mercadopago" element={<ProtectedRoute><AdminMercadoPago /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
