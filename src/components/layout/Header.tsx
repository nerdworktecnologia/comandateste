import { useState } from 'react';
import { Search, MapPin, Menu, Bell, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="container mx-auto px-4 py-3">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="py-4">
                  <Logo size="md" />
                  <nav className="mt-8 space-y-2">
                    <Link to="/" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Início
                    </Link>
                    <Link to="/search" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Buscar
                    </Link>
                    <Link to="/orders" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Meus Pedidos
                    </Link>
                    <Link to="/profile" className="block py-2 px-4 rounded-lg hover:bg-muted">
                      Meu Perfil
                    </Link>
                    <hr className="my-4" />
                    <Link to="/for-business" className="block py-2 px-4 rounded-lg hover:bg-muted text-primary">
                      Para Empresas
                    </Link>
                    <Link to="/for-drivers" className="block py-2 px-4 rounded-lg hover:bg-muted text-secondary">
                      Seja Entregador
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Location */}
          <button className="hidden md:flex items-center gap-2 text-sm hover:bg-muted px-3 py-2 rounded-lg transition-colors">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Entregar em</span>
            <span className="font-medium truncate max-w-[150px]">
              {profile?.address || 'Definir endereço'}
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-primary">
                3
              </Badge>
            </Button>
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-secondary">
                  2
                </Badge>
              </Button>
            </Link>

            {user ? (
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos, lojas ou categorias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </div>
    </header>
  );
}
