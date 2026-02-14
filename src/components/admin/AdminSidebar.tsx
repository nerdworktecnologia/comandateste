import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Users, ClipboardList, 
  Settings, LogOut, ShieldCheck, Bell, Tag
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/stores', icon: Store, label: 'Empresas' },
  { to: '/admin/orders', icon: ClipboardList, label: 'Pedidos' },
  { to: '/admin/categories', icon: Tag, label: 'Categorias' },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
  { to: '/admin/push', icon: Bell, label: 'Push Notifications' },
  { to: '/admin/settings', icon: Settings, label: 'Configurações' },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-secondary text-secondary-foreground hidden lg:flex flex-col">
      <div className="p-4 border-b border-secondary-foreground/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <Logo size="sm" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Painel Administrativo</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary-foreground/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-secondary-foreground/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-foreground/10 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
