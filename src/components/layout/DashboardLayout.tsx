import React from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { blink } from '../../lib/blink';
import { LayoutGrid, Plus, Library, Settings, LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ComponentRecord {
  id: string;
  name: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useBlinkAuth();
  const location = useLocation();
  const [recentComponents, setRecentComponents] = useState<ComponentRecord[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      blink.db.components.list({ limit: 5, order: 'desc' }).then(({ records }) => {
        setRecentComponents(records as ComponentRecord[]);
      });
    }
  }, [isAuthenticated, location.pathname]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">UI Component Genie</h1>
        <p className="text-muted-foreground">Sign in to start generating components</p>
        <Button onClick={() => blink.auth.login(window.location.href)}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r flex flex-col bg-sidebar">
        <div className="h-16 border-b flex items-center px-6 gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Plus className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">Component Genie</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 px-3"
            >
              <Plus className="w-4 h-4" />
              New Component
            </Button>
          </Link>
          <Link to="/library">
            <Button 
              variant={location.pathname === '/library' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 px-3"
            >
              <Library className="w-4 h-4" />
              My Library
            </Button>
          </Link>
          <Link to="/browse">
            <Button 
              variant={location.pathname === '/browse' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 px-3"
            >
              <LayoutGrid className="w-4 h-4" />
              Browse Community
            </Button>
          </Link>
        </nav>

        {isAuthenticated && recentComponents.length > 0 && (
          <div className="px-6 py-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Recent</h3>
            <div className="space-y-1">
              {recentComponents.map(comp => (
                <Link key={comp.id} to={`/library?id=${comp.id}`} className="block">
                  <div className="text-sm px-1 py-1 hover:text-primary transition-colors truncate">
                    {comp.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t space-y-1">
          <Link to="/settings">
            <Button 
              variant={location.pathname === '/settings' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 px-3"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => blink.auth.signOut()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center px-8 justify-between bg-background">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <Button size="sm">Share Library</Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
};
