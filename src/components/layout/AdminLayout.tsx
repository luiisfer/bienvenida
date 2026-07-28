import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { QrCode, LayoutDashboard, ListChecks, Users, Settings, LogOut, Menu, X, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Generar QR', href: '/admin/qr', icon: QrCode },
    { name: 'Asistencias', href: '/admin/asistencias', icon: ListChecks },
    { name: 'Histórico', href: '/admin/historico', icon: History },
    { name: 'Alumnos', href: '/admin/alumnos', icon: Users },
    { name: 'Configuración', href: '/admin/config', icon: Settings },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-col border-r bg-background hidden md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src="/logoparroquia.jpg" className="h-7 w-7 rounded-full object-cover border" alt="Logo Parroquia" />
            <span className="text-base font-bold tracking-tight">Asistencia</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground px-2 truncate">
              {user?.email}
            </p>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-background pt-5 pb-4 border-r animate-in slide-in-from-left duration-200">
            <div className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center px-6 mb-6">
              <Link to="/" className="flex items-center gap-2 font-semibold" onClick={handleLinkClick}>
                <img src="/logoparroquia.jpg" className="h-7 w-7 rounded-full object-cover border" alt="Logo Parroquia" />
                <span className="text-base font-bold tracking-tight">Asistencia</span>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="border-t p-4 mt-auto">
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground px-2 truncate">
                  {user?.email}
                </p>
                <Button variant="outline" className="w-full justify-start gap-2 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-xl">
              {navigation.find((item) => location.pathname.startsWith(item.href))?.name || 'Admin'}
            </h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
