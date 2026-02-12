import { Home, Search, ShoppingBag, User, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/search', label: 'Buscar', icon: Search },
  { path: '/orders', label: 'Pedidos', icon: ClipboardList },
  { path: '/profile', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-header border-t border-primary/20 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-evenly h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-lg transition-colors flex-1 max-w-[72px]',
                isActive 
                  ? 'text-header-text bg-black/10' 
                  : 'text-header-text/70 hover:text-header-text hover:bg-black/5'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Cart as drawer trigger */}
        <CartDrawer
          trigger={
            <button className="flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-lg transition-colors flex-1 max-w-[72px] text-header-text/70 hover:text-header-text hover:bg-black/5 relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute top-0.5 right-2 h-4 w-4 flex items-center justify-center p-0 text-[9px]">
                  {totalItems}
                </Badge>
              )}
              <span className="text-[10px] font-medium truncate">Carrinho</span>
            </button>
          }
        />
      </div>
    </nav>
  );
}
