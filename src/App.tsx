import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import DesignList from "./pages/DesignList";
import CreateDesign from "./pages/CreateDesign";
import ProductList from "./pages/ProductList";
import CreateProduct from "./pages/CreateProduct";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomRequests from "./pages/AdminCustomRequests";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SellerApplicationRequests from "./pages/SellerApplicationsRequests";
import BannerImageUploadPage from "./pages/BannerImageUpload";
import ContactUs from './pages/ContactUs';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="designs" element={<DesignList />} />
            <Route path="create" element={<CreateDesign />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<CreateProduct />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="custom-requests" element={<AdminCustomRequests />} />
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="sellerApplicationRequests" element={<SellerApplicationRequests/>} />
            <Route path="contactus" element={<ContactUs />} />
            <Route path="bannerImageUpload" element={<BannerImageUploadPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
