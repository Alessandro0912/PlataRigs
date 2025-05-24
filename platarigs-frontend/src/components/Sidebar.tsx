import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Package, Wrench, ClipboardList, Users, Settings, LogOut, DollarSign, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://geizhals.de/?fs=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">PlataRigs</h1>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <Link to="/dashboard">
            <Button
              variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Package className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <Link to="/builds">
            <Button
              variant={location.pathname === '/builds' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Wrench className="mr-2 h-4 w-4" />
              Builds
            </Button>
          </Link>

          <Link to="/pc-builder">
            <Button
              variant={location.pathname === '/pc-builder' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Monitor className="mr-2 h-4 w-4" />
              3D PC Builder
            </Button>
          </Link>

          <Link to="/price-comparison">
            <Button
              variant={location.pathname === '/price-comparison' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Preisvergleich
            </Button>
          </Link>

          <Link to="/tasks">
            <Button
              variant={location.pathname === '/tasks' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Aufgaben1
            </Button>
          </Link>

          <Link to="/users">
            <Button
              variant={location.pathname === '/users' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Benutzer
            </Button>
          </Link>

          <Link to="/settings">
            <Button
              variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </Button>
          </Link>
        </nav>
      </div>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </div>
  );
} 