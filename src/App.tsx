import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Host from "./pages/Host";
import AddProperty from "./pages/AddProperty";
import AddVehicle from "./pages/AddVehicle";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import VehicleDetail from "./pages/VehicleDetail";
import EditProperty from "./pages/EditProperty";
import Destination from "./pages/Destination";
import LongStays from "./pages/LongStays";
import Logements from "./pages/Logements";
import Vehicles from "./pages/Vehicles";
import NotFound from "./pages/NotFound";
import MobileNav from "@/components/layout/MobileNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pb-20 lg:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/host" element={<Host />} />
              <Route path="/destination/:area" element={<Destination />} />
              <Route 
                path="/add-property" 
                element={
                  <ProtectedRoute>
                    <AddProperty />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-vehicle" 
                element={
                  <ProtectedRoute>
                    <AddVehicle />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties" 
                element={
                  <ProtectedRoute>
                    <Properties />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-property/:id" 
                element={
                  <ProtectedRoute>
                    <EditProperty />
                  </ProtectedRoute>
                } 
              />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/vehicle/:id" element={<VehicleDetail />} />
              <Route path="/long-stays" element={<LongStays />} />
                            <Route path="/sejour-longue-duree" element={<LongStays />} />
                            <Route path="/logements" element={<Logements />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicules" element={<Vehicles />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <MobileNav />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
