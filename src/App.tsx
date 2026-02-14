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
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { InstallPromptModal } from "@/components/InstallPromptModal";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Checkout from "./pages/Checkout";
import CustomerOrders from "./pages/Orders";
import StorePage from "./pages/StorePage";
import NotFound from "./pages/NotFound";
import ForBusiness from "./pages/ForBusiness";
import Install from "./pages/Install";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

// Landing pages
import EntregadoresLanding from "./pages/landing/Entregadores";
import EmpresasLanding from "./pages/landing/Empresas";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Terms from "./pages/legal/Terms";
import PartnerContract from "./pages/legal/PartnerContract";

// Store pages
import StoreRegister from "./pages/store/Register";
import StoreDashboard from "./pages/store/Dashboard";
import StoreProducts from "./pages/store/Products";
import ProductForm from "./pages/store/ProductForm";
import StoreOrders from "./pages/store/Orders";
import StoreSettings from "./pages/store/Settings";
import StoreCoupons from "./pages/store/Coupons";
import DriverRegister from "./pages/driver/Register";
import DriverDashboard from "./pages/driver/Dashboard";
import DeliveryMap from "./pages/driver/DeliveryMap";
import DriverEarnings from "./pages/driver/Earnings";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStores from "./pages/admin/Stores";
import AdminUsers from "./pages/admin/Users";
import AdminOrders from "./pages/admin/Orders";
import AdminPushNotifications from "./pages/admin/PushNotifications";
import AdminSettings from "./pages/admin/Settings";

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
            <PushNotificationManager />
            <InstallPromptModal />
            <CartProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/search" element={<Search />} />
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
                
                {/* Landing pages */}
                <Route path="/for-business" element={<ForBusiness />} />
                <Route path="/empresas" element={<EmpresasLanding />} />
                <Route path="/entregadores" element={<EntregadoresLanding />} />
                
                {/* Legal pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/partner-contract" element={<PartnerContract />} />
                
                {/* Driver routes */}
                <Route path="/driver/register" element={<DriverRegister />} />
                <Route path="/driver/dashboard" element={<DriverDashboard />} />
                <Route path="/driver/map" element={<DeliveryMap />} />
                <Route path="/driver/earnings" element={<DriverEarnings />} />
                <Route path="/for-drivers" element={<EntregadoresLanding />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/stores" element={<AdminStores />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/push" element={<AdminPushNotifications />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                
                {/* Public routes with Layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/loja/:slug" element={<StorePage />} />
                </Route>
                
                {/* Install PWA */}
                <Route path="/install" element={<Install />} />
                
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
