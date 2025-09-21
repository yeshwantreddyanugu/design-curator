import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  ShoppingCart,ClipboardList,MessageSquare,Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
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
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Design Admin
              </span>
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
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-smooth",
                    isActive
                      ? "bg-gradient-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@designs.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "lg:pl-64" : "lg:pl-0")}>
        {/* Top header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
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