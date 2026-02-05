import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Store pages
import StoreRegister from "./pages/store/Register";
import StoreDashboard from "./pages/store/Dashboard";
import StoreProducts from "./pages/store/Products";
import ProductForm from "./pages/store/ProductForm";
import StoreOrders from "./pages/store/Orders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Store/Lojista routes */}
            <Route path="/store/register" element={<StoreRegister />} />
            <Route path="/store/dashboard" element={<StoreDashboard />} />
            <Route path="/store/products" element={<StoreProducts />} />
            <Route path="/store/products/new" element={<ProductForm />} />
            <Route path="/store/products/:id/edit" element={<ProductForm />} />
            <Route path="/store/orders" element={<StoreOrders />} />
            
            {/* Public routes with Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
