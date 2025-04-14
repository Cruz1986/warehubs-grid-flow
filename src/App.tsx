
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Inbound from "./pages/Inbound";
import GridManagement from "./pages/GridManagement";
import Outbound from "./pages/Outbound";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import Status from "./pages/Status";
import GridMaster from "./pages/GridMaster";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/inbound" element={<ProtectedRoute><Inbound /></ProtectedRoute>} />
            <Route path="/grid-management" element={<ProtectedRoute><GridManagement /></ProtectedRoute>} />
            <Route path="/outbound" element={<ProtectedRoute><Outbound /></ProtectedRoute>} />
            <Route path="/status" element={<ProtectedRoute><Status /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute adminOnly={true}><UserManagement /></ProtectedRoute>} />
            <Route path="/grid-master" element={<ProtectedRoute adminOnly={true}><GridMaster /></ProtectedRoute>} />
            <Route path="/dashboard" element={<Navigate to="/inbound" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
