
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./components/layout/Header";
import Login from "./pages/Login";
import Inbound from "./pages/Inbound";
import GridManagement from "./pages/GridManagement";
import Outbound from "./pages/Outbound";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import Status from "./pages/Status";
import GridMaster from "./pages/GridMaster";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/inbound" element={<Inbound />} />
            <Route path="/grid-management" element={<GridManagement />} />
            <Route path="/outbound" element={<Outbound />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/grid-master" element={<GridMaster />} />
            <Route path="/dashboard" element={<Navigate to="/inbound" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
