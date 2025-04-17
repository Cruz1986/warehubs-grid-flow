import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Inbound from "./pages/Inbound";
import GridManagement from "./pages/GridManagement";
import Outbound from "./pages/Outbound";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import Status from "./pages/Status";
import GridMaster from "./pages/GridMaster";
import CreateAdminUser from './pages/CreateAdminUser';
import FacilityAccessGuard from "./components/auth/FacilityAccessGuard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/create-admin" element={<CreateAdminUser />} />
            <Route path="/inbound" element={<Inbound />} />
            <Route path="/grid-management" element={<GridManagement />} />
            <Route path="/outbound" element={<Outbound />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin-dashboard" element={
              <FacilityAccessGuard allowedFacility="All" requiresAdmin={true}>
                <AdminDashboard />
              </FacilityAccessGuard>
            } />
            <Route path="/user-management" element={
              <FacilityAccessGuard allowedFacility="All">
                <UserManagement />
              </FacilityAccessGuard>
            } />
            <Route path="/grid-master" element={
              <FacilityAccessGuard allowedFacility="All">
                <GridMaster />
              </FacilityAccessGuard>
            } />
            <Route path="/dashboard" element={<Navigate to="/inbound" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;