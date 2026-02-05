import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Layout } from "@/components/layout/Layout";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import CustomerOrders from "./pages/Orders";
import StorePage from "./pages/StorePage";
import NotFound from "./pages/NotFound";
import ForBusiness from "./pages/ForBusiness";
import Profile from "./pages/Profile";

// Store pages
import StoreRegister from "./pages/store/Register";
import StoreDashboard from "./pages/store/Dashboard";
import StoreProducts from "./pages/store/Products";
import ProductForm from "./pages/store/ProductForm";
import StoreOrders from "./pages/store/Orders";
import StoreSettings from "./pages/store/Settings";
import StoreCoupons from "./pages/store/Coupons";
import DriverRegister from "./pages/driver/Register";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStores from "./pages/admin/Stores";
import AdminUsers from "./pages/admin/Users";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onFinish={handleSplashFinish} duration={2500} />}
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<CustomerOrders />} />
                
                {/* Store/Lojista routes */}
                <Route path="/store/register" element={<StoreRegister />} />
                <Route path="/store/dashboard" element={<StoreDashboard />} />
                <Route path="/store/products" element={<StoreProducts />} />
                <Route path="/store/products/new" element={<ProductForm />} />
                <Route path="/store/products/:id/edit" element={<ProductForm />} />
                <Route path="/store/orders" element={<StoreOrders />} />
                <Route path="/store/coupons" element={<StoreCoupons />} />
                <Route path="/store/settings" element={<StoreSettings />} />
                
                {/* Business landing page */}
                <Route path="/for-business" element={<ForBusiness />} />
                
                {/* Driver routes */}
                <Route path="/driver/register" element={<DriverRegister />} />
                <Route path="/for-drivers" element={<DriverRegister />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/stores" element={<AdminStores />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                
                {/* Public routes with Layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/loja/:slug" element={<StorePage />} />
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
};

export default App;
