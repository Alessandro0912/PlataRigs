import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Package,
  Wrench,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  Activity,
  DollarSign
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lager', href: '/inventory', icon: Package },
    { name: 'Builds', href: '/builds', icon: Wrench },
    { name: 'Aufgaben', href: '/tasks', icon: ClipboardList },
    { name: '3D PC Builder', href: '/pc-builder', icon: Activity },
    { name: 'Preisvergleich', href: '/price-comparison', icon: DollarSign },
    ...(isAdmin ? [{ name: 'Benutzer', href: '/users', icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setIsSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold">PlataRigs</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-muted"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Abmelden
            </Button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-background">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold">PlataRigs</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:bg-muted"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Abmelden
            </Button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-background border-b lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="px-4"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 items-center justify-center">
            <h1 className="text-xl font-bold">PlataRigs</h1>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
