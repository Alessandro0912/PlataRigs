import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Archive, Box, Search, Trello, Database, List, Monitor } from 'lucide-react';

const menuItems = [
  {
    title: 'Lager',
    icon: Archive,
    path: '/inventory'
  },
  {
    title: 'Builds',
    icon: Box,
    path: '/builds'
  },
  {
    title: '3D PC Builder',
    icon: Monitor,
    path: '/pc-builder'
  },
  {
    title: 'Preisvergleich',
    icon: Search,
    path: '/price-comparison'
  },
  {
    title: 'Aufgaben',
    icon: Trello,
    path: '/tasks'
  }
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">PR</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">PlataRigs</h2>
            <p className="text-sm text-muted-foreground">PC-Verwaltung</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className="w-full justify-start space-x-3"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Abmelden
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
