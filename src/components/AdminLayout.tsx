import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Palette,
  Plus,
  Menu,
  X,
  BarChart3,
  Settings,
  Package,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  MessageSquare,
  Image,
  Calendar,
  Sparkles,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'All Designs', href: '/admin/designs', icon: Palette },
  { name: 'Create Design', href: '/admin/create', icon: Plus },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Add Product', href: '/admin/products/create', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Custom Requests', href: '/admin/custom-requests', icon: Settings },
  { name: 'Seller Application Requests', href: '/admin/sellerApplicationRequests', icon: ClipboardList },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Banner Image Upload', href: '/admin/bannerImageUpload', icon: Image },
  { name: 'Contact Us Form', href: '/admin/contactus', icon: MessageSquare },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    console.log('🚪 Logout initiated');
    
    // Clear authentication token
    localStorage.removeItem('authToken');
    console.log('🗑️ Auth token removed from localStorage');
    
    // Show success message
    toast({
      title: 'Logged Out Successfully',
      description: 'You have been securely logged out.',
    });
    
    console.log('🔄 Redirecting to login page');
    // Redirect to login page
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white/95 backdrop-blur-xl border-r border-border shadow-xl transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Aza Arts
                </span>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200"
                      : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3 px-3 py-3 bg-white rounded-xl shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">AA</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Aza Arts Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@azaarts.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "lg:pl-64" : "lg:pl-0")}>
        {/* Top header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-border shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left: Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-blue-50"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Center: Welcome Message */}
            <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome, Aza Arts Admin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Manage your design collection
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Date and Logout Button */}
            <div className="flex items-center space-x-3">
              {/* Date */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <Calendar className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-foreground hidden md:block">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 text-red-600 hover:text-red-700 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
