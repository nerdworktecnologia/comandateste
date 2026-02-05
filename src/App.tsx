import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import CustomerOrders from "./pages/Orders";
import NotFound from "./pages/NotFound";

// Store pages
import StoreRegister from "./pages/store/Register";
import StoreDashboard from "./pages/store/Dashboard";
import StoreProducts from "./pages/store/Products";
import ProductForm from "./pages/store/ProductForm";
import StoreOrders from "./pages/store/Orders";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStores from "./pages/admin/Stores";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<CustomerOrders />} />
              
              {/* Store/Lojista routes */}
              <Route path="/store/register" element={<StoreRegister />} />
              <Route path="/store/dashboard" element={<StoreDashboard />} />
              <Route path="/store/products" element={<StoreProducts />} />
              <Route path="/store/products/new" element={<ProductForm />} />
              <Route path="/store/products/:id/edit" element={<ProductForm />} />
              <Route path="/store/orders" element={<StoreOrders />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/stores" element={<AdminStores />} />
              
              {/* Public routes with Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
