import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth, useLogout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Store,
  BarChart3,
  ShoppingCart,
  Package,
  Tag,
  Warehouse,
  Users,
  TrendingUp,
  Truck,
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Point of Sale", href: "/pos", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Inventory", href: "/inventory", icon: Warehouse },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: TrendingUp },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const logout = useLogout();

  const currentPage = navigation.find(item => item.href === location) || navigation[0];

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">RetailFlow</h1>
                <p className="text-sm text-sidebar-foreground/60">Inventory & POS</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  data-testid="user-menu-trigger"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
                      <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-sidebar-foreground">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-xs text-sidebar-foreground/60 capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout} data-testid="logout-button">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="bg-card shadow-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                data-testid="mobile-menu-button"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {currentPage.name}
                </h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Today: {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                data-testid="theme-toggle"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Notifications */}
              <Button variant="outline" size="icon" data-testid="notifications-button">
                <div className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    3
                  </Badge>
                </div>
              </Button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products, customers..."
                  className="pl-10 w-64"
                  data-testid="global-search"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
